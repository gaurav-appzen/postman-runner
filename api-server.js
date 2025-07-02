const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true
}));

app.use(express.json());

let postmanCollection = null;
let postmanEnvironment = null;

async function loadPostmanFiles() {
    try {
        const collectionData = await fs.readFile('./AAP APIS.postman_collection.json', 'utf8');
        const environmentData = await fs.readFile('./Autonomous AP ENFT QE Test.postman_environment.json', 'utf8');

        postmanCollection = JSON.parse(collectionData);
        postmanEnvironment = JSON.parse(environmentData);

        console.log(`✅ Loaded collection: ${postmanCollection.info.name}`);
        console.log(`✅ Loaded environment: ${postmanEnvironment.name}`);
    } catch (error) {
        console.error('❌ Error loading Postman files:', error.message);
    }
}

function substituteVariables(text, environment) {
    if (!text) return text;
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
        const envVar = environment.values.find(v => v.key === variable.trim());
        return envVar ? envVar.value : match;
    });
}

function buildUrl(urlObj, environment) {
    if (typeof urlObj === 'string') {
        return substituteVariables(urlObj, environment);
    }

    if (urlObj.raw) {
        return substituteVariables(urlObj.raw, environment);
    }

    if (urlObj.host && urlObj.path) {
        const protocol = urlObj.protocol || 'https';
        const host = Array.isArray(urlObj.host) ? urlObj.host.join('.') : urlObj.host;
        const path = Array.isArray(urlObj.path) ? urlObj.path.join('/') : urlObj.path;
        const url = `${protocol}://${host}/${path}`;
        return substituteVariables(url, environment);
    }

    return '';
}

async function executePreRequestScript(api, environment) {
    if (!api.event) return;

    const preRequestEvent = api.event.find(e => e.listen === 'prerequest');
    if (!preRequestEvent || !preRequestEvent.script || !preRequestEvent.script.exec) {
        return;
    }

    const scriptCode = Array.isArray(preRequestEvent.script.exec)
        ? preRequestEvent.script.exec.join('\n')
        : preRequestEvent.script.exec;

    try {
        const postmanAPI = {
            setEnvironmentVariable: (key, value) => {
                const existingVar = environment.values.find(v => v.key === key);
                if (existingVar) {
                    existingVar.value = value.toString();
                } else {
                    environment.values.push({
                        key: key,
                        value: value.toString(),
                        enabled: true
                    });
                }
            },
            getEnvironmentVariable: (key) => {
                const envVar = environment.values.find(v => v.key === key);
                return envVar ? envVar.value : undefined;
            }
        };

        const _ = {
            random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
        };

        const wrappedScript = `
            function setEnvironmentVariable(key, value) {
                postman.setEnvironmentVariable(key, value);
            }

            function getEnvironmentVariable(key) {
                return postman.getEnvironmentVariable(key);
            }

            ${scriptCode}
        `;

        const scriptFunction = new Function('postman', '_', 'console', wrappedScript);
        scriptFunction(postmanAPI, _, console);

    } catch (error) {
        console.warn('Pre-request script execution failed:', error.message);
    }
}

async function executeTestScript(api, response, environment) {
    if (!api.event) return;

    const testEvent = api.event.find(e => e.listen === 'test');
    if (!testEvent || !testEvent.script || !testEvent.script.exec) {
        return;
    }

    const scriptCode = Array.isArray(testEvent.script.exec)
        ? testEvent.script.exec.join('\n')
        : testEvent.script.exec;

    try {
        const postmanAPI = {
            setEnvironmentVariable: (key, value) => {
                const existingVar = environment.values.find(v => v.key === key);
                if (existingVar) {
                    existingVar.value = value.toString();
                } else {
                    environment.values.push({
                        key: key,
                        value: value.toString(),
                        enabled: true
                    });
                }
            },
            getEnvironmentVariable: (key) => {
                const envVar = environment.values.find(v => v.key === key);
                return envVar ? envVar.value : undefined;
            }
        };

        const wrappedScript = `
            var responseBody = ${JSON.stringify(response.body)};

            function setEnvironmentVariable(key, value) {
                postman.setEnvironmentVariable(key, value);
            }

            function getEnvironmentVariable(key) {
                return postman.getEnvironmentVariable(key);
            }

            ${scriptCode}
        `;

        const scriptFunction = new Function('postman', '_', 'console', 'responseBody', wrappedScript);
        scriptFunction(postmanAPI, {}, console, response.body);

    } catch (error) {
        console.warn('Test script execution failed:', error.message);
    }
}

async function executeAPI(api, environment, order) {
    const startTime = Date.now();

    console.log(`\n🚀 Executing API ${order}: ${api.name}`);

    try {
        await executePreRequestScript(api, environment);

        const url = buildUrl(api.request.url, environment);
        const method = api.request.method || 'GET';

        const headers = {};
        if (api.request.header) {
            api.request.header.forEach(header => {
                if (!header.disabled && header.key && header.value) {
                    headers[header.key] = substituteVariables(header.value, environment);
                }
            });
        }

        let body = null;
        if (api.request.body && api.request.body.mode === 'raw' && api.request.body.raw) {
            body = substituteVariables(api.request.body.raw, environment);
        }

        console.log(`📡 ${method} ${url}`);

        const response = await fetch(url, {
            method,
            headers,
            body
        });

        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }

        const responseInfo = {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseText
        };

        if (response.ok) {
            await executeTestScript(api, responseInfo, environment);
        }

        const endTime = Date.now();

        const result = {
            apiName: api.name,
            order: order,
            status: response.ok ? 'success' : 'error',
            statusCode: response.status,
            statusText: response.statusText,
            responseTime: endTime - startTime,
            response: responseData,
            timestamp: new Date().toISOString()
        };

        console.log(`✅ API ${order} completed: ${response.status} ${response.statusText} (${result.responseTime}ms)`);
        return result;

    } catch (error) {
        console.error(`❌ API ${order} failed:`, error.message);

        const endTime = Date.now();
        return {
            apiName: api.name,
            order: order,
            status: 'error',
            error: error.message,
            responseTime: endTime - startTime,
            timestamp: new Date().toISOString()
        };
    }
}

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        server: 'API Server running on port ' + PORT,
        collection: postmanCollection ? postmanCollection.info.name : 'Not loaded',
        environment: postmanEnvironment ? postmanEnvironment.name : 'Not loaded'
    });
});

app.get('/collection', (req, res) => {
    if (!postmanCollection) {
        return res.status(404).json({ error: 'Collection not loaded' });
    }

    res.json({
        info: postmanCollection.info,
        items: postmanCollection.item.map((item, index) => ({
            index,
            name: item.name,
            method: item.request.method,
            url: item.request.url
        }))
    });
});

app.get('/environment', (req, res) => {
    if (!postmanEnvironment) {
        return res.status(404).json({ error: 'Environment not loaded' });
    }

    res.json(postmanEnvironment);
});

app.post('/get-customer-key', async (req, res) => {
    const { customerId } = req.body;

    if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
    }

    try {
        const url = `https://external-authn.enft.dev.appzen.com/v1/authn-config/customers/${customerId}/products/Atlas/external-platforms/DICTIONARY_DATA_SERVICE`;
        const apiKey = 'KK8LHr8kkjqnBp';

        console.log(`🔑 Fetching customer key for customer ID: ${customerId}`);
        console.log(`📡 GET ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey
            }
        });

        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }

                        if (response.ok) {
            console.log(`✅ Customer key retrieved successfully`);

            // Set customer-id environment variable
            const existingCustomerIdVar = postmanEnvironment.values.find(v => v.key === 'customer-id');
            if (existingCustomerIdVar) {
                existingCustomerIdVar.value = customerId;
            } else {
                postmanEnvironment.values.push({
                    key: 'customer-id',
                    value: customerId,
                    enabled: true
                });
            }
            console.log(`✅ Updated customer-id with value: ${customerId}`);

            let customerKeyFromResponse = null;
            if (responseData && responseData.credentials_json && responseData.credentials_json.apikey) {
                customerKeyFromResponse = responseData.credentials_json.apikey;

                const existingCustomerKeyVar = postmanEnvironment.values.find(v => v.key === 'customer-key');
                if (existingCustomerKeyVar) {
                    existingCustomerKeyVar.value = customerKeyFromResponse;
                } else {
                    postmanEnvironment.values.push({
                        key: 'customer-key',
                        value: customerKeyFromResponse,
                        enabled: true
                    });
                }

                console.log(`✅ Updated customer-key with value from credentials_json.apikey`);
            }

            res.json({
                success: true,
                customerKey: customerKeyFromResponse,
                response: responseData
            });
        } else {
            console.log(`❌ Failed to get customer key: ${response.status} ${response.statusText}`);
            res.status(response.status).json({
                success: false,
                error: `Failed to get customer key: ${response.status} ${response.statusText}`,
                response: responseData
            });
        }

    } catch (error) {
        console.error(`❌ Error fetching customer key:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/execute-apis', async (req, res) => {
    const { selectedApiIndices, environment } = req.body;

    if (!postmanCollection) {
        return res.status(400).json({ error: 'Collection not loaded' });
    }

    if (!selectedApiIndices || !selectedApiIndices.length) {
        return res.status(400).json({ error: 'No APIs selected' });
    }

    const workingEnvironment = environment || postmanEnvironment;
    const results = [];

    console.log(`\n🎯 Starting execution of ${selectedApiIndices.length} APIs`);

    for (let i = 0; i < selectedApiIndices.length; i++) {
        const apiIndex = selectedApiIndices[i];
        const api = postmanCollection.item[apiIndex];

        if (!api) {
            results.push({
                apiName: `API ${apiIndex}`,
                order: i + 1,
                status: 'error',
                error: 'API not found',
                timestamp: new Date().toISOString()
            });
            continue;
        }

        const result = await executeAPI(api, workingEnvironment, i + 1);
        results.push(result);
    }

    console.log(`\n🏁 Execution completed: ${results.length} APIs processed`);

    res.json({
        success: true,
        totalApis: selectedApiIndices.length,
        results: results,
        environment: workingEnvironment,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, async () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`🌐 Serving frontend from: http://localhost:8000`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  /health - Server health check`);
    console.log(`   GET  /collection - Get Postman collection info`);
    console.log(`   GET  /environment - Get environment variables`);
    console.log(`   POST /get-customer-key - Get customer key from auth service`);
    console.log(`   POST /execute-apis - Execute selected APIs`);

    console.log(`\n📚 Loading Postman files...`);
    await loadPostmanFiles();
});
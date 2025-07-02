class PostmanRunner {
    constructor() {
        this.collection = null;
        this.environment = null;
        this.apis = [];
        this.selectedApis = [];
        this.executionResults = [];
        this.isExecuting = false;
        this.apiBaseUrl = 'http://localhost:3001';
    }

    async initializeApp() {
        try {
            await this.loadCollectionFromServer();
            await this.loadEnvironmentFromServer();
            this.renderApis();
            this.renderEnvironmentVars();
            this.setupEventListeners();
            this.updateExecuteButton();
        } catch (error) {
            this.showError('Failed to initialize app: ' + error.message);
        }
    }

    async loadCollectionFromServer() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/collection`);
            if (!response.ok) {
                throw new Error(`Failed to load collection: ${response.statusText}`);
            }

            const data = await response.json();
            this.collection = data;
            this.apis = data.items || [];

            console.log(`✅ Loaded collection: ${data.info.name} (${this.apis.length} APIs)`);
        } catch (error) {
            throw new Error(`Collection loading failed: ${error.message}`);
        }
    }

    async loadEnvironmentFromServer() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/environment`);
            if (!response.ok) {
                throw new Error(`Failed to load environment: ${response.statusText}`);
            }

            this.environment = await response.json();

            console.log(`✅ Loaded environment: ${this.environment.name} (${this.environment.values.length} variables)`);
        } catch (error) {
            throw new Error(`Environment loading failed: ${error.message}`);
        }
    }

        renderApis() {
        const apiList = document.getElementById('apiList');
        if (!apiList || !this.apis.length) return;

        apiList.innerHTML = this.apis.map((api, index) => {
            const url = this.getDisplayUrl(api.url);

            return `
                <div class="api-item" data-api-index="${index}">
                    <div>
                        <span class="method ${api.method}">${api.method}</span>
                        <span class="name">${api.name}</span>
                    </div>
                    <div class="url">${url}</div>
                </div>
            `;
        }).join('');
    }

    getDisplayUrl(urlObj) {
        if (typeof urlObj === 'string') {
            return urlObj;
        }
        if (urlObj.raw) {
            return urlObj.raw;
        }
        if (urlObj.host && urlObj.path) {
            const host = Array.isArray(urlObj.host) ? urlObj.host.join('.') : urlObj.host;
            const path = Array.isArray(urlObj.path) ? urlObj.path.join('/') : urlObj.path;
            return `https://${host}/${path}`;
        }
        return 'URL not available';
    }

    renderEnvironmentVars() {
        const envVars = document.getElementById('envVars');
        if (!envVars || !this.environment || !this.environment.values) return;

        const varsHtml = this.environment.values
            .filter(variable => variable.enabled !== false)
            .map(variable => `
                <div class="env-var">
                    <span class="key">${variable.key}</span>
                    <span class="value">${this.maskSensitiveValue(variable.key, variable.value)}</span>
                </div>
            `).join('');

        envVars.innerHTML = varsHtml || '<div class="loading">No environment variables found</div>';
    }

    maskSensitiveValue(key, value) {
        const sensitiveKeys = ['key', 'token', 'password', 'secret'];
        const isSensitive = sensitiveKeys.some(keyword =>
            key.toLowerCase().includes(keyword.toLowerCase())
        );

        if (isSensitive && value && value.length > 8) {
            return value.substring(0, 4) + '••••' + value.substring(value.length - 4);
        }

        return value;
    }

    setupEventListeners() {
        const apiList = document.getElementById('apiList');
        if (apiList) {
            apiList.addEventListener('click', (e) => {
                const apiItem = e.target.closest('.api-item');
                if (apiItem) {
                    const apiIndex = parseInt(apiItem.dataset.apiIndex);
                    this.toggleApiSelection(apiIndex, apiItem);
                }
            });
        }

        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.executeApis());
        }

        const selectAllBtn = document.getElementById('selectAllBtn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAllApis());
        }

        const selectNoneBtn = document.getElementById('selectNoneBtn');
        if (selectNoneBtn) {
            selectNoneBtn.addEventListener('click', () => this.selectNoneApis());
        }

        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSelection());
        }

        const clearAllErrorsBtn = document.getElementById('clearAllErrorsBtn');
        if (clearAllErrorsBtn) {
            clearAllErrorsBtn.addEventListener('click', () => this.clearAllErrors());
        }

        const clearAllResultsBtn = document.getElementById('clearAllResultsBtn');
        if (clearAllResultsBtn) {
            clearAllResultsBtn.addEventListener('click', () => this.clearAllResults());
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove')) {
                const selectedIndex = parseInt(e.target.dataset.selectedIndex);
                this.removeSelectedApi(selectedIndex);
            }

            if (e.target.classList.contains('clear-error-btn')) {
                const resultId = e.target.dataset.resultId;
                this.clearError(resultId);
            }
        });

        const getCustomerKeyBtn = document.getElementById('getCustomerKeyBtn');
        if (getCustomerKeyBtn) {
            getCustomerKeyBtn.addEventListener('click', () => this.getCustomerKey());
        }
    }

    toggleApiSelection(apiIndex, element) {
        const api = this.apis[apiIndex];
        if (!api) return;

        const existingIndex = this.selectedApis.findIndex(item => item.index === apiIndex);

        if (existingIndex >= 0) {
            this.selectedApis.splice(existingIndex, 1);
            element.classList.remove('selected');
        } else {
            this.selectedApis.push({
                index: apiIndex,
                api: api,
                name: api.name,
                method: api.method,
                url: this.getDisplayUrl(api.url)
            });
            element.classList.add('selected');
        }

        this.renderSelectedApis();
        this.updateSelectionInfo();
        this.updateExecuteButton();
    }

    renderSelectedApis() {
        const selectedApis = document.getElementById('selectedApis');
        if (!selectedApis) return;

        this.updateSelectionInfo();

        if (this.selectedApis.length === 0) {
            selectedApis.innerHTML = `
                <div class="empty-state">
                    <p>No APIs selected yet. Select APIs from the left panel to add them to the execution queue.</p>
                </div>
            `;
            return;
        }

        // Sort selected APIs by their original index to maintain list order
        const sortedSelectedApis = [...this.selectedApis].sort((a, b) => a.index - b.index);

        const selectedHtml = sortedSelectedApis.map((item, displayOrder) => {
            const originalSelectedIndex = this.selectedApis.findIndex(api => api.index === item.index);
            return `
                <div class="selected-api" data-selected-index="${originalSelectedIndex}">
                    <div class="order">${displayOrder + 1}</div>
                    <div class="info">
                        <div>
                            <span class="method ${item.method}">${item.method}</span>
                            <span class="name">${item.name}</span>
                        </div>
                        <div class="url">${item.url}</div>
                    </div>
                    <button class="remove" data-selected-index="${originalSelectedIndex}">×</button>
                </div>
            `;
        }).join('');

        selectedApis.innerHTML = selectedHtml;
    }

    updateSelectionInfo() {
        const selectionInfo = document.getElementById('selectionInfo');
        const totalApis = this.apis.length;
        const selectedCount = this.selectedApis.length;

        if (selectionInfo) {
            selectionInfo.innerHTML = `
                <span class="selection-count">
                    ${selectedCount} of ${totalApis} APIs selected
                    ${selectedCount > 0 ? `(${((selectedCount / totalApis) * 100).toFixed(0)}%)` : ''}
                </span>
            `;
        }
    }

        removeSelectedApi(selectedIndex) {
        const removedItem = this.selectedApis[selectedIndex];
        this.selectedApis.splice(selectedIndex, 1);

        const apiElement = document.querySelector(`[data-api-index="${removedItem.index}"]`);
        if (apiElement) {
            apiElement.classList.remove('selected');
        }

        this.renderSelectedApis();
        this.updateExecuteButton();
    }

        clearSelection() {
        this.selectedApis = [];
        document.querySelectorAll('.api-item.selected').forEach(el => {
            el.classList.remove('selected');
        });
        this.renderSelectedApis();
        this.updateExecuteButton();
    }

    updateExecuteButton() {
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.disabled = this.selectedApis.length === 0 || this.isExecuting;
        }
    }

    selectAllApis() {
        if (!this.apis.length) return;

        const unselectedApiItems = document.querySelectorAll('.api-item:not(.selected)');

        unselectedApiItems.forEach((element) => {
            const apiIndex = parseInt(element.dataset.apiIndex);

            if (!isNaN(apiIndex) && this.apis[apiIndex]) {
                const api = this.apis[apiIndex];

                this.selectedApis.push({
                    index: apiIndex,
                    api: api,
                    name: api.name,
                    method: api.method,
                    url: this.getDisplayUrl(api.url)
                });
                element.classList.add('selected');
            }
        });

        this.renderSelectedApis();
        this.updateExecuteButton();
    }

    selectNoneApis() {
        const selectedItems = document.querySelectorAll('.api-item.selected');

        this.selectedApis = [];

        selectedItems.forEach((element) => {
            element.classList.remove('selected');
        });

        this.renderSelectedApis();
        this.updateExecuteButton();
    }

        async executeApis() {
        if (this.selectedApis.length === 0 || this.isExecuting) return;

        this.isExecuting = true;
        this.executionResults = [];
        this.updateExecuteButton();

        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div id="executionResults"></div>
        `;

        const progressFill = document.getElementById('progressFill');
        const executionResults = document.getElementById('executionResults');

        try {
            console.log(`🚀 Starting execution of ${this.selectedApis.length} APIs`);

            // Sort selected APIs by their original index to maintain execution order
            const sortedSelectedApis = [...this.selectedApis].sort((a, b) => a.index - b.index);
            const selectedApiIndices = sortedSelectedApis.map(api => api.index);

            const response = await fetch(`${this.apiBaseUrl}/execute-apis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    selectedApiIndices: selectedApiIndices,
                    environment: this.environment
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (progressFill) progressFill.style.width = '100%';

            if (data.success && data.results) {
                this.executionResults = data.results;
                this.environment = data.environment;
                this.renderEnvironmentVars();

                data.results.forEach(result => {
                    this.renderResult(result, executionResults);
                });

                console.log(`✅ Execution completed: ${data.results.length} APIs processed`);
            } else {
                throw new Error('Invalid response from server');
            }

        } catch (error) {
            console.error('❌ Execution failed:', error);
            this.showError(`Execution failed: ${error.message}`);
        } finally {
            this.isExecuting = false;
            this.updateExecuteButton();
        }
    }

        renderResult(result, container) {
        if (!container) return;

        const resultId = `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const isError = result.status === 'error';

        const resultHtml = `
            <div class="result-item ${isError ? 'error' : ''}" id="${resultId}">
                <div class="result-header">
                    <div class="left-content">
                        <div class="api-name">${result.order}. ${result.apiName}</div>
                        <div class="status ${result.status}">
                            ${result.status.toUpperCase()}
                            ${result.statusCode ? ` (${result.statusCode})` : ''}
                            ${result.responseTime ? ` - ${result.responseTime}ms` : ''}
                        </div>
                    </div>
                    <button class="clear-error-btn" data-result-id="${resultId}">
                        ✕ Clear
                    </button>
                </div>
                <div class="result-body">
                    ${result.error ?
                        `<div style="color: #f56565; font-weight: 600;">Error: ${result.error}</div>` :
                        ''
                    }
                    ${result.response ?
                        `<div><strong>Response:</strong></div><pre>${JSON.stringify(result.response, null, 2)}</pre>` :
                        ''
                    }
                    <div style="font-size: 0.8rem; color: #718096; margin-top: 10px;">
                        Executed at: ${new Date(result.timestamp).toLocaleString()}
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', resultHtml);
        container.scrollTop = container.scrollHeight;

        this.updateResultsControls();
    }

    showError(message) {
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="result-item">
                    <div class="result-header">
                        <div class="api-name">Error</div>
                        <div class="status error">ERROR</div>
                    </div>
                    <div class="result-body">
                        <div style="color: #f56565;">${message}</div>
                    </div>
                </div>
            `;
        }
    }

    clearError(resultId) {
        const resultElement = document.getElementById(resultId);
        if (resultElement) {
            resultElement.remove();
            this.updateResultsControls();
        }
    }

        clearAllErrors() {
        const errorItems = document.querySelectorAll('.result-item.error');
        errorItems.forEach(item => item.remove());
        this.updateResultsControls();
    }

    clearAllResults() {
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <p>Results will appear here after execution.</p>
                </div>
            `;
        }
        this.executionResults = [];
        this.updateResultsControls();
    }

    updateResultsControls() {
        const resultsControls = document.getElementById('resultsControls');
        const resultItems = document.querySelectorAll('.result-item');
        const errorItems = document.querySelectorAll('.result-item.error');

        if (resultItems.length > 0) {
            resultsControls.style.display = 'flex';

            const clearAllErrorsBtn = document.getElementById('clearAllErrorsBtn');
            const clearAllResultsBtn = document.getElementById('clearAllResultsBtn');

            if (clearAllErrorsBtn) {
                clearAllErrorsBtn.style.display = errorItems.length > 0 ? 'block' : 'none';
            }

            if (clearAllResultsBtn) {
                clearAllResultsBtn.style.display = 'block';
            }
        } else {
            resultsControls.style.display = 'none';
        }
    }

    async getCustomerKey() {
        const customerIdInput = document.getElementById('customerIdInput');
        const getCustomerKeyBtn = document.getElementById('getCustomerKeyBtn');
        const customerKeyResult = document.getElementById('customerKeyResult');

        if (!customerIdInput || !getCustomerKeyBtn || !customerKeyResult) return;

        const customerId = customerIdInput.value.trim();
        if (!customerId) {
            this.showAuthResult('Please enter a customer ID', 'error');
            return;
        }

        try {
            getCustomerKeyBtn.disabled = true;
            getCustomerKeyBtn.innerHTML = '⏳ Getting Customer Key...';

            const response = await fetch(`${this.apiBaseUrl}/get-customer-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ customerId })
            });

            const data = await response.json();

                                    if (response.ok && data.success) {
                if (data.customerKey) {
                    this.showAuthResult(`✅ Customer Key Updated: ${data.customerKey.substring(0, 8)}...`, 'success');
                } else {
                    this.showAuthResult(`✅ Authentication successful`, 'success');
                }

                await this.loadEnvironmentFromServer();
                this.renderEnvironmentVars();
            } else {
                this.showAuthResult(`❌ ${data.error || 'Failed to get customer key'}`, 'error');
            }

        } catch (error) {
            this.showAuthResult(`❌ Error: ${error.message}`, 'error');
        } finally {
            getCustomerKeyBtn.disabled = false;
            getCustomerKeyBtn.innerHTML = '🔑 Get Customer Key';
        }
    }

    showAuthResult(message, type) {
        const customerKeyResult = document.getElementById('customerKeyResult');
        if (!customerKeyResult) return;

        customerKeyResult.innerHTML = message;
        customerKeyResult.className = `auth-result ${type}`;
        customerKeyResult.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                customerKeyResult.style.display = 'none';
            }, 5000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Postman API Runner...');
    const runner = new PostmanRunner();
    runner.initializeApp().catch(error => {
        console.error('❌ Failed to initialize app:', error);
    });
});
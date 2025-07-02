# 🚀 Postman Collection Runner

A modern web application that allows you to execute Postman collections directly in your browser with a user-friendly interface. Select specific APIs, customize execution order, and view detailed results with proper variable handling and script execution.

## ✨ Features

- **📋 API Selection**: Browse and select specific APIs from your Postman collection
- **🔄 Custom Execution Order**: Choose which APIs to run and in what sequence
- **🔧 Environment Variables**: Full support for Postman environment variables with real-time updates
- **📝 Script Execution**: Handles pre-request and post-response scripts from your collection
- **📊 Detailed Results**: View execution results with response data, timing, and status codes
- **🎨 Modern UI**: Clean, responsive interface with progress tracking
- **⚡ Real-time Updates**: Environment variables update dynamically as scripts execute

## 🛠️ Setup

1. **Place your files**: Ensure the following files are in the same directory as the web application:
   - `AAP APIS.postman_collection.json` (your Postman collection)
   - `Autonomous AP ENFT QE Test.postman_environment.json` (your environment variables)

2. **Serve the application**: Since the app loads JSON files via fetch API, you need to serve it through a web server (not just open the HTML file directly). You can use:

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Python 2
   python -m SimpleHTTPServer 8000

   # Using Node.js (if you have http-server installed)
   npx http-server

   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**: Navigate to `http://localhost:8000` in your web browser

## 🎯 How to Use

### 1. **View Available APIs**
- The left sidebar shows all APIs from your Postman collection
- Each API displays its HTTP method, name, and URL
- APIs are color-coded by method (GET=green, POST=orange, etc.)

### 2. **Select APIs for Execution**
- Click on any API in the left panel to add it to your execution queue
- Selected APIs appear in the main panel with execution order numbers
- You can remove APIs by clicking the × button next to each selected API

### 3. **Monitor Environment Variables**
- The bottom left shows all environment variables from your Postman environment
- Variables update in real-time as pre-request and post-response scripts execute
- Empty variables show as "(empty)"

### 4. **Execute APIs**
- Click the "Execute Selected APIs" button to run your selected APIs in order
- A progress bar shows execution progress
- Results appear in real-time as each API completes

### 5. **View Results**
- Each result shows:
  - API name and execution order
  - Status (success/error) with HTTP status code
  - Response time in milliseconds
  - Full response data (formatted JSON)
  - Execution timestamp

## 🔧 Script Support

The application supports Postman's pre-request and test scripts:

### Pre-request Scripts
- Execute before the API call
- Can set environment variables using `postman.setEnvironmentVariable()`
- Support for `_.random()` function for generating random values
- Variables are automatically substituted in URLs, headers, and request bodies

### Post-response Scripts (Test Scripts)
- Execute after receiving the API response
- Can access response data via `responseBody` variable
- Can parse JSON and set environment variables for subsequent requests
- Support for `JSON.parse(responseBody)` to extract data

### Supported Functions
- `postman.setEnvironmentVariable(key, value)` - Set environment variables
- `postman.getEnvironmentVariable(key)` - Get environment variables
- `_.random(min, max)` - Generate random numbers
- `JSON.parse()` - Parse JSON responses

## 🌐 CORS Considerations

Since the application makes HTTP requests to external APIs, you may encounter CORS (Cross-Origin Resource Sharing) issues. To handle this:

1. **Development**: Use a CORS proxy or disable CORS in your browser (not recommended for production)
2. **Production**: Ensure your APIs have proper CORS headers configured
3. **Local Testing**: Some APIs may work locally but fail when deployed due to CORS policies

## 📁 File Structure

```
postman-runner/
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── app.js             # Main application logic
├── AAP APIS.postman_collection.json
├── Autonomous AP ENFT QE Test.postman_environment.json
└── README.md          # This file
```

## 🔍 Technical Details

### Variable Substitution
- Variables in format `{{variableName}}` are automatically replaced
- Works in URLs, headers, and request bodies
- Variables are resolved from the environment at execution time

### Script Execution
- Scripts are executed in a controlled context
- Limited to safe operations (no file system access)
- Console output is redirected to browser console with "Script:" prefix

### Error Handling
- Network errors are caught and displayed
- Script execution errors are logged but don't stop execution
- Invalid JSON responses are handled gracefully

## 🚀 Customization

You can customize the application by:

1. **Modifying styles.css** for different themes or layouts
2. **Updating app.js** to add new features or modify script execution
3. **Changing index.html** to adjust the UI structure

## 🐛 Troubleshooting

**APIs not loading?**
- Ensure you're serving the files through a web server
- Check browser console for network errors
- Verify JSON file names match exactly

**CORS errors?**
- Check if your target APIs support CORS
- Consider using a development proxy
- Some APIs may only work with proper authentication

**Scripts not working?**
- Check browser console for script execution errors
- Ensure variable names match between scripts and environment
- Some Postman script features may not be fully supported

## 📝 Notes

- This is a client-side application - all execution happens in your browser
- Sensitive API keys and data remain on your local machine
- The application is designed to work with the specific Postman collection format
- For production use, consider adding authentication and error recovery features

## 🤝 Contributing

Feel free to enhance this application by:
- Adding support for more Postman script functions
- Improving error handling and user feedback
- Adding features like request/response logging
- Implementing drag-and-drop for API reordering
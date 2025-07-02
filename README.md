# 🚀 Postman Collection Runner

A comprehensive web application for executing Postman collections with a modern Node.js backend and responsive frontend. Features Chart of Accounts creation for all 14 segment types, customer authentication, environment variable management, and advanced script execution capabilities.

## ✨ Key Features

### 📋 **API Management**
- **16+ Chart of Accounts APIs**: Create COA entries for all segment types (Legal Entity, Company, Account, Department, Cost Center, Vendor, Location, User, Customer, Project, Spend Category, Region, Intercompany)
- **Smart API Selection**: Browse, select, and execute APIs in your preferred order
- **Bulk Controls**: Select All / Select None for quick management
- **Original Order Execution**: APIs execute in list order regardless of selection sequence

### 🔐 **Authentication & Security**
- **Customer Key Retrieval**: Automated customer authentication with AppZen services
- **Environment Variable Security**: Automatic masking of sensitive keys and tokens
- **Server-side Execution**: No CORS issues, API keys stay secure on server

### 🎨 **Modern Interface**
- **3-Column Layout**: APIs, Environment Variables, and Results panels
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Environment variables and results update live
- **Visual Feedback**: Distinct hover and selection states with color coding

### 🔧 **Advanced Features**
- **Pre/Post Request Scripts**: Full Postman script compatibility
- **Dynamic Variables**: Support for `{{variableName}}` substitution
- **Progress Tracking**: Real-time execution progress with timing
- **Error Management**: Individual and bulk error clearing
- **Result Persistence**: Maintain results between sessions

## 🏗️ Architecture

### Backend (Node.js API Server)
- **Express.js server** running on port 3001
- **Server-side API execution** eliminates CORS issues
- **Script execution engine** with Postman compatibility
- **Environment variable management** with real-time updates
- **Authentication handling** for customer key retrieval

### Frontend (Web Client)
- **Static file server** on port 8000
- **Modern JavaScript** with ES6+ features
- **Responsive CSS Grid** layout
- **Real-time WebSocket-style communication** with backend

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- Git (for cloning)
- Your Postman collection and environment files

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gaurav-appzen/postman-runner.git
   cd postman-runner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Place your Postman files** (replace the existing ones):
   - `AAP APIS.postman_collection.json`
   - `Autonomous AP ENFT QE Test.postman_environment.json`

4. **Start the application**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:8000
   - API Server: http://localhost:3001

## 📖 Usage Guide

### 🔑 **1. Authentication Setup**
1. Enter your Customer ID in the authentication panel
2. Click "Get Customer Key" to retrieve authentication credentials
3. Environment variables `customer-id` and `customer-key` will be automatically set

### 📋 **2. API Selection**
- **Browse APIs**: View all available APIs in the left panel
- **Select Individual APIs**: Click on any API to add to execution queue
- **Bulk Selection**: Use "Select All" or "Select None" buttons
- **Remove APIs**: Click the × button or use "Clear Selection"

### ⚙️ **3. Environment Variables**
- **View Variables**: Check current values in the environment panel
- **Automatic Updates**: Variables update as scripts execute
- **Sensitive Data**: Keys and tokens are automatically masked
- **Real-time Sync**: Changes reflect immediately across the interface

### ▶️ **4. API Execution**
1. **Review Selection**: Check selected APIs in the main panel
2. **Execute**: Click "Execute Selected APIs" button
3. **Monitor Progress**: Watch real-time progress bar and status
4. **View Results**: See detailed responses, timing, and status codes

### 📊 **5. Results Management**
- **Individual Results**: Each API shows detailed response data
- **Error Handling**: Failed requests are clearly marked
- **Clear Controls**: Remove individual errors or all results
- **Timing Data**: Response times displayed for performance analysis

## 🎛️ API Server Endpoints

### Core Endpoints
- `GET /health` - Server health check
- `GET /collection` - Retrieve Postman collection info
- `GET /environment` - Get current environment variables
- `POST /execute-apis` - Execute selected APIs with full script support
- `POST /get-customer-key` - Authenticate and retrieve customer credentials

### Authentication Flow
```
1. POST /get-customer-key
   ├── Input: { customerId: "100620" }
   ├── External API call to AppZen auth service
   ├── Extract credentials from response
   └── Update environment: customer-id, customer-key
```

## 📁 Project Structure

```
postman-runner/
├── 📄 Core Application Files
│   ├── api-server.js           # Node.js Express server
│   ├── app.js                  # Frontend JavaScript application
│   ├── index.html              # Main HTML interface
│   └── styles.css              # CSS styling & responsive design
│
├── 📋 Postman Files
│   ├── AAP APIS.postman_collection.json
│   └── Autonomous AP ENFT QE Test.postman_environment.json
│
├── 📦 Configuration
│   ├── package.json            # Dependencies & scripts
│   ├── package-lock.json       # Locked dependency versions
│   └── .gitignore             # Git ignore rules
│
├── 📚 Documentation
│   ├── README.md              # This file
│   └── SETUP.md               # Detailed setup instructions
│
└── 📎 Assets
    └── invoice1.pdf           # Test file for file upload APIs
```

## 🧪 Chart of Accounts APIs

The collection includes comprehensive Chart of Accounts creation APIs for all business segment types:

### Available Segment Types
1. **OTHER_SEGMENT** - General purpose segments
2. **LEGAL_ENTITY_SEGMENT** - Legal entity structures
3. **COMPANY_SEGMENT** - Company organizations
4. **ACCOUNT_SEGMENT** - Financial accounts
5. **DEPARTMENT_SEGMENT** - Department classifications
6. **COST_CENTER_SEGMENT** - Cost center tracking
7. **VENDOR_SEGMENT** - Vendor management
8. **LOCATION_SEGMENT** - Location-based segments
9. **USER_SEGMENT** - User-specific segments
10. **CUSTOMER_SEGMENT** - Customer classifications
11. **PROJECT_SEGMENT** - Project-based tracking
12. **SPEND_CATEGORY_SEGMENT** - Spending categories
13. **REGION_SEGMENT** - Regional classifications
14. **INTERCOMPANY_SEGMENT** - Intercompany transactions

### API Features
- **Dynamic ID Generation**: Random 6-digit codes for each segment
- **UUID Tracking**: Automatic UUID storage for created segments
- **Environment Integration**: Variables automatically updated post-creation
- **Consistent Structure**: Standardized request/response format across all segments

## 🔧 Script Execution Engine

### Supported Postman Functions
```javascript
// Environment Variables
postman.setEnvironmentVariable(key, value)
postman.getEnvironmentVariable(key)

// Utility Functions
_.random(min, max)               // Generate random numbers
JSON.parse(responseBody)         // Parse API responses

// Response Access
responseBody                     // Raw response data
response.status                  // HTTP status code
response.ok                     // Success boolean
```

### Variable Substitution
- **Format**: `{{variableName}}` in URLs, headers, and bodies
- **Resolution**: Real-time replacement during execution
- **Scope**: Environment variables from loaded Postman environment

### Script Execution Context
- **Pre-request Scripts**: Execute before API calls for setup
- **Test Scripts**: Execute after responses for data extraction
- **Error Handling**: Script errors logged but don't stop execution
- **Security**: Sandboxed execution prevents system access

## 🛠️ Development

### Available Scripts
```bash
npm start          # Start API server only
npm run frontend   # Start frontend server only
npm run server     # Start API server with auto-restart
npm run dev        # Start both servers concurrently
npm run dev:watch  # Development mode with auto-restart
```

### Environment Configuration
- **Development**: Runs on localhost with CORS disabled
- **API Server**: Port 3001 (configurable)
- **Frontend**: Port 8000 (configurable)
- **Hot Reload**: Automatic restart on file changes in development

### Adding New APIs
1. Update your Postman collection JSON file
2. Add corresponding environment variables if needed
3. Restart the server to reload collections
4. New APIs automatically appear in the interface

## 🔒 Security Considerations

### Data Protection
- **Local Processing**: All data remains on your local machine
- **No External Storage**: No data sent to third-party services
- **API Key Security**: Keys masked in UI, secure server-side handling
- **Sandboxed Scripts**: Script execution isolated from system

### CORS & Authentication
- **No CORS Issues**: Server-to-server communication eliminates browser limitations
- **Secure Headers**: Proper authentication headers for all API calls
- **Environment Isolation**: Separate environment contexts for different collections

## 🐛 Troubleshooting

### Common Issues

**Server won't start?**
- Check if ports 3001/8000 are available
- Verify Node.js version (14+ required)
- Run `npm install` to ensure dependencies

**APIs not loading?**
- Verify Postman JSON files are valid
- Check server logs for parsing errors
- Ensure file names match exactly

**Authentication failing?**
- Verify customer ID is correct
- Check network connectivity to auth service
- Review server logs for detailed error messages

**Environment variables not updating?**
- Check script syntax in Postman collection
- Verify variable names match between scripts
- Look for script execution errors in server logs

### Debug Mode
Enable verbose logging by setting environment variable:
```bash
DEBUG=postman-runner npm run dev
```

## 🤝 Contributing

We welcome contributions! Here are some areas for enhancement:

### Potential Improvements
- **Drag & Drop**: Reorder API execution sequence
- **Bulk Import**: Support for multiple collections
- **Export Features**: Save results to CSV/JSON
- **Advanced Filtering**: Search and filter APIs
- **Custom Scripts**: Add custom pre/post execution hooks
- **Performance Metrics**: Detailed timing and performance analysis

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for AppZen API testing and development
- Inspired by Postman's powerful collection execution capabilities
- Designed for seamless integration with existing AppZen workflows

---

**Repository**: https://github.com/gaurav-appzen/postman-runner
**Issues**: https://github.com/gaurav-appzen/postman-runner/issues
**Documentation**: [SETUP.md](SETUP.md) for detailed setup instructions
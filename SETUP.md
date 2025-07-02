# Postman API Runner Setup

## What's Running

1. **Frontend Server**: `http://localhost:8000` - Your Postman API Runner web app
2. **API Server**: `http://localhost:3001` - Node.js server that executes Postman collections

## How It Works

- Frontend loads collection and environment from the API server
- Frontend sends selected API indices to the API server
- API server executes the actual external API calls (no CORS issues)
- API server returns consolidated results to the frontend
- All sensitive data (API keys) stays on the server

## Quick Start (Single Command)

```bash
# Run both servers simultaneously
npm run dev
```

## Manual Setup

### Install Dependencies
```bash
npm install
```

### Start Servers Individually

```bash
# Terminal 1: Start API server (executes Postman collections)
node api-server.js

# Terminal 2: Start frontend server (serves web app)
npx http-server -p 8000 -c-1
```

## Health Check

- **API Server**: `http://localhost:3001/health`
- **Frontend App**: `http://localhost:8000`

## API Endpoints

- `GET /health` - Server health check
- `GET /collection` - Get Postman collection info
- `GET /environment` - Get environment variables
- `POST /execute-apis` - Execute selected APIs

## Features

### API Server Features
- ✅ No CORS issues (server-to-server communication)
- ✅ Secure API key handling (never exposed to browser)
- ✅ Postman script execution (pre-request & test scripts)
- ✅ Environment variable management
- ✅ Request/response logging
- ✅ Error handling with detailed messages

### Frontend Features
- ✅ Load Postman collections and environments
- ✅ Select individual APIs or bulk select all
- ✅ Execute APIs with environment variable substitution
- ✅ Pre-request script execution
- ✅ Post-response script execution
- ✅ Real-time results display
- ✅ Error management and clearing

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   lsof -i :8000

   # Kill process if needed
   kill -9 <PID>
   ```

2. **APIs Still Failing**
   - Check browser console for errors
   - Check API server logs in terminal
   - Verify both servers are running
   - Test API server health: `curl http://localhost:3001/health`
   - Verify Postman files are loaded correctly

3. **Environment Variables Not Working**
   - Check that environment file is loaded correctly
   - Verify variable names match exactly (case-sensitive)
   - Check API server logs for script execution

### Debugging

- **API Server Logs**: Check terminal running `node api-server.js`
- **Frontend Logs**: Open browser DevTools → Console
- **Network**: Browser DevTools → Network tab (requests to localhost:3001)

## Files Overview

- `api-server.js` - Node.js API server that executes Postman collections
- `app.js` - Frontend JavaScript application
- `index.html` - Main web interface
- `styles.css` - Application styling
- `package.json` - Node.js dependencies and scripts
- `AAP APIS.postman_collection.json` - Postman collection file
- `Autonomous AP ENFT QE Test.postman_environment.json` - Environment file
# QVS-Pro Deployment Guide

This document provides detailed information about the deployment setup, configuration, security measures, and maintenance procedures for the QVS-Pro application.

## Current Deployment

The QVS-Pro application is deployed on two platforms:

- **Frontend**: Deployed on [Vercel](https://vercel.com) at [https://qvspro.app](https://qvspro.app)
- **Backend API**: Deployed on [Render](https://render.com) at [https://qvspro.onrender.com](https://qvspro.onrender.com)

## Deployment Configuration

### Frontend (Vercel)

#### Configuration

1. The frontend is deployed from the `frontend` directory of the repository
2. Environment variables:
   - `REACT_APP_API_URL`: Set to `https://qvspro.onrender.com` to connect to the backend API

#### Build Settings

The `vercel.json` file in the repository root configures the build settings for Vercel:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/build",
  "framework": "create-react-app",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Backend (Render)

#### Configuration

1. The backend is deployed from the `api` directory of the repository
2. Build command: `pip install -r requirements.txt`
3. Start command: `gunicorn app:app`
4. Environment variables:
   - `PORT`: Automatically provided by Render
   - `FLASK_DEBUG`: Set to `0` for production

#### CORS Configuration

The backend API is configured to allow CORS requests from specific origins:

```python
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:3000", 
    "https://qvspro.app"
]}})
```

#### Go Scanner Binary

The Go scanner binary (`scanner/qvs-pro`) is cross-compiled for Linux to ensure compatibility with the Render environment:

```bash
GOOS=linux GOARCH=amd64 go build -o qvs-pro main.go
```

## Security Measures

### Supabase Configuration

1. **Environment Variables**: Sensitive configuration is stored in environment variables, not in the codebase

### API Security

1. **CORS Restrictions**: The API only accepts requests from specified origins
2. **No Sensitive Data in Responses**: API responses are designed to not expose sensitive information

## Maintenance Procedures

### Frontend Updates

1. Push changes to the main branch of the repository
2. Vercel will automatically detect changes and deploy the updated frontend

### Backend Updates

1. Push changes to the main branch of the repository
2. Render will automatically detect changes and deploy the updated backend

### Database Updates

1. Use the Supabase dashboard to manage database schema and data
2. For significant schema changes, coordinate with frontend and backend updates

### Monitoring

1. Use Vercel and Render dashboards to monitor application performance and errors
2. Set up alerts for critical errors or performance issues

## Troubleshooting

### Common Issues

1. **CORS Errors**: If you see CORS errors in the browser console, check that the frontend origin is correctly added to the allowed origins in the backend CORS configuration
2. **API Connection Errors**: Ensure the `REACT_APP_API_URL` environment variable is correctly set on Vercel
3. **Scanner Execution Errors**: If the scanner fails to execute, check that the binary is correctly compiled for the target platform

### Logs

1. **Frontend Logs**: Available in the Vercel dashboard
2. **Backend Logs**: Available in the Render dashboard

## Rollback Procedures

### Frontend Rollback

1. In the Vercel dashboard, select the previous deployment
2. Click "Promote to Production"

### Backend Rollback

1. In the Render dashboard, select the previous deployment
2. Click "Redeploy"

## Future Improvements

1. **CI/CD Pipeline**: Implement automated testing before deployment
2. **Containerization**: Consider containerizing the entire application for more consistent deployments
3. **Monitoring**: Add more comprehensive monitoring and alerting
4. **Backup Strategy**: Implement regular database backups

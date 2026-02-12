# Jenkins Pipeline Setup Guide

## Prerequisites

1. **Jenkins Server** with the following plugins installed:
   - Pipeline
   - Git
   - Docker Pipeline
   - SSH Agent
   - Credentials Binding

2. **Docker** installed on Jenkins server

3. **Server Access** to target deployment server (82.25.109.1)

## Jenkins Configuration

### 1. Create Credentials

Go to Jenkins → Manage Jenkins → Manage Credentials → Global → Add Credentials

#### Server SSH Password
- **Kind:** Secret text
- **ID:** `server-ssh-password`
- **Secret:** `CStp4DR@2025#`
- **Description:** SSH password for deployment server

### 2. Create Pipeline Job

1. Go to Jenkins → New Item → Pipeline
2. Name: `impact-lms-deployment`
3. Configure:
   - **Pipeline Definition:** Pipeline script from SCM
   - **SCM:** Git
   - **Repository URL:** Your Git repository URL
   - **Script Path:** `Jenkinsfile`

### 3. Environment Setup

The pipeline will automatically:
- Install Docker and Docker Compose on the target server
- Build application images
- Deploy using production configuration
- Run health checks
- Handle rollbacks on failure

## Pipeline Features

### 🚀 **Build Process**
- Parallel build of frontend and backend
- Docker image creation and tagging
- Environment-specific configuration

### 🔒 **Security**
- Image vulnerability scanning with Trivy
- Secure credential handling
- Production-ready environment variables

### 🧪 **Testing**
- Automated test execution
- Post-deployment health checks
- Service availability verification

### 📦 **Deployment**
- Zero-downtime deployment strategy
- Automated database migrations
- Service health monitoring
- Automatic rollback on failure

### 🔄 **Monitoring**
- Build artifacts retention
- Deployment logs
- Health check reports

## Deployment Flow

1. **Code Checkout** - Get latest code from repository
2. **Build** - Create Docker images for frontend and backend
3. **Test** - Run automated tests
4. **Security Scan** - Check for vulnerabilities
5. **Package** - Create deployment package
6. **Deploy** - Upload and deploy to server
7. **Verify** - Run post-deployment tests

## Server Configuration

The target server (82.25.109.1) will be configured with:
- **Application Path:** `/opt/impact-lms`
- **Database:** PostgreSQL container
- **Web Server:** Nginx proxy
- **Application Ports:**
  - HTTP: 80
  - Database: 5432 (internal)
  - Backend API: 5001 (internal)

## Triggering Deployment

### Manual Trigger
- Go to Jenkins job → Build Now

### Automatic Triggers (Optional)
Add to Jenkinsfile triggers:
```groovy
triggers {
    // Poll SCM every 5 minutes
    pollSCM('H/5 * * * *')
    
    // Or use webhook for immediate builds
    githubPush()
}
```

## Environment Variables

Production environment will use:
- Secure JWT secrets
- Production database credentials
- Proper CORS configuration
- Admin account with secure password

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify server credentials in Jenkins
   - Check server accessibility
   - Ensure SSH service is running

2. **Docker Build Failed**
   - Check Dockerfile syntax
   - Verify base image availability
   - Review build logs

3. **Deployment Failed**
   - Check server disk space
   - Verify Docker service status
   - Review deployment logs

### Log Locations

- **Jenkins Logs:** Jenkins job console output
- **Server Logs:** `/opt/impact-lms/logs/`
- **Application Logs:** `docker-compose logs`

## Backup and Recovery

- Database backups are handled by PostgreSQL container
- Application code is version controlled
- Automatic rollback on deployment failure
- Container images retained for quick recovery

## Security Considerations

- Server credentials stored securely in Jenkins
- Production secrets generated per deployment
- Regular security scanning of images
- Network isolation using Docker networks

## Monitoring

After deployment, monitor:
- Application health: `http://82.25.109.1/api/health`
- Frontend access: `http://82.25.109.1/`
- Container status: `docker-compose ps`
- Resource usage: `docker stats`
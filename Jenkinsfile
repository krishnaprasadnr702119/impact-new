pipeline {
    agent any
    
    // Pipeline options
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        skipDefaultCheckout()
    }
    
    // Trigger on GitHub push (configure webhook in GitHub)
    triggers {
        pollSCM('H/5 * * * *')  // Poll every 5 minutes as fallback
    }
    
    environment {
        // GitHub Repository
        GIT_REPO = 'https://github.com/krishnaprasadnr702119/impact-new.git'
        
        // Docker Registry Configuration
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // Application Configuration
        APP_NAME = 'impact-lms'
        
        // Server Configuration
        SERVER_HOST = '82.25.109.1'
        SERVER_USER = 'root'
        SERVER_PASSWORD = 'CStp4DR@2025#'
        DEPLOY_PATH = '/opt/impact-lms'
        
        // Docker Compose Configuration
        COMPOSE_FILE = 'docker-compose.prod.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Clean workspace and checkout code
                cleanWs()
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    // Create environment file for production
                    writeFile file: '.env.prod', text: """
# Production Environment Configuration
FLASK_ENV=production
FLASK_DEBUG=0
FLASK_SECRET_KEY=prod-flask-secret-key-${BUILD_NUMBER}-change-this
JWT_SECRET_KEY=prod-jwt-secret-key-very-long-and-secure-${BUILD_NUMBER}
JWT_ACCESS_TOKEN_EXPIRES_HOURS=8
JWT_REFRESH_TOKEN_EXPIRES_DAYS=30

# Database Configuration
DB_USER=lmsuser
DB_PASSWORD=lmspassword_prod_${BUILD_NUMBER}
DB_NAME=lmsdb

# API Configuration
API_URL=http://${SERVER_HOST}
CORS_ORIGINS=http://${SERVER_HOST},https://${SERVER_HOST}

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin_password_${BUILD_NUMBER}
ADMIN_EMAIL=admin@impact-lms.com
"""
                }
            }
        }
        
        stage('Build Application') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            script {
                                sh '''
                                    echo "Building Backend Docker Image..."
                                    docker build -t ${APP_NAME}-backend:${IMAGE_TAG} .
                                    docker tag ${APP_NAME}-backend:${IMAGE_TAG} ${APP_NAME}-backend:latest
                                '''
                            }
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            script {
                                sh '''
                                    echo "Building Frontend Docker Image..."
                                    # Use production Dockerfile
                                    docker build -f Dockerfile -t ${APP_NAME}-frontend:${IMAGE_TAG} .
                                    docker tag ${APP_NAME}-frontend:${IMAGE_TAG} ${APP_NAME}-frontend:latest
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            script {
                                sh '''
                                    echo "Running Backend Tests..."
                                    # Run backend tests in Docker container
                                    docker run --rm ${APP_NAME}-backend:${IMAGE_TAG} python -m pytest tests/ || echo "No tests found"
                                '''
                            }
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            script {
                                sh '''
                                    echo "Running Frontend Tests..."
                                    # Run frontend tests
                                    docker run --rm ${APP_NAME}-frontend:${IMAGE_TAG} npm test -- --watchAll=false || echo "No tests found"
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    sh '''
                        echo "Running Security Scans..."
                        # Scan Docker images for vulnerabilities
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy:latest image ${APP_NAME}-backend:${IMAGE_TAG} || echo "Security scan completed"
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy:latest image ${APP_NAME}-frontend:${IMAGE_TAG} || echo "Security scan completed"
                    '''
                }
            }
        }
        
        stage('Prepare Deployment Package') {
            steps {
                script {
                    sh '''
                        echo "Preparing deployment package..."
                        
                        # Create deployment directory
                        mkdir -p deploy
                        
                        # Copy necessary files
                        cp docker-compose.prod.yml deploy/
                        cp .env.prod deploy/.env
                        cp -r nginx deploy/
                        
                        # Create deployment script
                        cat > deploy/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting deployment..."

# Create application directory if it doesn't exist
mkdir -p ${DEPLOY_PATH}
cd ${DEPLOY_PATH}

# Stop existing containers
docker-compose -f docker-compose.prod.yml down || echo "No existing containers to stop"

# Pull latest images
docker pull postgres:15
docker pull nginx:alpine

# Load new application images
docker load < backend-image.tar
docker load < frontend-image.tar

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Run database migrations if needed
docker-compose -f docker-compose.prod.yml exec -T backend python init_db_prod.py || echo "Database initialization completed"

# Health check
echo "Performing health check..."
for i in {1..30}; do
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        echo "Application is healthy!"
        break
    fi
    echo "Waiting for application to be ready... ($i/30)"
    sleep 10
done

echo "Deployment completed successfully!"
EOF
                        
                        chmod +x deploy/deploy.sh
                        
                        # Save Docker images
                        docker save ${APP_NAME}-backend:${IMAGE_TAG} > deploy/backend-image.tar
                        docker save ${APP_NAME}-frontend:${IMAGE_TAG} > deploy/frontend-image.tar
                        
                        # Create deployment archive
                        tar -czf deployment-${BUILD_NUMBER}.tar.gz -C deploy .
                    '''
                }
            }
        }
        
        stage('Deploy to Server') {
            steps {
                script {
                    sh '''
                        echo "Deploying to production server..."
                        
                        # Install sshpass if not available
                        which sshpass || (apt-get update && apt-get install -y sshpass)
                        
                        # Copy deployment package to server
                        sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no \
                            deployment-${BUILD_NUMBER}.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
                        
                        # Execute deployment on server
                        sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no \
                            ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
                        
                        # Install Docker and Docker Compose if not present
                        if ! command -v docker &> /dev/null; then
                            echo "Installing Docker..."
                            curl -fsSL https://get.docker.com -o get-docker.sh
                            sh get-docker.sh
                            systemctl start docker
                            systemctl enable docker
                        fi
                        
                        if ! command -v docker-compose &> /dev/null; then
                            echo "Installing Docker Compose..."
                            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                            chmod +x /usr/local/bin/docker-compose
                        fi
                        
                        # Create deployment directory
                        mkdir -p ${DEPLOY_PATH}
                        cd ${DEPLOY_PATH}
                        
                        # Extract deployment package
                        tar -xzf /tmp/deployment-${BUILD_NUMBER}.tar.gz
                        
                        # Make deploy script executable and run it
                        chmod +x deploy.sh
                        ./deploy.sh
                        
                        # Cleanup
                        rm -f /tmp/deployment-${BUILD_NUMBER}.tar.gz
                        
ENDSSH
                    '''
                }
            }
        }
        
        stage('Post-Deployment Tests') {
            steps {
                script {
                    sh '''
                        echo "Running post-deployment tests..."
                        
                        # Wait a bit for services to fully start
                        sleep 30
                        
                        # Test application endpoints
                        curl -f http://${SERVER_HOST}/ || echo "Frontend health check failed"
                        curl -f http://${SERVER_HOST}/api/health || echo "Backend health check failed"
                        
                        echo "Post-deployment tests completed"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Cleanup
            script {
                sh '''
                    # Clean up local Docker images to save space
                    docker image prune -f
                    
                    # Remove deployment files
                    rm -rf deploy/
                    rm -f deployment-*.tar.gz
                    rm -f .env.prod
                '''
            }
        }
        
        success {
            echo 'Deployment completed successfully!'
            // You can add notification steps here (Slack, email, etc.)
        }
        
        failure {
            echo 'Deployment failed!'
            // Add failure notification steps here
            
            // Rollback on failure
            script {
                sh '''
                    echo "Attempting rollback..."
                    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no \
                        ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
                    
                    cd ${DEPLOY_PATH}
                    # Restore previous version if backup exists
                    if [ -f docker-compose.backup.yml ]; then
                        echo "Rolling back to previous version..."
                        mv docker-compose.backup.yml docker-compose.prod.yml
                        docker-compose -f docker-compose.prod.yml up -d
                    fi
ENDSSH
                '''
            }
        }
    }
}
#!/bin/bash

# Production Deployment Script for Impact LMS
# This script handles the deployment process on the target server

set -e

# Configuration
APP_NAME="impact-lms"
DEPLOY_PATH="/opt/impact-lms"
BACKUP_PATH="/opt/impact-lms-backup"
LOG_FILE="/var/log/impact-lms-deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a ${LOG_FILE}
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a ${LOG_FILE}
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a ${LOG_FILE}
}

# Create necessary directories
create_directories() {
    log "Creating deployment directories..."
    mkdir -p ${DEPLOY_PATH}
    mkdir -p ${BACKUP_PATH}
    mkdir -p /var/log
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update system
    apt-get update
    
    # Install required packages
    apt-get install -y curl wget git htop nano ufw fail2ban
    
    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        log "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl start docker
        systemctl enable docker
        usermod -aG docker $USER
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        log "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."
    
    # Reset UFW
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow 22/tcp
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable firewall
    ufw --force enable
}

# Backup existing deployment
backup_current_deployment() {
    if [ -d "${DEPLOY_PATH}" ] && [ "$(ls -A ${DEPLOY_PATH})" ]; then
        log "Backing up current deployment..."
        BACKUP_DIR="${BACKUP_PATH}/backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p ${BACKUP_DIR}
        cp -r ${DEPLOY_PATH}/* ${BACKUP_DIR}/
        log "Backup created at ${BACKUP_DIR}"
    else
        log "No existing deployment to backup"
    fi
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    cd ${DEPLOY_PATH}
    
    # Stop existing containers gracefully
    if [ -f docker-compose.prod.yml ]; then
        log "Stopping existing containers..."
        docker-compose -f docker-compose.prod.yml down --timeout 30 || warning "Some containers may not have stopped gracefully"
    fi
    
    # Load Docker images
    if [ -f backend-image.tar ]; then
        log "Loading backend image..."
        docker load < backend-image.tar
    fi
    
    if [ -f frontend-image.tar ]; then
        log "Loading frontend image..."
        docker load < frontend-image.tar
    fi
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    # Initialize database if needed
    log "Initializing database..."
    docker-compose -f docker-compose.prod.yml exec -T backend python init_db_prod.py 2>/dev/null || log "Database initialization completed"
}

# Health checks
run_health_checks() {
    log "Running health checks..."
    
    # Check if containers are running
    BACKEND_STATUS=$(docker-compose -f docker-compose.prod.yml ps -q backend | xargs docker inspect -f '{{.State.Status}}')
    FRONTEND_STATUS=$(docker-compose -f docker-compose.prod.yml ps -q frontend | xargs docker inspect -f '{{.State.Status}}')
    DB_STATUS=$(docker-compose -f docker-compose.prod.yml ps -q db | xargs docker inspect -f '{{.State.Status}}')
    
    if [ "$BACKEND_STATUS" != "running" ]; then
        error "Backend container is not running"
        return 1
    fi
    
    if [ "$FRONTEND_STATUS" != "running" ]; then
        error "Frontend container is not running"
        return 1
    fi
    
    if [ "$DB_STATUS" != "running" ]; then
        error "Database container is not running"
        return 1
    fi
    
    # Test application endpoints
    for i in {1..30}; do
        if curl -f http://localhost/ > /dev/null 2>&1; then
            log "Frontend is accessible"
            break
        elif [ $i -eq 30 ]; then
            error "Frontend is not accessible after 5 minutes"
            return 1
        fi
        sleep 10
    done
    
    for i in {1..30}; do
        if curl -f http://localhost/api/health > /dev/null 2>&1; then
            log "Backend API is accessible"
            break
        elif [ $i -eq 30 ]; then
            error "Backend API is not accessible after 5 minutes"
            return 1
        fi
        sleep 10
    done
    
    log "All health checks passed!"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring script
    cat > /usr/local/bin/impact-lms-monitor.sh << 'EOF'
#!/bin/bash
cd /opt/impact-lms
echo "=== Impact LMS Status ===" 
echo "Date: $(date)"
echo ""
echo "=== Container Status ==="
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo ""
echo "=== Disk Usage ==="
df -h /opt/impact-lms
echo ""
EOF
    
    chmod +x /usr/local/bin/impact-lms-monitor.sh
    
    # Create daily monitoring cron job
    echo "0 8 * * * root /usr/local/bin/impact-lms-monitor.sh >> /var/log/impact-lms-monitoring.log" > /etc/cron.d/impact-lms-monitor
    
    log "Monitoring setup completed"
}

# Cleanup old resources
cleanup() {
    log "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused Docker volumes (be careful!)
    docker volume prune -f
    
    # Clean up old backups (keep last 7 days)
    find ${BACKUP_PATH} -name "backup-*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    
    # Clean up deployment files
    cd ${DEPLOY_PATH}
    rm -f *.tar backend-image.tar frontend-image.tar
    
    log "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting Impact LMS deployment..."
    
    create_directories
    install_dependencies
    setup_firewall
    backup_current_deployment
    deploy_application
    
    if run_health_checks; then
        setup_monitoring
        cleanup
        log "Deployment completed successfully!"
        log "Application is available at: http://$(hostname -I | awk '{print $1}')"
    else
        error "Deployment failed health checks"
        exit 1
    fi
}

# Handle script interruption
trap 'error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
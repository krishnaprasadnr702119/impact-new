# 🐳 Docker Setup - Impact LMS with Marketing Website

## Quick Start (Everything in Docker)

### 1. Build and Start All Services

```bash
cd /home/kp/myproject/Impact
docker-compose up --build
```

This will start:
- ✅ PostgreSQL Database (Port 5432)
- ✅ Backend API (Flask) (Port 5001)
- ✅ Frontend React App with Marketing Website (Port 3001)
- ✅ Nginx Reverse Proxy (Port 80)

### 2. Access the Application

**Main Marketing Website (via Nginx):**
- http://localhost
- http://localhost:80

**Direct Frontend Access:**
- http://localhost:3001

**Backend API:**
- http://localhost:5001/api

**Database:**
- localhost:5432

## 🎯 What You'll See

### At http://localhost or http://localhost:3001
1. **Marketing Home Page** (`/`)
   - Modern landing page
   - Cybersecurity course features
   - Pricing plans
   - Contact form

2. **Login Page** (`/login`)
   - Click "Get Started" from marketing page
   - Or navigate directly to http://localhost/login

3. **Dashboard** (`/dashboard`) - After Login
   - Portal Admin Dashboard
   - Employee Dashboard
   - Based on user role

## 📦 Docker Services

### Frontend Service
```yaml
frontend:
  build: ./frontend
  ports: 3001:3000
  volumes:
    - ./frontend:/app
  command: npm run dev
```

**What it includes:**
- ✅ React 18
- ✅ Vite dev server
- ✅ Marketing website components
- ✅ All existing dashboard features
- ✅ Hot reload enabled

### Backend Service
```yaml
backend:
  build: ./backend
  ports: 5001:5000
  depends_on: db
```

### Nginx Service
```yaml
nginx:
  ports: 80:80
  proxies:
    - / → frontend:3000
    - /api → backend:5000
```

## 🛠️ Docker Commands

### Start Services
```bash
# Start all services
docker-compose up

# Start in background (detached)
docker-compose up -d

# Build and start
docker-compose up --build

# Start specific service
docker-compose up frontend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Stop specific service
docker-compose stop frontend
```

### View Logs
```bash
# All services
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# Specific service
docker-compose logs frontend
docker-compose logs backend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart frontend
```

### Rebuild After Changes
```bash
# Rebuild frontend after code changes
docker-compose up --build frontend

# Rebuild everything
docker-compose build
docker-compose up
```

## 🔧 Development Workflow

### 1. Make Changes to Marketing Website
```bash
# Edit files in frontend/src/components/marketing/
# Changes will hot-reload automatically!
```

### 2. View Changes
- Frontend container watches for file changes
- Vite hot module replacement updates instantly
- No need to rebuild!

### 3. Only Rebuild If:
- Added new npm packages
- Changed Dockerfile
- Changed docker-compose.yml

```bash
docker-compose up --build frontend
```

## 🐛 Troubleshooting

### Port Already in Use?
```bash
# Find what's using port 3001
sudo lsof -i :3001

# Or use different port in docker-compose.yml
ports:
  - "3002:3000"  # Change 3001 to 3002
```

### Frontend Not Loading?
```bash
# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend

# Rebuild frontend
docker-compose up --build frontend
```

### Database Issues?
```bash
# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Reset database (WARNING: Deletes data)
docker-compose down -v
docker-compose up db
```

### Changes Not Reflecting?
```bash
# Clear Docker cache and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Check Service Status
```bash
# List running containers
docker-compose ps

# Check if services are healthy
docker ps
```

## 📁 Volume Mounts

### Frontend Volume
```yaml
volumes:
  - ./frontend:/app
  - /app/node_modules
```

**What this means:**
- Your local `frontend/` folder is mounted into container
- Changes to files reflect immediately
- `node_modules` stays in container (faster)

### Backend Volume
```yaml
volumes:
  - ./backend:/app
  - ./backend/uploads:/app/uploads
```

## 🚀 Production Build

### Build for Production
```bash
# Use production docker-compose
docker-compose -f docker-compose.prod.yml up --build
```

### Or Build Frontend Only
```bash
cd frontend
docker build -t impact-lms-frontend:prod -f Dockerfile .
docker run -p 3000:3000 impact-lms-frontend:prod
```

## 📊 Check Everything is Working

### 1. Check Containers Running
```bash
docker-compose ps
```

You should see:
```
NAME                    STATE     PORTS
impact-db-1            running   5432->5432
impact-backend-1       running   5001->5000
impact-frontend-1      running   3001->3000
impact-nginx-1         running   80->80
```

### 2. Check Logs for Errors
```bash
docker-compose logs --tail=50
```

### 3. Test URLs
```bash
# Marketing website
curl http://localhost

# Backend health
curl http://localhost:5001/api/health

# Frontend direct
curl http://localhost:3001
```

## 🎯 Access Points Summary

| Service | Docker Port | Host Port | URL |
|---------|------------|-----------|-----|
| Marketing Website | 3000 | 3001 | http://localhost:3001 |
| Nginx Proxy | 80 | 80 | http://localhost |
| Backend API | 5000 | 5001 | http://localhost:5001 |
| PostgreSQL | 5432 | 5432 | localhost:5432 |

## 🔄 Initialize Database

### First Time Setup
```bash
# Start services
docker-compose up -d

# Wait for DB to be ready (10 seconds)
sleep 10

# Initialize database
docker-compose exec backend python init_db.py
```

## 📝 Environment Variables

Located in `docker-compose.yml`:

```yaml
environment:
  DATABASE_URL: postgresql://lmsuser:lmspassword@db:5432/lmsdb
  FLASK_ENV: development
  JWT_SECRET_KEY: your-secret-key
  CORS_ORIGINS: http://localhost:3001,http://localhost:80
```

## 💡 Tips

1. **Development**: Use `docker-compose up` (see logs)
2. **Background**: Use `docker-compose up -d` (detached)
3. **Rebuild**: After dependency changes, use `--build`
4. **Clean Start**: Use `docker-compose down -v && docker-compose up --build`
5. **Hot Reload**: Works automatically for frontend code changes!

## 🎉 You're Ready!

```bash
# Start everything
cd /home/kp/myproject/Impact
docker-compose up --build
```

Then visit:
- **http://localhost** - See your marketing website! 🚀
- **http://localhost/login** - Login page
- **http://localhost:5001/api/health** - Check backend

---

**All services running in Docker with hot reload! 🐳**

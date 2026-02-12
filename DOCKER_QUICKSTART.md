# 🚀 Docker Quick Start - 3 Simple Steps

## Step 1: Navigate to Project
```bash
cd /home/kp/myproject/Impact
```

## Step 2: Start Everything
```bash
docker-compose up --build
```

## Step 3: Open Browser
Visit: **http://localhost**

That's it! 🎉

---

## What You'll See

### ✅ Services Starting
```
Creating impact-db-1       ... done
Creating impact-backend-1  ... done
Creating impact-frontend-1 ... done
Creating impact-nginx-1    ... done
```

### ✅ Logs Showing
```
frontend-1  | VITE v4.x.x ready in xxx ms
frontend-1  | ➜  Local:   http://localhost:3000/
backend-1   | * Running on http://0.0.0.0:5000
db-1        | database system is ready to accept connections
```

### ✅ Your Marketing Website Live at:
- **http://localhost** (via Nginx)
- **http://localhost:3001** (direct)

---

## Stop Everything
Press `Ctrl + C` in terminal

Or in another terminal:
```bash
cd /home/kp/myproject/Impact
docker-compose down
```

---

## Run in Background (Detached)
```bash
docker-compose up --build -d
```

View logs:
```bash
docker-compose logs -f
```

Stop:
```bash
docker-compose down
```

---

## First Time? Initialize Database
```bash
# After services are running
docker-compose exec backend python init_db.py
```

---

## Troubleshooting

### Port 80 Already in Use?
```bash
# Edit docker-compose.yml, change nginx ports:
ports:
  - "8080:80"  # Use 8080 instead

# Then visit: http://localhost:8080
```

### Port 3001 Already in Use?
```bash
# Edit docker-compose.yml, change frontend ports:
ports:
  - "3002:3000"  # Use 3002 instead

# Then visit: http://localhost:3002
```

### See What's Running
```bash
docker-compose ps
```

### Check Logs
```bash
docker-compose logs frontend
docker-compose logs backend
docker-compose logs db
```

---

## 🎯 Quick Commands Reference

| Action | Command |
|--------|---------|
| **Start** | `docker-compose up --build` |
| **Start (Background)** | `docker-compose up -d --build` |
| **Stop** | `docker-compose down` |
| **Logs** | `docker-compose logs -f` |
| **Restart** | `docker-compose restart` |
| **Status** | `docker-compose ps` |

---

**Ready to go! Just run: `docker-compose up --build`** 🐳

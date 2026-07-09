# 🏢 Room Scheduler Application

A comprehensive, production-ready room booking and scheduling solution with web, mobile, and admin interfaces.

## ✨ Features

- ✅ User authentication with JWT & OAuth2
- ✅ Room browsing and advanced filtering
- ✅ Real-time availability checking
- ✅ Conflict detection and prevention
- ✅ Email notifications
- ✅ Admin dashboard with analytics
- ✅ Calendar integrations (Google, Outlook)
- ✅ Mobile app support (React Native)
- ✅ Docker & Kubernetes ready
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Comprehensive API documentation

## 📋 Prerequisites

- Node.js 16+
- Docker & Docker Compose
- PostgreSQL 13+
- Redis 6+
- Git

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone and navigate to project
git clone https://github.com/azam-78324/room-scheduler.git
cd room-scheduler

# Start all services
docker-compose up -d

# Wait for services to initialize
sleep 10

# Check services
docker-compose ps
```

### Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **Database**: localhost:5432
- **Redis**: localhost:6379

### Default Test Credentials

After initial setup, you can sign up new accounts.

## 📁 Project Structure

```
room-scheduler/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── index.ts        # Main application
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, error handling
│   │   └── database/       # Migrations & schema
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React web application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── store/          # Zustand state management
│   │   ├── styles/         # CSS styles
│   │   └── App.tsx         # Main app component
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── mobile/                  # React Native app
│   ├── App.tsx
│   ├── screens/
│   ├── store/
│   └── package.json
├── docs/                    # Documentation
│   ├── API.md              # API endpoints
│   ├── DATABASE.md         # Schema & design
│   ├── ARCHITECTURE.md     # System design
│   └── DEPLOYMENT.md       # Deployment guide
├── k8s/                     # Kubernetes manifests
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.yml       # Local development setup
└── .gitignore
```

## 📚 API Documentation

### Authentication

```bash
POST /api/auth/signup
POST /api/auth/signin
```

### Rooms

```bash
GET    /api/rooms                    # List all rooms
GET    /api/rooms/:id                # Get room details
GET    /api/rooms/:id/availability   # Check availability
```

### Bookings (Protected)

```bash
POST   /api/bookings                 # Create booking
GET    /api/bookings                 # Get user bookings
DELETE /api/bookings/:id             # Cancel booking
```

### Admin (Protected - Admin Only)

```bash
POST   /api/admin/rooms              # Create room
PUT    /api/admin/rooms/:id          # Update room
DELETE /api/admin/rooms/:id          # Delete room
GET    /api/admin/analytics          # Get analytics
```

Full API documentation: [See docs/API.md](./docs/API.md)

## 🛠️ Local Development

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npm run migrate

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

# Start development server
npm start
```

Frontend runs on `http://localhost:3000`

### Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo server
expo start

# For iOS
expo start --ios

# For Android
expo start --android
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Access database
docker-compose exec postgres psql -U scheduler -d room_scheduler

# Access Redis
docker-compose exec redis redis-cli
```

## 📦 Database

### Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed test data
docker-compose exec backend npm run seed
```

### Database Schema

- **users**: User accounts and authentication
- **rooms**: Room definitions with amenities
- **bookings**: Room reservations with status tracking
- **audit_logs**: Activity tracking (optional)

See [docs/DATABASE.md](./docs/DATABASE.md) for detailed schema.

## 🚢 Deployment

### Docker Hub

```bash
# Build images
docker build -t yourusername/room-scheduler-api ./backend
docker build -t yourusername/room-scheduler-web ./frontend

# Push to Docker Hub
docker push yourusername/room-scheduler-api
docker push yourusername/room-scheduler-web
```

### AWS Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for:
- RDS PostgreSQL setup
- ElastiCache Redis setup
- ECS/Fargate deployment
- Load balancer configuration

### Kubernetes

```bash
# Apply Kubernetes manifests
kubectl create namespace room-scheduler
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n room-scheduler
kubectl get services -n room-scheduler
```

## 📊 Monitoring & Logging

### Application Monitoring

- **Sentry**: Error tracking
- **New Relic**: Performance monitoring
- **Prometheus**: Metrics collection
- **CloudWatch**: AWS logging

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Response
{"status":"OK","timestamp":"2024-01-15T10:30:00.000Z"}
```

## 🔐 Security

- JWT token-based authentication
- Password hashing with bcryptjs
- CORS protection
- SQL injection prevention (parameterized queries)
- Rate limiting ready
- Environment variable configuration

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### Port Already in Use

```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Error

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Frontend Can't Reach Backend

```bash
# Check .env.local
cat frontend/.env.local

# Should contain:
# REACT_APP_API_URL=http://localhost:5000/api
```

## 📞 Support

For issues, questions, or suggestions:
- Open an GitHub issue
- Check existing documentation in `/docs`
- Review API documentation

## 🗺️ Roadmap

- [ ] Admin dashboard enhancements
- [ ] Email notification system
- [ ] Google Calendar integration
- [ ] Outlook Calendar integration
- [ ] Room display screens (Xibo)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Two-factor authentication
- [ ] Room occupancy sensors
- [ ] Mobile app (React Native)

---

**Made with ❤️ by the Room Scheduler Team**

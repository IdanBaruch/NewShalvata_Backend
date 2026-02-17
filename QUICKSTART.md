# Protocol 66 - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
cd protocol66
npm install
```

### Step 2: Setup Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add at minimum:
# - ANTHROPIC_API_KEY (for AI vision)
# - JWT_SECRET (any random string)
# - Database credentials (or use Docker)
```

### Step 3: Start Database (Choose One)

#### Option A: Docker (Easiest)
```bash
docker-compose up postgres -d
```

#### Option B: Local PostgreSQL
```bash
# Install PostgreSQL 16
# Create database:
createdb protocol66
```

### Step 4: Run the Server
```bash
npm run start:dev
```

🎉 **Done!** API running at: http://localhost:8000

📚 **Swagger Docs**: http://localhost:8000/docs

---

## 🧪 Test the API

### 1. Send Magic Link
```bash
curl -X POST http://localhost:8000/api/v1/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"phone": "+972501234567"}'
```

Check console for the 6-digit token!

### 2. Verify Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token": "123456"}'
```

You'll get a JWT token!

### 3. Use Protected Endpoints
```bash
# Get your profile
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 What's Included?

### ✅ Core Features
- Magic Link authentication (SMS/Email)
- Medication scheduling
- AI photo verification (Claude Vision)
- Mood tracking
- Clinician dashboard
- Full Swagger docs

### 📁 File Structure
```
protocol66/
├── src/
│   ├── auth/          # Authentication
│   ├── users/         # User management
│   ├── medications/   # Med tracking + AI
│   ├── mood/          # Mood logs
│   └── clinician/     # Dashboard
├── .env.example       # Environment template
├── docker-compose.yml # PostgreSQL setup
└── README.md          # Full documentation
```

---

## 🐛 Troubleshooting

### Database connection failed
```bash
# Check if PostgreSQL is running
docker ps

# Or restart it
docker-compose restart postgres
```

### Port 8000 already in use
```bash
# Change PORT in .env
PORT=3000
```

### TypeORM errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Next Steps

1. **Read Full Documentation**: `README.md`
2. **Explore API**: http://localhost:8000/docs
3. **Configure AWS S3**: For image storage (optional in dev)
4. **Setup Twilio**: For real SMS (optional)
5. **Deploy**: See README for production setup

---

## 💡 Tips

- Use **Swagger UI** for testing - it's interactive!
- Check **console logs** for Magic Link tokens in dev
- Database auto-creates tables on first run (dev only)
- All images encrypted in S3 (when configured)

---

**Need Help?** Check `README.md` or open an issue!

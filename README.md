# Protocol 66 - Backend API

> **Medication Adherence Platform for Mental Health**  
> NestJS + PostgreSQL + TypeORM + Claude Vision AI

---

## 🎯 Project Overview

Protocol 66 is a medication adherence system designed specifically for mental health patients, particularly those with bipolar disorder and psychotic conditions. The platform uses:

- **AI-Powered Verification**: Claude Vision API to verify medication intake through photo analysis
- **Real-time Mood Tracking**: Daily check-ins with flagging system for clinicians
- **Clinician Dashboard**: Exception-based monitoring to reduce alert fatigue
- **Magic Link Authentication**: Passwordless login to reduce friction for patients

---

## 📋 Features

### Patient Features
- ✅ **Magic Link Authentication** (SMS/Email) - no passwords
- ✅ **Daily Medication Schedule** - personalized reminders
- ✅ **Photo Verification** - AI confirms medication intake
- ✅ **Streak Tracking** - gamification for adherence
- ✅ **Mood Check-in** - visual slider-based mood tracking
- ✅ **Privacy-First** - encrypted images, HIPAA-ready architecture

### Clinician Features
- ✅ **Exception-Based Dashboard** - see only at-risk patients
- ✅ **Real-time Alerts** - suicidal thoughts, missed medications
- ✅ **Adherence Analytics** - track patient compliance
- ✅ **Detailed Reports** - 30-day patient summaries

---

## 🏗️ Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL + TypeORM
- **AI**: Anthropic Claude 3.5 Sonnet (Vision)
- **Storage**: AWS S3 (encrypted images)
- **Auth**: JWT + Magic Links
- **API Docs**: Swagger/OpenAPI

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- AWS Account (for S3)
- Anthropic API Key

### 1. Clone & Install
```bash
git clone <repo-url>
cd protocol66
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your credentials
```

**Required Environment Variables:**
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=protocol66

# JWT
JWT_SECRET=your-super-secret-key

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-xxxxx

# AWS S3
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_S3_BUCKET=protocol66-medications
```

### 3. Database Setup
```bash
# Start PostgreSQL (or use Docker Compose)
docker-compose up postgres -d

# Run migrations (auto-created on first run in dev)
npm run start:dev
```

### 4. Run the Server
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

API will be available at: **http://localhost:8000**  
Swagger Docs: **http://localhost:8000/docs**

---

## 🐳 Docker Deployment

### Full Stack with Docker Compose
```bash
# Start PostgreSQL + Backend
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all
docker-compose down
```

---

## 📚 API Documentation

Once the server is running, visit: **http://localhost:8000/docs**

### Core Endpoints

#### Authentication
```http
POST /api/v1/auth/send-magic-link
POST /api/v1/auth/verify-token
```

#### Medications
```http
GET  /api/v1/meds/daily-plan
POST /api/v1/meds
POST /api/v1/meds/verify-intake (multipart/form-data)
GET  /api/v1/meds/history
```

#### Mood Tracking
```http
POST /api/v1/mood/check-in
GET  /api/v1/mood/history
GET  /api/v1/mood/latest
```

#### Clinician Dashboard
```http
GET /api/v1/clinician/patients/alerts
GET /api/v1/clinician/patients/:id/report
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📁 Project Structure

```
src/
├── auth/              # Magic Link + JWT authentication
├── users/             # User management
├── medications/       # Medication scheduling & verification
│   ├── ai-vision.service.ts    # Claude Vision integration
│   ├── medications.service.ts  # Core medication logic
│   └── medication-log.entity.ts
├── mood/              # Mood tracking & flagging
├── clinician/         # Clinician dashboard & alerts
└── common/            # Guards, decorators, filters
```

---

## 🔐 Security

- ✅ JWT-based authentication
- ✅ Encrypted S3 storage (AES-256)
- ✅ TLS 1.3 in transit
- ✅ Input validation (class-validator)
- ✅ Rate limiting (TODO)
- ✅ CORS configured

---

## 🚧 Roadmap

### Phase 1 (MVP) - ✅ Complete
- [x] Magic Link authentication
- [x] Medication scheduling
- [x] AI photo verification
- [x] Mood tracking
- [x] Clinician dashboard

### Phase 2 (V2.0)
- [ ] Push notifications (Firebase)
- [ ] SMS reminders (Twilio)
- [ ] Voice biomarkers
- [ ] Advanced analytics

### Phase 3 (V3.0)
- [ ] Financial Shield (spending alerts)
- [ ] EMR integration
- [ ] Multi-language support

---

## 📊 Database Schema

**Users** → **Medications** → **MedicationLogs**  
**Users** → **MoodLogs**

Key Tables:
- `users` - Patients & Clinicians
- `medications` - Medication schedules
- `medication_logs` - Intake verification records
- `mood_logs` - Daily mood check-ins

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

Proprietary - All Rights Reserved

---

## 👥 Team

**Product Manager**: Idan Baruch  
**Clinical Advisor**: TBD  
**Tech Stack**: NestJS + Claude AI

---

## 📞 Support

For questions or issues, contact: support@protocol66.app

---

**Built with ❤️ for mental health wellness**

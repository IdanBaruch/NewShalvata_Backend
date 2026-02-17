# Protocol 66 - API Examples

## Quick Test Flow

### 1. Health Check
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "protocol66-api",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Authentication Flow

### Step 1: Send Magic Link
```bash
curl -X POST http://localhost:8000/api/v1/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+972501234567",
    "email": "user@example.com"
  }'
```

Response:
```json
{
  "message": "Magic link sent successfully. Please check your phone."
}
```

**In Development**: Check the console for the 6-digit code!

### Step 2: Verify Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "+972501234567",
    "firstName": "User",
    "lastName": "1234567",
    "role": "patient"
  }
}
```

**Save the `accessToken` for subsequent requests!**

---

## User Endpoints

### Get Profile
```bash
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Idan",
    "lastName": "Baruch"
  }'
```

---

## Medication Endpoints

### Create Medication Schedule
```bash
curl -X POST http://localhost:8000/api/v1/meds \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lithium",
    "dosage": "300mg",
    "frequency": "daily_twice",
    "scheduledTimes": ["08:00", "20:00"],
    "startDate": "2024-01-01",
    "notes": "Take with food"
  }'
```

Response:
```json
{
  "id": "med-uuid-here",
  "name": "Lithium",
  "dosage": "300mg",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

### Get Daily Plan
```bash
curl http://localhost:8000/api/v1/meds/daily-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
[
  {
    "id": "med-uuid",
    "name": "Lithium",
    "dosage": "300mg",
    "scheduledTimes": ["08:00", "20:00"],
    "takenToday": false,
    "lastTaken": null
  }
]
```

### Verify Medication Intake (with Image)
```bash
curl -X POST http://localhost:8000/api/v1/meds/verify-intake \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/pill-photo.jpg" \
  -F "medicationId=med-uuid-here" \
  -F "latitude=32.0853" \
  -F "longitude=34.7818"
```

Response:
```json
{
  "id": "log-uuid",
  "status": "verified",
  "confidence": 95,
  "streakCount": 5,
  "message": "Great! 5 day streak! 🔥"
}
```

### Get Medication History
```bash
curl "http://localhost:8000/api/v1/meds/history?days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Mood Tracking

### Daily Check-in
```bash
curl -X POST http://localhost:8000/api/v1/mood/check-in \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "good",
    "energy": "moderate",
    "anxietyLevel": 3,
    "sleepQuality": 7,
    "notes": "Feeling better today",
    "symptoms": ["racing_thoughts"]
  }'
```

Response:
```json
{
  "id": "mood-log-uuid",
  "message": "Thank you for checking in.",
  "flagged": false
}
```

### Mood Values
- **mood**: `very_low`, `low`, `neutral`, `good`, `very_good`
- **energy**: `very_low`, `low`, `moderate`, `high`, `very_high`
- **anxietyLevel**: 1-10 (integer)
- **sleepQuality**: 1-10 (integer)

### Get Mood History
```bash
curl "http://localhost:8000/api/v1/mood/history?days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Clinician Dashboard

### Get Patient Alerts
```bash
curl http://localhost:8000/api/v1/clinician/patients/alerts \
  -H "Authorization: Bearer CLINICIAN_JWT_TOKEN"
```

Response:
```json
[
  {
    "patient": {
      "id": "patient-uuid",
      "name": "Idan Baruch",
      "phone": "+972501234567"
    },
    "alerts": [
      {
        "type": "medication",
        "severity": "high",
        "message": "No medication taken for 5 days",
        "timestamp": "2024-01-01T12:00:00.000Z"
      }
    ],
    "adherenceRate": 45,
    "lastMoodCheck": "2024-01-01T08:00:00.000Z",
    "daysSinceMedication": 5
  }
]
```

### Get Patient Report
```bash
curl "http://localhost:8000/api/v1/clinician/patients/patient-uuid/report?days=30" \
  -H "Authorization: Bearer CLINICIAN_JWT_TOKEN"
```

---

## Testing with Postman

Import `postman_collection.json` into Postman:

1. Open Postman
2. Click **Import**
3. Select `postman_collection.json`
4. All endpoints will be available with examples!

The collection includes:
- Auto-saves JWT token after login
- All request examples
- Proper headers configured

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Medication not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["phone must be a valid phone number"],
  "error": "Bad Request"
}
```

---

## Rate Limiting

Currently no rate limiting in development. Production will have:
- 100 requests per 15 minutes per IP
- 10 login attempts per hour

---

**Happy Testing! 🚀**

# ARX v3 - Discord Payment Code Translator

A modern AI-powered code translator with Discord-based payments.

## 🚀 Features

- **AI Code Translation**: Translate code between 10+ languages using OpenAI
- **Discord Payments**: Accept payments via Discord DMs
- **Multiple Plans**:
  - Free: 100 lines, 3 languages
  - Monthly: €1.99/month - Unlimited
  - Yearly: €7.99/year - Unlimited
  - Permanent: €14.99 - Lifetime access
- **User Dashboard**: Track translations and subscription status
- **Translation History**: Store and access past translations (Premium)

## 🛠️ Tech Stack

- **Frontend**: React, CSS3
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **AI**: OpenAI API (GPT-3.5-turbo)
- **Authentication**: JWT

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- OpenAI API key
- Discord Bot token (optional, for manual payments)

## ⚙️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd arx-v3-discord
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local
npm install
npm start
```

### 4. Access

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DB_PATH=./database/arx.db
JWT_SECRET=your_secret_key_min_32_chars
OPENAI_API_KEY=sk_your_key
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_OWNER_ID=your_user_id
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

## 💳 Payment Flow

1. User selects plan
2. Creates payment order
3. Receives Discord DM instructions
4. Sends payment to owner
5. Owner verifies payment via admin panel
6. Plan activated automatically

## 📊 Database Schema

### Users Table
- id, email, password_hash, name, role, plan, discord_user_id, translations_count

### Translations Table
- id, user_id, source_lang, target_lang, source_code, output_code, created_at

### Payments Table
- id, user_id, plan_type, amount, status, discord_message_link, created_at

### Subscriptions Table
- id, user_id, plan_type, status, renewal_date, cancelled_at

## 🚀 Deployment

### Backend (Railway)
```bash
# Push to GitHub
git push origin main

# Connect to Railway
# Link GitHub repo
# Set environment variables
# Deploy
```

### Frontend (Vercel)
```bash
# Push to GitHub
git push origin main

# Connect to Vercel
# Link GitHub repo
# Set REACT_APP_API_URL
# Deploy
```

## 📝 API Endpoints

### Auth

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Translations

- `POST /api/translations/translate` - Translate code
- `GET /api/translations/history` - Get history

### Payments

- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment (admin)
- `GET /api/payments/plans` - Get plans

## 🤝 Contributing

Contributions welcome! Submit pull requests.

## 📄 License

MIT License

## 💬 Support

For issues, contact owner on Discord.

---

Made with ❤️ by methy
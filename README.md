# Panass TanzaFlix - Complete Project Documentation

Welcome to **Panass TanzaFlix** - a modern movie streaming and sales platform for Tanzania.

## Project Overview

Panass TanzaFlix is a full-stack web application that enables users to:
- Browse and search movies by category
- Purchase movie access through Selcom mobile payment
- Stream movies in multiple languages (Kiswahili, English, etc.)
- Manage their purchase history
- Track account balance and transactions

### Vision
To provide affordable, high-quality movie content to Tanzanians through secure, convenient payment methods.

### Tech Stack

#### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MySQL 5.7+
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcrypt
- **API Client:** Axios
- **Payment Gateway:** Selcom

#### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive design, animations
- **JavaScript (Vanilla)** - No frameworks (lightweight)
- **API Communication:** Fetch API

## Quick Start

### Prerequisites
- Node.js 14+
- MySQL 5.7+
- Git
- npm or yarn

### Installation

1. **Clone/Extract Project**
```bash
cd TanzaFlix
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Setup Database**
```bash
mysql -u root < database/init.sql
```

4. **Configure Environment Variables**
Create/update `.env`:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=TanzaFlix

# Server
PORT=5000
JWT_SECRET=your-strong-secret-key-here

# Frontend
FRONTEND_URL=http://localhost:3000

# Selcom (get from Selcom merchant portal)
SELCOM_MERCHANT_ID=your_merchant_id
SELCOM_API_KEY=your_api_key
SELCOM_ENV=test

# Webhook
WEBHOOK_URL=http://localhost:5000
```

5. **Start Backend**
```bash
npm start
# For development with auto-reload:
npm run dev
```

6. **Start Frontend** (in new terminal)
```bash
cd frontend
# Using Python 3
python -m http.server 3000

# Or using Node.js
npx http-server -p 3000

# Or using VS Code Live Server
# Right-click index.html → Open with Live Server
```

7. **Access Application**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Project Structure

```
TanzaFlix/
├── backend/
│   ├── config/
│   │   ├── db.js              # Database connection
│   │   └── selcom.js          # Selcom API config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   └── paymentController.js
│   ├── database/
│   │   └── init.sql           # Database schema
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── movieModel.js
│   │   └── paymentModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   └── paymentRoutes.js
│   ├── uploads/
│   │   ├── videos/            # Movie files
│   │   └── thumbnails/        # Movie posters
│   ├── server.js              # Entry point
│   ├── package.json
│   ├── .env
│   └── README.md
│
├── frontend/
│   ├── index.html             # Login/Register
│   ├── main.html              # Browse movies
│   ├── payment.html           # Checkout page
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── scripts.js
│   ├── assets/                # Images
│   ├── movies/                # Movie data
│   └── README.md
│
└── README.md (this file)
```

## Key Features

### 1. User Authentication
- Secure user registration with email validation
- Login with JWT token authentication
- Password hashing with bcrypt
- Token expiration (7 days)
- Session management with localStorage

### 2. Movie Management
- Browse all movies
- Filter by category (Kihindi, Kizungu, Bongo, Korea, Nigeria, Comedy)
- Full-text search by title
- Movie details with ratings and reviews
- Multiple language support

### 3. Payment Processing
- **Multiple Payment Methods:**
  - Selcom USSD (*150*2#)
  - Tigo Money (*150*1#)
  - Vodacom M-Pesa
  - Airtel Money

- **Payment Features:**
  - Real-time payment processing
  - Transaction tracking
  - Purchase history
  - Account balance management
  - Secure webhook handling
  - Payment confirmation

### 4. User Account
- View profile information
- Check account balance
- View purchase history
- Link phone number for faster payments
- Update account settings

### 5. Security
- JWT token-based authentication
- Password hashing with bcrypt (10 rounds)
- Input validation and sanitization
- CORS protection
- Prepared SQL statements (prevent SQL injection)
- Rate limiting ready
- HTTPS support

## Database Schema

### Users Table
- id, name, email, password (hashed)
- phone_number, account_balance
- created_at, updated_at

### Movies Table
- id, title, category, year, quality
- price, description, image_url, video_url
- duration_minutes, rating

### Purchases Table
- id, user_id, movie_id, amount
- payment_method, transaction_id, status
- created_at

### Wallet_Transactions Table
- id, user_id, amount, transaction_type
- reference_id, description, status

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | User login |
| GET | /auth/me | Yes | Get current user |

### Movie Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /movies | No | Get all movies |
| GET | /movies/:id | No | Get movie details |
| GET | /movies/category/:cat | No | Get by category |
| GET | /movies/search/:term | No | Search movies |
| GET | /movies/owned | Yes | User's owned movies |

### Payment Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /payment/initiate | Yes | Start USSD payment |
| POST | /payment/webhook | No | Selcom callback |
| GET | /payment/status/:id | Yes | Check payment status |
| GET | /payment/purchases | Yes | User's purchases |
| POST | /payment/link-phone | Yes | Link phone number |
| POST | /payment/verify | Yes | Verify payment |

## Selcom Integration

### Setup Steps
1. Register as merchant at [Selcom](https://selcom.com/)
2. Get merchant credentials:
   - Merchant ID
   - API Key
3. Update `.env` with credentials
4. Test with sandbox environment
5. Switch to production when ready

### Payment Flow
```
User selects movie
→ Clicks "Lipia Sasa"
→ Enters phone number
→ API sends USSD push to Selcom
→ User enters code: *150*2#
→ Selcom processes payment
→ Webhook notification sent to backend
→ Backend updates purchase status
→ Movie access granted to user
```

## Configuration

### Environment Variables

```env
# Database Configuration
DB_HOST=localhost              # MySQL host
DB_USER=root                   # MySQL user
DB_PASSWORD=                   # MySQL password
DB_NAME=TanzaFlix             # Database name

# Server
PORT=5000                      # Server port
JWT_SECRET=strong-secret-key   # JWT signing key

# URLs
FRONTEND_URL=http://localhost:3000
WEBHOOK_URL=http://localhost:5000

# Selcom Payment Gateway
SELCOM_ENV=test               # test or production
SELCOM_MERCHANT_ID=your_id
SELCOM_API_KEY=your_key
SELCOM_MERCHANT_CODE=TANZAFLIX
```

## Usage Examples

### Frontend - Login
```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
}
```

### Frontend - Browse Movies
```javascript
async function getMovies() {
  const response = await fetch('http://localhost:5000/api/movies');
  return await response.json();
}
```

### Frontend - Make Payment
```javascript
async function buyMovie(movieId, phoneNumber) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/payment/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ movieId, phoneNumber })
  });
  return await response.json();
}
```

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| CORS Error | Frontend/Backend URL mismatch | Update FRONTEND_URL in .env |
| Database Connection | MySQL not running | Start MySQL service |
| Token Expired | JWT expired | Login again to get new token |
| Payment Failed | Wrong Selcom credentials | Verify in Merchant Portal |
| 404 Not Found | Wrong API endpoint | Check spelling and method |

## Performance Optimization

### Frontend
- Vanilla JS (no framework overhead)
- CSS animations (GPU accelerated)
- Responsive images
- Lazy loading ready

### Backend
- Connection pooling (MySQL)
- Database indexes
- Request validation early
- Prepared statements

## Security Checklist

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ CORS configured
- ✅ Error logging
- ✅ Transaction tracking
- ✅ Rate limiting ready
- ⚠️ HTTPS required for production
- ⚠️ Webhook signature verification (TODO)

## Deployment

### Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
python -m http.server 3000
```

### Production

#### Using PM2 (recommended)
```bash
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

#### Using Docker
```bash
docker build -t tanzaflix .
docker run -p 5000:5000 tanzaflix
```

#### Cloud Deployment
- **Heroku:** `git push heroku main`
- **DigitalOcean:** Use App Platform
- **AWS:** EC2 + RDS
- **Railway:** Connect GitHub repo

## Testing

### Backend Testing
```bash
# Manual API testing with curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Frontend Testing
- Use browser DevTools Console
- Check Network tab for API calls
- Verify localStorage has token

## Monitoring & Logging

### Backend Logs
```javascript
console.log('Login attempt for:', email);
console.error('Database error:', error);
```

### Payment Logs
- Check transaction_id in purchases table
- Review wallet_transactions for audit trail
- Monitor webhook callbacks

## Future Enhancements

- [ ] Movie streaming quality selection
- [ ] User reviews and ratings
- [ ] Recommendations algorithm
- [ ] Wishlist functionality
- [ ] Subscription plans
- [ ] Admin dashboard
- [ ] Analytics dashboard
- [ ] Push notifications
- [ ] Payment refunds
- [ ] Movie series/episodes

## Troubleshooting Guide

### Backend won't start
```bash
# Check port is not in use
lsof -i :5000

# Kill process using port
kill -9 <PID>

# Start again
npm start
```

### Database error
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
mysql -u root -e "SHOW DATABASES;"

# Recreate database
mysql -u root < database/init.sql
```

### Payment not working
1. Verify Selcom merchant account is active
2. Check credentials in .env
3. Verify webhook URL is accessible
4. Check payment logs in database

## Contact & Support

### Developers
- **Abdul Majid (Panass)**
  - Email: abdulajmiiyypanass@gmail.com
  - Phone: +255 774 581 923

- **Mohammed Aminu (MO11)**
  - Email: mosnake111@gmail.com
  - Phone: +255 677 532 140

### Location
Saateni-Unguja & Fuoni, Zanzibar, Tanzania

## License

ISC License © 2025 Panass TanzaFlix Team

## Changelog

### Version 1.0.0 (Current)
- Initial release
- User authentication
- Movie browsing
- Selcom payment integration
- Purchase tracking
- Professional UI/UX

---

**Last Updated:** March 2026
**Status:** Production Ready ✅

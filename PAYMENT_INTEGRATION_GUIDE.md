# Panass TanzaFlix - API Integration Guide

Complete guide for integrating Panass TanzaFlix payment system with Selcom and other payment gateways.

## Table of Contents
1. [Selcom Integration](#selcom-integration)
2. [Payment Flow](#payment-flow)
3. [Error Handling](#error-handling)
4. [Testing](#testing)
5. [Going Live](#going-live)

---

## Selcom Integration

### 1. Account Setup

1. **Register as Merchant**
   - Visit [Selcom Merchant Portal](https://merchant.selcom.com/)
   - Register business account
   - Provide business details and banking information

2. **Get Merchant Credentials**
   - Login to merchant portal
   - Navigate to API Settings
   - Copy your:
     - Merchant ID
     - API Key

3. **Setup Webhook URL**
   - In merchant portal, set webhook endpoint:
     ```
     https://yourdomain.com/api/payment/webhook
     ```
   - Enable webhook notifications for payment status

### 2. Environment Configuration

Update `.env` file:

```env
# Selcom Credentials
SELCOM_MERCHANT_ID=1001            # From merchant portal
SELCOM_API_KEY=abc123xyz           # From merchant portal
SELCOM_MERCHANT_CODE=TANZAFLIX     # Your business code

# Test vs Production
SELCOM_ENV=test                    # Change to 'production' when ready

# Webhook
WEBHOOK_URL=http://yourdomain.com  # Your server domain
```

### 3. Install Required Packages

```bash
npm install axios                  # For API calls
npm install crypto                 # Already included in Node.js
```

### 4. API Configuration in Backend

The backend is pre-configured to:
- Generate request signatures
- Handle USSD push
- Process webhook callbacks
- Update purchase status

No additional changes needed beyond `.env` setup.

---

## Payment Flow

### Complete Payment Workflow

```
┌─────────────────────────────────────────────────────┐
│ 1. USER BROWSING MOVIES                             │
│    - User logged in on frontend                     │
│    - Viewing available movies                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. USER CLICKS "LIPIA SASA" (BUY NOW)               │
│    - Redirected to /payment.html?movieId=1          │
│    - Movie details loaded                           │
│    - Price displayed                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. USER SELECTS PAYMENT METHOD                      │
│    - Selcom USSD (*150*2#)                          │
│    - Tigo Money (*150*1#)                           │
│    - Vodacom M-Pesa                                 │
│    - Airtel Money                                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. USER ENTERS PHONE NUMBER                         │
│    - Validates format (TZ: 0754123456)              │
│    - Phone linked to account for future use         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 5. FRONTEND SENDS PAYMENT REQUEST                   │
│    POST /api/payment/initiate                       │
│    {                                                │
│      movieId: 1,                                    │
│      phoneNumber: "+255754123456"                   │
│    }                                                │
└─────────────────────────────────────────────────────┘
                        ↓
        ┌──────────────────────────┐
        │ BACKEND PROCESSING       │
        │ ├─ Validate input        │
        │ ├─ Create purchase      │
        │ ├─ Generate signature   │
        │ └─ Call Selcom API      │
        └──────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 6. SELCOM USSD PUSH TO USER PHONE                   │
│    "Lipia 1000 TZS kwa TanzaFlix?"                 │
│    "1: Ndiyo | 2: Hapana"                          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 7. USER CONFIRMS PAYMENT                            │
│    - User presses 1 (Ndiyo/Yes)                    │
│    - Enters M-PIN                                  │
│    - Payment processed by Selcom                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 8. SELCOM SENDS WEBHOOK NOTIFICATION                │
│    POST /api/payment/webhook                        │
│    {                                                │
│      status: "completed",                           │
│      transaction_id: "TXN123456",                   │
│      reference_id: "purchase_1"                     │
│    }                                                │
└─────────────────────────────────────────────────────┘
                        ↓
        ┌──────────────────────────┐
        │ BACKEND WEBHOOK PROCESS  │
        │ ├─ Verify signature      │
        │ ├─ Update purchase      │
        │ ├─ Deduct from balance  │
        │ └─ Grant movie access   │
        └──────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 9. USER GETS MOVIE ACCESS                           │
│    - Movie appears in "Filamu Yangu"               │
│    - Can stream immediately                        │
│    - Confirmation SMS to phone                     │
└─────────────────────────────────────────────────────┘
```

### Payment Status States

```
purchase record:
  status: 'pending'     → Payment in progress
  status: 'completed'   → Payment successful, movie access granted
  status: 'failed'      → Payment declined, retry allowed

wallet_transactions record:
  status: 'pending'     → Awaiting webhook confirmation
  status: 'completed'   → Money received and recorded
  status: 'failed'      → Transaction reversed
```

---

## API Endpoint Details

### Initiate Payment Request

**Endpoint:** `POST /api/payment/initiate`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```json
{
  "movieId": 1,
  "phoneNumber": "+255754123456",
  "paymentMethod": "selcom-ussd"
}
```

**Success Response (200):**
```json
{
  "message": "Payment initiated successfully",
  "purchaseId": 42,
  "transactionId": "TXN_1234567890",
  "amount": 1000,
  "movie": "Squid Game S3E1"
}
```

**Error Response:**
```json
{
  "message": "Error message here",
  "code": "ERROR_CODE"
}
```

### Webhook Callback

**Endpoint:** `POST /api/payment/webhook`

**Sent by:** Selcom servers (no authentication required)

**Request Body:**
```json
{
  "status": "completed",
  "transaction_id": "TXN_1234567890",
  "reference_id": "purchase_42",
  "amount": 1000,
  "phone_number": "+255754123456"
}
```

**Response (200):**
```json
{
  "message": "Webhook processed successfully"
}
```

---

## Error Handling

### Common Errors & Solutions

| Error | Code | Cause | Solution |
|-------|------|-------|----------|
| Invalid phone number | `INVALID_PHONE` | Wrong format | Use 0754123456 or +255754123456 |
| Movie not found | `MOVIE_NOT_FOUND` | Wrong movieId | Verify movie ID exists |
| Unauthorized | `NO_TOKEN` | Missing JWT token | Login and get token |
| Payment failed | `PAYMENT_FAILED` | Selcom rejected | Retry or use different number |
| Already purchased | `ALREADY_OWNED` | User owns movie | Show owned movie warning |
| Server error | `SERVER_ERROR` | Backend issue | Check server logs |

### Frontend Error Handling

```javascript
try {
  const response = await fetch(`${API_URL}/payment/initiate`, {
    method: 'POST',
    headers: { /* ... */ },
    body: JSON.stringify(/* ... */)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`Error [${error.code}]: ${error.message}`);
    // Show user-friendly error message
    showError(translateError(error.code, error.message));
    return;
  }

  const data = await response.json();
  console.log('Payment initiated:', data.transactionId);
} catch (error) {
  console.error('Network error:', error);
  showError('Mtandao hauna mbaya. Tafadhali jaribu tena.');
}
```

### Backend Error Logging

All errors are logged with:
- Timestamp
- Error message
- Stack trace (development)
- Request path and method
- User context if available

Check logs:
```bash
tail -f backend.log
```

---

## Testing

### 1. Test Environment Setup

Use Selcom sandbox:
```env
SELCOM_ENV=test
SELCOM_MERCHANT_ID=TANZAFLIX_TEST
SELCOM_API_KEY=test_key_12345
```

### 2. Manual Testing with cURL

#### Create test user and login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response includes token:
```json
{
  "token": "eyJhbGc...",
  "user": { /* ... */ }
}
```

#### Initiate payment
```bash
curl -X POST http://localhost:5000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "movieId": 1,
    "phoneNumber": "+255754123456"
  }'
```

#### Check payment status
```bash
curl -X GET http://localhost:5000/api/payment/status/42 \
  -H "Authorization: Bearer eyJhbGc..."
```

### 3. Automated Testing

Create `test.js`:
```javascript
const assert = require('assert');
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';
let token;

async function testPaymentFlow() {
  try {
    // 1. Login
    console.log('Testing login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    token = loginData.token;
    assert(token, 'Token not received');
    console.log('✓ Login successful');

    // 2. Get movies
    console.log('Testing get movies...');
    const moviesRes = await fetch(`${API_URL}/movies`);
    const moviesData = await moviesRes.json();
    assert(moviesData.movies.length > 0, 'No movies found');
    console.log(`✓ Got ${moviesData.total} movies`);

    // 3. Initiate payment
    console.log('Testing payment initiation...');
    const paymentRes = await fetch(`${API_URL}/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        movieId: 1,
        phoneNumber: '+255754123456'
      })
    });
    const paymentData = await paymentRes.json();
    assert(paymentData.transactionId, 'No transaction ID');
    console.log(`✓ Payment initiated: ${paymentData.transactionId}`);

    console.log('\n✓ All tests passed!');
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  }
}

testPaymentFlow();
```

Run tests:
```bash
npm install node-fetch
node test.js
```

### 4. Test Credentials (Selcom Sandbox)

| Parameter | Value |
|-----------|-------|
| Merchant ID | TANZAFLIX_TEST |
| API Key | test_key_12345 |
| Environment | test |
| Test Phone | 0654123456 |
| Test Amount | 1000 TZS |

### 5. Common Test Cases

✅ **Test Case 1: Successful Payment**
1. User logs in
2. Selects movie (1000 TZS)
3. Enters phone number
4. Payment succeeds
5. Movie appears in owned list

❌ **Test Case 2: Failed Payment**
1. User initiates payment
2. Payment rejected by Selcom
3. Error message shown
4. User can retry

⚠️ **Test Case 3: Already Owned**
1. User tries to buy movie they own
2. System returns "already owned" error
3. User redirected to watch

🔄 **Test Case 4: Pending Payment**
1. User initiates payment
2. Webhook not received yet
3. Status shows "pending"
4. Later becomes "completed"

---

## Going Live

### 1. Pre-Production Checklist

- [ ] Test all payment flows
- [ ] Verify Selcom webhook URL
- [ ] Check error messages
- [ ] Review security settings
- [ ] Test with real payment amounts
- [ ] Verify database backups
- [ ] Check log monitoring
- [ ] Setup email notifications
- [ ] Configure SSL/HTTPS
- [ ] Test on mobile devices

### 2. Switch to Production

Update `.env`:
```env
SELCOM_ENV=production
SELCOM_MERCHANT_ID=your_real_merchant_id
SELCOM_API_KEY=your_real_api_key
NODE_ENV=production
```

### 3. Deployment

```bash
# Build
npm run build

# Deploy to production server
git push heroku main
# or
pm2 restart all
```

### 4. Monitoring

Monitor in real-time:
```bash
# Watch logs
tail -f /var/log/tanzaflix/error.log
tail -f /var/log/tanzaflix/payment.log

# Check payment status
mysql -u root -e "SELECT * FROM purchases WHERE created_at > NOW() - INTERVAL 1 HOUR;"

# Monitor server resources
watch -n 1 'top -bn1 | head -10'
```

### 5. Scaling Preparation

- Setup database replication
- Use connection pooling
- Setup load balancer
- Configure CDN for assets
- Setup caching layer (Redis)

### 6. Support & Monitoring

Setup alerts for:
- Failed payments
- High error rates
- Server downtime
- Database issues
- Payment delays

---

## Payment Gateway Comparison

| Feature | Selcom | Tigo | Vodacom | Airtel |
|---------|--------|------|---------|--------|
| USSD | ✅ | ✅ | ✅ | ✅ |
| Mobile Money | ✅ | ✅ | ✅ | ✅ |
| API Support | ✅ | ✅ | ✅ | ✅ |
| Merchant Portal | ✅ | ✅ | ✅ | ✅ |
| Settlement Time | 24h | 24h | 24h | 24h |

Currently implemented: **Selcom USSD**

Ready to add: Tigo, Vodacom, Airtel (same structure)

---

## Troubleshooting Payment Issues

### Issue: "Payment initiated but not received"
**Causes & Solutions:**
1. Webhook URL not accessible
   - Verify domain resolves
   - Check firewall rules
   - Test with ngrok: `ngrok http 5000`

2. Wrong merchant credentials
   - Verify in merchant portal
   - Check .env file
   - Restart server

3. USSD code wrong
   - Verify code with provider
   - Check SMS notification

### Issue: "Duplicate transaction error"
**Solution:** Check database for duplicate transaction IDs
```sql
SELECT COUNT(*), transaction_id 
FROM purchases 
GROUP BY transaction_id 
HAVING COUNT(*) > 1;
```

### Issue: "Webhook not being called"
**Solution:** Enable webhook in Selcom merchant portal
1. Login to portal
2. Go to API Settings
3. Enable "Payment Notifications"
4. Set correct webhook URL
5. Test webhook from portal

---

## Support & Contact

- **Selcom Support:** support@selcom.com
- **Technical Issues:** abdulajmiiyypanass@gmail.com
- **Payment Questions:** +255 774 581 923

---

**Last Updated:** March 2026
**Version:** 1.0.0

# VNPAY Sandbox Integration Documentation

## Overview

This document describes the integration of VNPAY Sandbox payment gateway into the textbook marketplace platform.

**⚠️ IMPORTANT**: This is a TEST/SANDBOX environment. Do NOT use real money, real credit cards, or real bank accounts.

## What is VNPAY Sandbox?

VNPAY Sandbox is a testing environment provided by VNPAY that mimics the production payment gateway. It allows developers to test payment integration without processing real transactions.

### Key Characteristics:
- All transactions are simulated
- No real money is transferred
- Test cards and bank accounts are provided
- Same API as production

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   User                                                           │
│     │                                                           │
│     ▼                                                           │
│   Cart ─── Checkout                                             │
│     │              │                                             │
│     ▼              ▼                                             │
│   Create Order ─── Select "VNPAY Sandbox"                        │
│     │                                                           │
│     ▼                                                           │
│   POST /payments/vnpay/create                                   │
│     │                                                           │
│     ▼                                                           │
│   Backend: Validate Order & Ownership                            │
│     │                                                           │
│     ▼                                                           │
│   Create Payment Record (PENDING)                                │
│     │                                                           │
│     ▼                                                           │
│   Generate VNPAY Payment URL (HMAC-SHA512 signed)                │
│     │                                                           │
│     ▼                                                           │
│   Frontend redirects to VNPAY Sandbox                            │
│     │                                                           │
│     ▼                                                           │
│   User completes TEST transaction                                │
│     │                                                           │
│     ▼                                                           │
│   VNPAY sends two callbacks:                                      │
│     │                                                           │
│     ├──► GET /payments/vnpay/return (User redirect)             │
│     │                                                           │
│     └──► GET /payments/vnpay/ipn (Server-to-server)           │
│             │                                                   │
│             ▼                                                   │
│           Backend verifies signature                              │
│             │                                                   │
│             ▼                                                   │
│           Payment SUCCESS (if signature valid & code=00)         │
│             │                                                   │
│             ▼                                                   │
│           Order CONFIRMED                                        │
│             │                                                   │
│             ▼                                                   │
│           Escrow FUNDED                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Environment Variables

Add these to your `.env` file:

```env
# VNPAY Sandbox Configuration
VNPAY_VERSION=2.1.0
VNPAY_COMMAND=pay
VNPAY_CURR_CODE=VND
VNPAY_LOCALE=vn
VNPAY_ORDER_TYPE=other

# IMPORTANT: Get these from https://sandbox.vnpayment.vn/devreg/
VNPAY_TMN_CODE=YOUR_TMN_CODE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET

# URLs
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_API_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
VNPAY_RETURN_URL=http://localhost:5173/payment/vnpay/return
VNPAY_IPN_URL=http://localhost:3000/api/payments/vnpay/ipn
```

## Registration

To get sandbox credentials:

1. Go to https://sandbox.vnpayment.vn/devreg/
2. Register with your email
3. Wait for credentials to be sent to your email
4. Fill in `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET`

## API Endpoints

### 1. Create Payment URL

```http
POST /api/payments/vnpay/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": 123
}
```

**Response:**
```json
{
  "paymentId": 456,
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "txnRef": "ORD123-1699999999999",
  "expiresAt": "2026-09-30T10:15:00.000Z"
}
```

### 2. Return URL (User Redirect)

```http
GET /payment/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=...&vnp_Amount=...&vnp_SecureHash=...
```

This endpoint:
- Verifies VNPAY signature
- Returns payment result to frontend
- Does NOT update database (use IPN for that)

### 3. IPN (Server-to-Server)

```http
GET /api/payments/vnpay/ipn?vnp_ResponseCode=00&vnp_TxnRef=...&vnp_Amount=...&vnp_SecureHash=...
```

This endpoint:
- Verifies VNPAY signature
- Updates Payment status
- Updates Order status
- Creates Escrow
- Returns VNPAY response format

**VNPAY expects:**
```json
{
  "vnp_ResponseCode": "00",
  "vnp_TxnRef": "ORD123-1699999999999",
  "vnp_TransactionNo": "1234567"
}
```

## Response Codes

| Code | Description | Action |
|------|-------------|--------|
| 00 | Success | Mark Payment SUCCESS |
| 01 | Transaction not found | Log error |
| 04 | Invalid amount | Reject |
| 24 | Cancelled by user | Mark Payment CANCELLED |
| 97 | Invalid signature | Reject |
| 99 | Unknown error | Log error |

## Security Features

### 1. Signature Verification

All VNPAY callbacks must be verified:
1. Extract `vnp_SecureHash` from callback
2. Remove signature params from data
3. Sort remaining params alphabetically
4. Build hash data string
5. Calculate HMAC-SHA512 with secret
6. Compare using timing-safe comparison

### 2. Amount Verification

The amount in callback MUST match the database:
```typescript
const callbackAmount = parseInt(vnp_Amount) / 100;
if (callbackAmount !== payment.amount) {
  throw new Error('Amount mismatch');
}
```

### 3. Transaction Reference

`vnp_TxnRef` must match the payment record:
```typescript
const payment = await prisma.payment.findFirst({
  where: {
    transactionId: vnp_TxnRef,
    method: 'VNPAY_SANDBOX',
  },
});
```

### 4. Ownership Validation

Only the order owner can create payment:
```typescript
if (order.buyerId !== userId) {
  throw new ForbiddenException('Not your order');
}
```

### 5. Idempotency

Duplicate callbacks are handled:
```typescript
if (payment.status === 'SUCCESS') {
  return { success: true, message: 'Already processed' };
}
```

## Database Changes

### Payment Model (New Fields)
```prisma
model Payment {
  // ... existing fields ...

  // VNPAY specific fields
  gatewayTransactionId  String?  // vnp_TransactionNo
  gatewayResponseCode  String?  // vnp_ResponseCode
  gatewayResponseMessage String? // Human-readable message
}
```

### PaymentMethod Enum (New Value)
```prisma
enum PaymentMethod {
  COD
  MOCK_ONLINE
  VNPAY_SANDBOX  // NEW
}
```

## Demo Flow

### Prerequisites
1. Register at https://sandbox.vnpayment.vn/devreg/
2. Get `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET`
3. Add to your `.env` file
4. Restart backend

### Step-by-Step Demo

1. **Login** to the marketplace
2. **Browse** textbooks and add to cart
3. **Checkout** → Go to payment step
4. **Select** "VNPAY Sandbox" payment method
5. **Click** "Thanh toán qua VNPAY"
6. **Redirected** to VNPAY Sandbox test page
7. **Select** test card (NCB):
   - Card number: `9704198526191432198`
   - Cardholder: `NGUYEN VAN A`
   - Expired: `07/15`
   - OTP: `123456`
8. **Complete** payment
9. **Redirected** back to `/payment/vnpay/return`
10. **See** success/failure result
11. **Check** order status in My Orders
12. **Admin** can see payment in Admin Dashboard

## Test Cards

| Bank | Card Number | Cardholder | Expired | OTP |
|------|-------------|------------|---------|-----|
| NCB | 9704198526191432198 | NGUYEN VAN A | 07/15 | 123456 |

## Local Development

Since VNPAY requires public URLs for IPN:

### Option 1: Use ngrok (Recommended)
```bash
# Install ngrok
brew install ngrok

# Start backend
npm run start:dev

# In another terminal, expose backend
ngrok http 3000

# Update .env
VNPAY_IPN_URL=https://your-ngrok-url.ngrok.io/api/payments/vnpay/ipn
VNPAY_RETURN_URL=https://your-ngrok-url.ngrok.io/payment/vnpay/return
```

### Option 2: Use Cloudflare Tunnel
```bash
cloudflared tunnel --url http://localhost:3000
```

## Troubleshooting

### "VNPAY_HASH_SECRET is not configured"
- Make sure you added the credentials to `.env`
- Restart the backend after adding credentials

### "Invalid signature"
- Check that `VNPAY_HASH_SECRET` matches the one from sandbox portal
- Make sure you're not URL-encoding the secure hash twice

### "Amount mismatch"
- VNPAY sends amount × 100
- Backend divides by 100 for comparison
- Make sure database amount is in VND (not multiplied)

### IPN not working
- IPN requires public URL
- Use ngrok for local development
- Check backend logs for IPN requests

### Payment stuck at PENDING
- IPN might have failed
- Check admin dashboard for payment status
- Verify database transaction completed

## Files Created/Modified

### Backend Files Created
- `src/modules/payment/gateway/vnpay.utils.ts` - Utility functions
- `src/modules/payment/gateway/vnpay.gateway.ts` - VNPAY gateway service
- `src/modules/payment/controllers/vnpay.controller.ts` - VNPAY endpoints
- `src/modules/payment/gateway/__tests__/vnpay.utils.spec.ts` - Unit tests

### Backend Files Modified
- `prisma/schema.prisma` - Added VNPAY_SANDBOX, new Payment fields
- `backend/.env` - Added VNPAY configuration
- `backend/.env.example` - Added VNPAY configuration template
- `src/modules/payment/payment.module.ts` - Added VnpayController
- `src/modules/payment/payment.service.ts` - Added VNPAY payment methods
- `src/modules/payment/controllers/index.ts` - Export VnpayController
- `src/modules/payment/gateway/index.ts` - Export VNPAY modules
- `src/common/services/audit-log.service.ts` - Added VNPAY audit actions

### Frontend Files Created
- `src/pages/payment/VnpayReturnPage.tsx` - Payment result page

### Frontend Files Modified
- `src/App.tsx` - Added VNPAY return route
- `src/pages/cart/CheckoutPage.tsx` - Added VNPAY payment option
- `src/pages/payment/index.ts` - Export VnpayReturnPage
- `src/lib/api.ts` - Added vnpayApi
- `src/types/index.ts` - Added VNPAY types

## Security Reminders

1. **NEVER commit `VNPAY_HASH_SECRET` to git**
2. **NEVER expose secrets to frontend**
3. **ALWAYS verify signatures before processing**
4. **ALWAYS verify amount matches database**
5. **ALWAYS use transaction for database updates**
6. **NEVER mark payment SUCCESS without IPN confirmation**

## References

- VNPAY Sandbox Portal: https://sandbox.vnpayment.vn/
- VNPAY Documentation: https://sandbox.vnpayment.vn/apis/
- Payment Integration Guide: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html

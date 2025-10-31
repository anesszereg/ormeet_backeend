# Email Setup Guide

## ✅ Configuration Complete

The email notification system is now fully configured and ready to use!

## 📧 Email Credentials

Your Gmail SMTP is configured with:
- **Email:** anesszereg1@gmail.com
- **App Password:** opqs qfmh petr sfvt
- **SMTP Server:** smtp.gmail.com:587

## 🚀 How to Test

### 1. Start the Server

```bash
npm run start:dev
```

### 2. Test Registration with Email

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "phone": "+1234567890"
  }'
```

**Expected Result:**
- ✅ User created in database
- ✅ Welcome email sent to test@example.com
- ✅ Email contains verification link
- ✅ Response includes verification message

### 3. Test Email Verification

From the welcome email, copy the verification token and:

```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE"
  }'
```

### 4. Test Password Reset

```bash
# Step 1: Request reset
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# Step 2: Check email for reset token, then:
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_HERE",
    "newPassword": "NewSecure456!"
  }'
```

## 📬 Email Templates

All 5 email templates are ready:

1. **welcome.hbs** - Registration welcome email
2. **verify-email.hbs** - Email verification reminder
3. **reset-password.hbs** - Password reset link
4. **password-changed.hbs** - Password change confirmation
5. **login-notification.hbs** - Login security alert

## 🔧 Troubleshooting

### Templates Not Found Error

If you see `ENOENT: no such file or directory` error:

```bash
# Rebuild the project to copy templates
npm run build

# Or restart in dev mode
npm run start:dev
```

### Email Not Sending

1. **Check Gmail Settings:**
   - Ensure 2-factor authentication is enabled
   - App password is correct (not regular password)
   - Less secure app access is NOT needed (using app password)

2. **Check .env File:**
   ```env
   EMAIL_USER=anesszereg1@gmail.com
   EMAIL_PASSWORD=opqs qfmh petr sfvt
   APP_URL=http://localhost:3000
   ```

3. **Check Server Logs:**
   - Look for "Failed to send welcome email" messages
   - Check SMTP connection errors

### Test Email Delivery

Use a real email address you control to test:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "YOUR_REAL_EMAIL@gmail.com",
    "password": "Test123!",
    "name": "Your Name"
  }'
```

Then check your inbox (and spam folder) for the welcome email.

## 📊 Email Features

### Registration Flow
1. User registers → Welcome email sent
2. User clicks verification link → Email verified
3. User can now use all features

### Password Reset Flow
1. User requests reset → Reset email sent (1-hour expiry)
2. User clicks link → Enters new password
3. Password updated → Confirmation email sent

### Security Features
- ✅ Tokens are cryptographically secure (32 bytes)
- ✅ Password reset expires in 1 hour
- ✅ Tokens are single-use (cleared after use)
- ✅ Email verification required for full access
- ✅ Password requirements enforced

## 🎨 Customizing Templates

Templates are located in: `src/email/templates/`

To customize:
1. Edit the `.hbs` file
2. Rebuild: `npm run build`
3. Restart server: `npm run start:dev`

Variables available in templates:
- `{{name}}` - User's name
- `{{verificationUrl}}` - Verification link
- `{{resetUrl}}` - Password reset link
- `{{appName}}` - Application name (Ormeet)
- `{{loginTime}}` - Login timestamp
- `{{ipAddress}}` - User's IP
- `{{userAgent}}` - Browser/device info

## 📝 API Endpoints

All email-related endpoints:

```
POST /auth/register              → Sends welcome email
POST /auth/verify-email          → Verifies email
POST /auth/resend-verification   → Resends verification
POST /auth/forgot-password       → Sends reset email
POST /auth/reset-password        → Resets password
```

## ✅ Next Steps

1. Test all email flows with real email addresses
2. Customize email templates with your branding
3. Consider adding email notifications for:
   - Order confirmations
   - Ticket purchases
   - Event reminders
   - Review notifications
4. Set up production email service (SendGrid, AWS SES) for scale

## 🔐 Production Considerations

For production:
1. Use a dedicated email service (SendGrid, AWS SES, Mailgun)
2. Implement email queue (Bull + Redis) for reliability
3. Add email rate limiting
4. Monitor email delivery rates
5. Handle bounces and complaints
6. Add unsubscribe functionality
7. Use environment-specific APP_URL

## 📞 Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify Gmail app password is correct
3. Ensure templates are in dist folder
4. Test with curl commands above
5. Check spam folder for test emails

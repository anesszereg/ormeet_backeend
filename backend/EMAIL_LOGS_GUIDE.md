# Email Logging Guide

## 📊 What You'll See in the Logs

### ✅ Successful Email Sending

When a user registers successfully:
```
[Nest] 12345  - 10/27/2025, 11:45:23 PM   LOG [EmailService] 📧 Sending welcome email to: user@example.com
[Nest] 12345  - 10/27/2025, 11:45:25 PM   LOG [EmailService] ✅ Welcome email sent successfully to: user@example.com
```

### ❌ Failed Email Sending

When email fails (e.g., SMTP error):
```
[Nest] 12345  - 10/27/2025, 11:45:23 PM   LOG [EmailService] 📧 Sending welcome email to: user@example.com
[Nest] 12345  - 10/27/2025, 11:45:25 PM ERROR [EmailService] ❌ Failed to send welcome email to: user@example.com
Error: Invalid login: 535-5.7.8 Username and Password not accepted
    at SMTPConnection._formatError (/path/to/nodemailer/lib/smtp-connection/index.js:784:19)
    ...
⚠️ Failed to send welcome email, but user registration succeeded: Invalid login: 535-5.7.8 Username and Password not accepted
```

## 📧 All Email Types with Logs

### 1. Welcome Email (Registration)
```
[EmailService] 📧 Sending welcome email to: john@example.com
[EmailService] ✅ Welcome email sent successfully to: john@example.com
```

### 2. Email Verification
```
[EmailService] 📧 Sending verification email to: john@example.com
[EmailService] ✅ Verification email sent successfully to: john@example.com
```

### 3. Password Reset
```
[EmailService] 📧 Sending password reset email to: john@example.com
[EmailService] ✅ Password reset email sent successfully to: john@example.com
```

### 4. Password Changed Confirmation
```
[EmailService] 📧 Sending password changed confirmation to: john@example.com
[EmailService] ✅ Password changed email sent successfully to: john@example.com
```

### 5. Login Notification
```
[EmailService] 📧 Sending login notification to: john@example.com (IP: 192.168.1.100)
[EmailService] ✅ Login notification sent successfully to: john@example.com
```

## 🔍 How to Monitor Logs

### Development Mode
```bash
npm run start:dev
```

Watch the console output in real-time. You'll see:
- Every email attempt (📧)
- Every success (✅)
- Every failure (❌)

### Production Mode
```bash
npm run start:prod
```

Logs will be written to stdout. Redirect to a file:
```bash
npm run start:prod > logs/app.log 2>&1
```

### Filter Email Logs Only
```bash
# In development
npm run start:dev | grep EmailService

# From log file
cat logs/app.log | grep EmailService
```

## 📈 Log Patterns to Watch For

### Success Pattern
```
📧 Sending → ✅ sent successfully
```
Time between these should be 1-3 seconds for Gmail SMTP.

### Failure Pattern
```
📧 Sending → ❌ Failed to send
```
Followed by error details and stack trace.

### Common Errors

#### 1. Authentication Error
```
❌ Failed to send welcome email to: user@example.com
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Fix:** Check EMAIL_USER and EMAIL_PASSWORD in .env

#### 2. Template Not Found
```
❌ Failed to send welcome email to: user@example.com
Error: ENOENT: no such file or directory, open '.../dist/email/templates/welcome.hbs'
```
**Fix:** Run `npm run build` to copy templates

#### 3. SMTP Connection Timeout
```
❌ Failed to send welcome email to: user@example.com
Error: Connection timeout
```
**Fix:** Check internet connection or SMTP server

#### 4. Rate Limiting
```
❌ Failed to send welcome email to: user@example.com
Error: 454 4.7.0 Too many login attempts, please try again later
```
**Fix:** Wait a few minutes, Gmail has rate limits

## 🎯 Testing Email Logs

### Test 1: Successful Registration
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

**Expected Logs:**
```
[EmailService] 📧 Sending welcome email to: test@example.com
[EmailService] ✅ Welcome email sent successfully to: test@example.com
```

### Test 2: Password Reset
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Logs:**
```
[EmailService] 📧 Sending password reset email to: test@example.com
[EmailService] ✅ Password reset email sent successfully to: test@example.com
```

### Test 3: Resend Verification
```bash
curl -X POST http://localhost:3000/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Logs:**
```
[EmailService] 📧 Sending verification email to: test@example.com
[EmailService] ✅ Verification email sent successfully to: test@example.com
```

## 📊 Log Analysis

### Count Successful Emails
```bash
cat logs/app.log | grep "✅.*email sent successfully" | wc -l
```

### Count Failed Emails
```bash
cat logs/app.log | grep "❌ Failed to send" | wc -l
```

### List All Recipients
```bash
cat logs/app.log | grep "📧 Sending" | sed 's/.*to: //' | sort | uniq
```

### Find Errors for Specific Email
```bash
cat logs/app.log | grep "user@example.com"
```

## 🚨 Alert on Failures

### Simple Monitoring Script
```bash
#!/bin/bash
# monitor-emails.sh

tail -f logs/app.log | while read line; do
  if echo "$line" | grep -q "❌ Failed to send"; then
    echo "🚨 EMAIL FAILURE DETECTED!"
    echo "$line"
    # Send alert (e.g., to Slack, Discord, etc.)
  fi
done
```

## 💡 Tips

1. **Keep logs organized:** Use log rotation (e.g., `logrotate`)
2. **Monitor in real-time:** Use `tail -f` during development
3. **Set up alerts:** Get notified when emails fail
4. **Track metrics:** Count success/failure rates
5. **Debug with grep:** Filter logs by email address or type

## 🔧 Troubleshooting Checklist

When emails aren't sending:

- [ ] Check logs for 📧 emoji (email attempt started)
- [ ] Check logs for ❌ emoji (failure occurred)
- [ ] Read the error message after ❌
- [ ] Verify .env file has correct EMAIL_USER and EMAIL_PASSWORD
- [ ] Verify templates exist in dist/email/templates/
- [ ] Test SMTP connection manually
- [ ] Check Gmail security settings
- [ ] Verify APP_URL is set correctly
- [ ] Restart the server after .env changes

## 📞 Quick Debug Commands

```bash
# Watch logs in real-time
npm run start:dev

# Filter only email logs
npm run start:dev 2>&1 | grep -E "(📧|✅|❌)"

# Test registration and watch logs
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test"}' \
  & tail -f logs/app.log | grep EmailService
```

## ✅ Success Indicators

You'll know emails are working when you see:
1. 📧 emoji appears (sending started)
2. ✅ emoji appears 1-3 seconds later (sent successfully)
3. No ❌ emoji (no failures)
4. Email arrives in recipient's inbox

Happy emailing! 📧✨

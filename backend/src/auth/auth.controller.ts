import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, SendVerificationCodeDto, VerifyCodeDto, LoginWithCodeDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: `Register a new user with email or phone number. 
    
**Features:**
- Register with email and/or phone
- Set user preferences (interested event categories for attendees, hosting types for organizers)
- Automatic email verification link sent
- Choose user role: ATTENDEE or ORGANIZER

**Example for Attendee:**
\`\`\`json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "password": "secure123",
  "roles": ["attendee"],
  "interestedEventCategories": ["concert", "festival", "party"]
}
\`\`\`

**Example for Organizer:**
\`\`\`json
{
  "name": "Bob Events",
  "email": "bob@events.com",
  "phone": "+0987654321",
  "password": "secure123",
  "roles": ["organizer"],
  "hostingEventTypes": ["conference", "workshop", "seminar"]
}
\`\`\`
    `
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        user: {
          id: 'uuid',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          roles: ['attendee'],
          interestedEventCategories: ['concert', 'festival'],
          emailVerified: false,
          phoneVerified: false,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        message: 'Registration successful! Please check your email to verify your account.',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Login with email/phone and password',
    description: `Traditional login with password. Supports both email and phone number.
    
**Login with Email:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

**Login with Phone:**
\`\`\`json
{
  "phone": "+1234567890",
  "password": "password123"
}
\`\`\`

**Note:** Sends login notification email with IP address and device info.
    `
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        user: {
          id: 'uuid',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          roles: ['attendee'],
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Invalid input data - Email or phone required' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    // Extract IP address from request
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'Unknown';
    // Extract user agent from request headers
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address with token' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Email already verified' })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset email sent if user exists' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('send-verification-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Send 6-digit verification code',
    description: `Send a verification code via email or SMS for various purposes.
    
**Purposes:**
- \`login\` - Passwordless login
- \`registration\` - Account registration
- \`email_verification\` - Verify email address
- \`phone_verification\` - Verify phone number
- \`password_reset\` - Reset password

**Email Verification Example:**
\`\`\`json
{
  "email": "user@example.com",
  "type": "email",
  "purpose": "email_verification"
}
\`\`\`

**Phone Verification Example:**
\`\`\`json
{
  "phone": "+1234567890",
  "type": "phone",
  "purpose": "phone_verification"
}
\`\`\`

**Passwordless Login Example:**
\`\`\`json
{
  "email": "user@example.com",
  "type": "email",
  "purpose": "login"
}
\`\`\`

**Security:**
- Code expires in 10 minutes
- Maximum 3 attempts per code
- Previous codes invalidated when new one requested

**Note:** For development, codes are logged to console. In production, integrate SMS provider (Twilio, AWS SNS, etc.).
    `
  })
  @ApiBody({ type: SendVerificationCodeDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Verification code sent successfully',
    schema: {
      example: {
        message: 'Verification code sent to user@example.com',
        expiresIn: '10 minutes'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid request - Email or phone required' })
  async sendVerificationCode(@Body() sendCodeDto: SendVerificationCodeDto) {
    return this.authService.sendVerificationCode(sendCodeDto);
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify 6-digit code',
    description: `Verify a code received via email or SMS.
    
**Example:**
\`\`\`json
{
  "email": "user@example.com",
  "type": "email",
  "code": "123456"
}
\`\`\`

**Automatic Actions:**
- If purpose was \`email_verification\`, marks email as verified
- If purpose was \`phone_verification\`, marks phone as verified
- Updates verification timestamp

**Error Handling:**
- Invalid code: 400 error
- Expired code (>10 min): 400 error
- Max attempts exceeded (>3): 400 error
    `
  })
  @ApiBody({ type: VerifyCodeDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Code verified successfully',
    schema: {
      example: {
        message: 'Verification successful!',
        verified: true
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyCodeDto);
  }

  @Post('login-with-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Passwordless login with verification code',
    description: `Login without password using a verification code. More secure and convenient.
    
**Two-Step Process:**

**Step 1:** Request a login code
\`\`\`json
POST /auth/send-verification-code
{
  "email": "user@example.com",
  "type": "email",
  "purpose": "login"
}
\`\`\`

**Step 2:** Login with the received code
\`\`\`json
POST /auth/login-with-code
{
  "email": "user@example.com",
  "type": "email",
  "code": "123456"
}
\`\`\`

**Works with Phone Too:**
\`\`\`json
{
  "phone": "+1234567890",
  "type": "phone",
  "code": "654321"
}
\`\`\`

**Benefits:**
- No password needed
- More secure (code expires in 10 min)
- Convenient for mobile users
- Automatic login notification sent
    `
  })
  @ApiBody({ type: LoginWithCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        user: {
          id: 'uuid',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          roles: ['attendee'],
          emailVerified: true,
          phoneVerified: true,
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid code' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data or code expired' })
  async loginWithCode(@Body() loginWithCodeDto: LoginWithCodeDto, @Req() req: Request) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.authService.loginWithCode(loginWithCodeDto, ipAddress, userAgent);
  }
}

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole, VerificationCode, VerificationType, VerificationPurpose } from '../entities';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, SendVerificationCodeDto, VerifyCodeDto, LoginWithCodeDto } from './dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { 
      email, 
      password, 
      name, 
      phone, 
      roles, 
      organizationId,
      interestedEventCategories,
      hostingEventTypes,
    } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = this.userRepository.create({
      name,
      email,
      passwordHash,
      phone,
      roles: roles || [UserRole.ATTENDEE],
      organizationId,
      interestedEventCategories,
      hostingEventTypes,
      emailVerificationToken,
      emailVerified: false,
    });

    await this.userRepository.save(user);

    // Send welcome email with verification link
    try {
      await this.emailService.sendWelcomeEmail(email, name, emailVerificationToken);
    } catch (error) {
      console.error('⚠️ Failed to send welcome email, but user registration succeeded:', error.message);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
      message: 'Registration successful! Please check your email to verify your account.',
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, phone, password } = loginDto;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone number is required');
    }

    // Find user by email or phone
    const user = await this.userRepository.findOne({
      where: email ? { email } : { phone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Send login notification email (only if email exists)
    if (user.email) {
      try {
        await this.emailService.sendLoginNotification(
          user.email, 
          user.name, 
          ipAddress || 'Unknown',
          userAgent || 'Unknown'
        );
      } catch (error) {
        console.error('⚠️ Failed to send login notification email:', error.message);
        // Don't fail login if email fails
      }
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    const { passwordHash, emailVerificationToken, passwordResetToken, ...sanitized } = user;
    return sanitized;
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

    // Debug log
    console.log('🔍 Received verification token:', token);

    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    console.log('👤 User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('🔑 Stored token:', user.emailVerificationToken);
      console.log('✅ Email verified:', user.emailVerified);
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = null as any;

    await this.userRepository.save(user);

    return {
      message: 'Email verified successfully!',
      user: this.sanitizeUser(user),
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendEmailVerification(email, user.name, emailVerificationToken);

    return {
      message: 'Verification email sent successfully!',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate password reset token
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date();
    passwordResetExpires.setHours(passwordResetExpires.getHours() + 1); // 1 hour expiry

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await this.userRepository.save(user);

    // Debug log
    console.log('🔑 Generated password reset token:', passwordResetToken);
    console.log('⏰ Token expires at:', passwordResetExpires);

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(email, user.name, passwordResetToken);
    } catch (error) {
      console.error('⚠️ Failed to send password reset email:', error.message);
    }

    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Debug log
    console.log('🔍 Received reset token:', token);
    console.log('🕐 Current time:', new Date());

    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    console.log('👤 User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('🔑 Stored token:', user.passwordResetToken);
      console.log('⏰ Token expires:', user.passwordResetExpires);
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    user.passwordResetToken = null as any;
    user.passwordResetExpires = null as any;

    await this.userRepository.save(user);

    // Send password changed confirmation email
    try {
      await this.emailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (error) {
      console.error('⚠️ Failed to send password changed email:', error.message);
    }

    return {
      message: 'Password reset successfully!',
    };
  }

  // ========== Verification Code Methods ==========

  async sendVerificationCode(sendCodeDto: SendVerificationCodeDto) {
    const { email, phone, type, purpose } = sendCodeDto;
    const identifier = type === VerificationType.EMAIL ? email : phone;

    if (!identifier) {
      throw new BadRequestException('Email or phone number is required');
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Invalidate previous codes
    await this.verificationCodeRepository.update(
      { identifier, type, verified: false },
      { verified: true }, // Mark as used
    );

    // Create new verification code
    const verificationCode = this.verificationCodeRepository.create({
      identifier,
      type,
      purpose,
      code,
      expiresAt,
      verified: false,
      attempts: 0,
      maxAttempts: 3,
    });

    await this.verificationCodeRepository.save(verificationCode);

    // Send code via email or SMS
    if (type === VerificationType.EMAIL && email) {
      try {
        await this.emailService.sendVerificationCode(email, code, purpose);
      } catch (error) {
        console.error('⚠️ Failed to send verification code email:', error.message);
        // Still log to console as fallback for development
        console.log(`📧 Email Code for ${email}: ${code} (Purpose: ${purpose})`);
      }
    } else if (type === VerificationType.PHONE && phone) {
      // TODO: Implement SMS sending (Twilio, etc.)
      console.log(`📱 SMS Code for ${phone}: ${code}`);
      // For now, just log it (in production, integrate SMS service)
    }

    return {
      message: `Verification code sent to ${identifier}`,
      expiresIn: '10 minutes',
    };
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    const { email, phone, type, code } = verifyCodeDto;
    const identifier = type === VerificationType.EMAIL ? email : phone;

    if (!identifier) {
      throw new BadRequestException('Email or phone number is required');
    }

    // Find verification code
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        identifier,
        type,
        code,
        verified: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!verificationCode) {
      throw new BadRequestException('Invalid verification code');
    }

    // Check if expired
    if (new Date() > verificationCode.expiresAt) {
      throw new BadRequestException('Verification code has expired');
    }

    // Check max attempts
    if (verificationCode.attempts >= verificationCode.maxAttempts) {
      throw new BadRequestException('Maximum verification attempts exceeded');
    }

    // Increment attempts
    verificationCode.attempts += 1;

    // Mark as verified
    verificationCode.verified = true;
    verificationCode.verifiedAt = new Date();

    await this.verificationCodeRepository.save(verificationCode);

    // Update user verification status if applicable
    if (verificationCode.purpose === VerificationPurpose.EMAIL_VERIFICATION && email) {
      const user = await this.userRepository.findOne({ where: { email } });
      if (user) {
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        await this.userRepository.save(user);
      }
    } else if (verificationCode.purpose === VerificationPurpose.PHONE_VERIFICATION && phone) {
      const user = await this.userRepository.findOne({ where: { phone } });
      if (user) {
        user.phoneVerified = true;
        user.phoneVerifiedAt = new Date();
        await this.userRepository.save(user);
      }
    }

    return {
      message: 'Verification successful!',
      verified: true,
    };
  }

  async loginWithCode(loginWithCodeDto: LoginWithCodeDto, ipAddress?: string, userAgent?: string) {
    const { email, phone, type, code } = loginWithCodeDto;
    const identifier = type === VerificationType.EMAIL ? email : phone;

    if (!identifier) {
      throw new BadRequestException('Email or phone number is required');
    }

    // Verify the code first
    await this.verifyCode({
      email,
      phone,
      type,
      code,
    });

    // Find user
    const user = await this.userRepository.findOne({
      where: type === VerificationType.EMAIL ? { email } : { phone },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Send login notification email (only if email exists)
    if (user.email) {
      try {
        await this.emailService.sendLoginNotification(
          user.email,
          user.name,
          ipAddress || 'Unknown',
          userAgent || 'Unknown',
        );
      } catch (error) {
        console.error('⚠️ Failed to send login notification email:', error.message);
      }
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }
}

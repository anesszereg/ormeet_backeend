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
import { User, UserRole, VerificationCode, VerificationType, VerificationPurpose, Organization } from '../entities';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, SendVerificationCodeDto, VerifyCodeDto, LoginWithCodeDto } from './dto';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const {
      email,
      password,
      name,
      phone,
      role: requestedRole,
      organizationId,
      interestedEventCategories,
      hostingEventTypes,
    } = registerDto;

    const role = requestedRole || UserRole.ATTENDEE;

    // Uniqueness is per (email, role): the same email may have one
    // attendee account AND one organizer account, but not two of either.
    const existingUser = await this.userRepository.findOne({
      where: { email, role },
    });

    if (existingUser) {
      throw new ConflictException(
        `An ${role} account with this email already exists. Please log in instead.`,
      );
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
      role,
      organizationId,
      interestedEventCategories,
      hostingEventTypes,
      emailVerified: false,
      emailVerificationToken,
    });

    await this.userRepository.save(user);

    // If registering as organizer and no organization provided, auto-create one
    if (!organizationId && role === UserRole.ORGANIZER) {
      const org = this.organizationRepository.create({
        name: `${name}'s Organization`,
        ownerId: user.id,
      });
      const savedOrg = await this.organizationRepository.save(org);

      // Link the organization back to the user
      user.organizationId = savedOrg.id;
      await this.userRepository.update(user.id, { organizationId: savedOrg.id });
    }

    // Send welcome email with verification link
    try {
      await this.emailService.sendWelcomeEmail(email, name, emailVerificationToken);
    } catch (error) {
      console.error('Failed to send welcome email:', error.message);
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
    const { email, phone, password, role } = loginDto;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone number is required');
    }

    // Same email may belong to multiple accounts (one per role). Look up
    // every candidate and either disambiguate by `role` or by which
    // password matches.
    const candidates = await this.userRepository.find({
      where: email ? { email } : { phone },
    });

    if (candidates.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let user: User | undefined;

    if (role) {
      user = candidates.find((c) => c.role === role);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else if (candidates.length === 1) {
      user = candidates[0];
    } else {
      // Multiple accounts share this email. Frontend must resend with `role`.
      throw new ConflictException({
        code: 'MULTIPLE_ACCOUNTS',
        message:
          'This email has multiple accounts. Please choose which one to log into.',
        availableRoles: candidates.map((c) => c.role),
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Resend verification email
      try {
        // Generate new verification token if old one doesn't exist
        if (!user.emailVerificationToken) {
          user.emailVerificationToken = crypto.randomBytes(32).toString('hex');
          await this.userRepository.save(user);
        }
        
        await this.emailService.sendWelcomeEmail(
          user.email,
          user.name,
          user.emailVerificationToken
        );
        console.log(`📧 Resent verification email to ${user.email}`);
        
        throw new UnauthorizedException(
          'Your email is not verified. We have sent you a new verification link. Please check your inbox and verify your email to continue.'
        );
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        console.error('⚠️ Failed to resend verification email:', error.message);
        throw new UnauthorizedException(
          'Please verify your email before logging in. If you did not receive the verification email, please contact support.'
        );
      }
    }

    // // Send login notification email (disabled - email not working on Render)
    // if (user.email) {
    //   try {
    //     // await this.emailService.sendLoginNotification(
    //     //   user.email, 
    //     //   user.name, 
    //     //   ipAddress || 'Unknown',
    //     //   userAgent || 'Unknown'
    //     // );
    //   } catch (error) {
    //     console.error('⚠️ Failed to send login notification email:', error.message);
    //   }
    // }

    // Auto-create organization for existing organizer users who don't have one
    if (!user.organizationId && user.role === UserRole.ORGANIZER) {
      const org = this.organizationRepository.create({
        name: `${user.name}'s Organization`,
        ownerId: user.id,
      });
      const savedOrg = await this.organizationRepository.save(org);
      user.organizationId = savedOrg.id;
      await this.userRepository.update(user.id, { organizationId: savedOrg.id });
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
      role: user.role,
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
    // Send a fresh verification link for every unverified account
    // tied to this email (attendee + organizer if both exist).
    const users = await this.userRepository.find({ where: { email } });

    if (users.length === 0) {
      throw new NotFoundException('User not found');
    }

    const unverified = users.filter((u) => !u.emailVerified);
    if (unverified.length === 0) {
      throw new BadRequestException('Email already verified');
    }

    for (const user of unverified) {
      const token = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = token;
      await this.userRepository.save(user);

      try {
        await this.emailService.sendEmailVerification(email, user.name, token);
      } catch (error) {
        console.error(
          `Failed to send verification email for ${user.role} account:`,
          error.message,
        );
      }
    }

    return { message: 'Verification email sent successfully!' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Send a separate reset link per account (one per role).
    const users = await this.userRepository.find({ where: { email } });

    if (users.length === 0) {
      // Don't reveal if user exists
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiry

    for (const user of users) {
      const token = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = token;
      user.passwordResetExpires = expires;
      await this.userRepository.save(user);

      console.log(`🔑 Generated reset token for ${user.role} account ${user.id}`);

      try {
        await this.emailService.sendPasswordResetEmail(email, user.name, token);
      } catch (error) {
        console.error(
          `Failed to send reset email for ${user.role} account:`,
          error.message,
        );
      }
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
        console.log(`📧 Verification code sent to ${email}`);
      } catch (error) {
        console.error(`⚠️ Failed to send verification code email:`, error.message);
        console.log(`📧 Email Code for ${email}: ${code} (Purpose: ${purpose})`);
      }
    } else if (type === VerificationType.PHONE && phone) {
      // Sends via Twilio when configured, otherwise logs to console (dev fallback).
      const sent = await this.smsService.sendVerificationCode(phone, code);
      if (!sent) {
        console.log(`📱 SMS Code for ${phone}: ${code} (Purpose: ${purpose})`);
      }
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

    // // Send login notification email (disabled - email not working on Render)
    // if (user.email) {
    //   try {
    //     await this.emailService.sendLoginNotification(
    //       user.email,
    //       user.name,
    //       ipAddress || 'Unknown',
    //       userAgent || 'Unknown',
    //     );
    //   } catch (error) {
    //     console.error('⚠️ Failed to send login notification email:', error.message);
    //   }
    // }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async validateOAuthUser(oauthUser: {
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    provider: 'google' | 'facebook';
  }) {
    const { email, firstName, lastName, picture, provider } = oauthUser;

    if (!email) {
      throw new BadRequestException('Email is required from OAuth provider');
    }

    // OAuth maps to a single account. If the email already has multiple
    // accounts (attendee + organizer), prefer the attendee one since
    // OAuth is most commonly used by consumers.
    const candidates = await this.userRepository.find({ where: { email } });
    let user =
      candidates.find((c) => c.role === UserRole.ATTENDEE) ||
      candidates[0];

    if (user) {
      // User exists - update their avatar if provided and not set
      if (picture && !user.avatarUrl) {
        user.avatarUrl = picture;
        await this.userRepository.save(user);
      }
      
      // Mark email as verified since OAuth providers verify emails
      if (!user.emailVerified) {
        user.emailVerified = true;
        await this.userRepository.save(user);
      }
    } else {
      // Create new user from OAuth data (no password required for OAuth users)
      user = this.userRepository.create({
        name: `${firstName} ${lastName}`.trim(),
        email,
        passwordHash: '', // OAuth users don't have a password
        emailVerified: true, // OAuth providers verify emails
        role: UserRole.ATTENDEE,
        avatarUrl: picture,
        oauthProvider: provider,
      });

      await this.userRepository.save(user);
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
    return { message: 'Account deleted successfully' };
  }
}

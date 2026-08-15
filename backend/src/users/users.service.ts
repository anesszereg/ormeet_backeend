import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, Organization, EventCategory } from '../entities';
import {
  UpdateProfileDto,
  UpdateEmailDto,
  UpdatePhoneDto,
  ChangePasswordDto,
  UpdateLocationDto,
  UpdateInterestsDto,
  UpdateHostingTypesDto,
} from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.locale !== undefined) user.locale = dto.locale;

    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async updateEmail(userId: string, dto: UpdateEmailDto): Promise<User> {
    const user = await this.findById(userId);

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Check if email is already taken
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.newEmail },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Email is already in use');
    }

    user.email = dto.newEmail;
    user.emailVerified = false; // Require re-verification

    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async updatePhone(userId: string, dto: UpdatePhoneDto): Promise<User> {
    const user = await this.findById(userId);

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    user.phone = dto.newPhone;
    user.phoneVerified = false; // Require re-verification

    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.findById(userId);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }

  async updateLocation(userId: string, dto: UpdateLocationDto): Promise<User> {
    const user = await this.findById(userId);

    // Store location in metadata
    const metadata = user.metadata || {};
    metadata.location = {
      country: dto.country,
      city: dto.city,
      address: dto.address,
    };
    user.metadata = metadata;

    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  /**
   * Create a sister organizer account for an existing attendee. Each role
   * lives in its own row (see the entity comment), so "adding the
   * organizer role" really means cloning the account with role=organizer
   * and provisioning an organization.
   */
  async addOrganizerRole(userId: string): Promise<User> {
    const user = await this.findById(userId);

    // If they already have an organizer account under this email, bail.
    const existingOrganizer = await this.userRepository.findOne({
      where: { email: user.email, role: UserRole.ORGANIZER },
    });
    if (existingOrganizer) {
      throw new BadRequestException(
        'An organizer account already exists for this email. Please log in to it instead.',
      );
    }

    const org = this.organizationRepository.create({
      name: `${user.name}'s Organization`,
      ownerId: user.id,
    });
    const savedOrg = await this.organizationRepository.save(org);

    const organizer = this.userRepository.create({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      phone: user.phone,
      role: UserRole.ORGANIZER,
      organizationId: savedOrg.id,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      locale: user.locale,
    });
    const savedOrganizer = await this.userRepository.save(organizer);

    console.log(
      `✅ Created sister organizer account ${savedOrganizer.id} for ${user.email}`,
    );

    return this.sanitizeUser(savedOrganizer);
  }

  async updateInterests(userId: string, dto: UpdateInterestsDto): Promise<User> {
    const user = await this.findById(userId);

    user.interestedEventCategories = dto.interestedEventCategories as EventCategory[];

    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async updateHostingTypes(userId: string, dto: UpdateHostingTypesDto): Promise<User> {
    const user = await this.findById(userId);

    user.hostingEventTypes = dto.hostingEventTypes as EventCategory[];

    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: User): User {
    const sanitized = { ...user } as Partial<User>;
    // Remove sensitive fields
    delete sanitized.passwordHash;
    delete sanitized.emailVerificationToken;
    delete sanitized.passwordResetToken;
    delete sanitized.passwordResetExpires;
    // Remove relations to prevent localStorage quota exceeded error
    delete sanitized.orders;
    delete sanitized.tickets;
    delete sanitized.reviews;
    delete sanitized.organization;
    return sanitized as User;
  }
}

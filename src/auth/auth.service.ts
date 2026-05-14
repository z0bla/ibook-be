import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { PasswordValidationService } from './password-validation.service';
import { generateJWT, hashPassword, validatePassword } from './auth.utils';
import { AppointmentStatusEnum } from '../common/enums/appointment-status.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordValidationService: PasswordValidationService,
  ) {}

  async register(email: string, password: string, name: string, phone: string) {
    // Validate password
    const policy = this.passwordValidationService.validate(password, email);
    if (!policy.valid) {
      throw new BadRequestException(policy.message);
    }

    // Check email uniqueness
    try {
      const existing = await this.userRepository.findOne({ where: { email } });

      if (existing) {
        throw new ConflictException('Email already registered');
      }
    } catch (err) {
      this.logger.error('Error during email lookup', err);
      throw new InternalServerErrorException(
        'Database error during email lookup',
      );
    }

    // Create password hash
    const hashed = await hashPassword(password);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashed,
      name,
      phone,
      appointments: [],
    });

    // Save user
    let saved: User;
    try {
      saved = await this.userRepository.save(user);
    } catch (err) {
      this.logger.error('Error during user save', err);
      throw new InternalServerErrorException('Database error during user save');
    }

    // Generate JWT
    const access_token = generateJWT(saved);

    this.logger.log(`User ${email} registered successfully`);

    // Return token and user
    const { id, email: em, name: nm, phone: ph } = saved;

    return {
      access_token,
      user: { id, email: em, name: nm, phone: ph },
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`Failed login attempt for ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const valid = await validatePassword(password, user.password);
    if (!valid) {
      this.logger.warn(`Failed login attempt for ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const access_token = generateJWT(user);

    // Update date/time when user last logged in
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Return token and user info
    const { id, email: em, name: nm, phone: ph } = user;

    return {
      access_token,
      user: { id, email: em, name: nm, phone: ph },
    };
  }

  async logout(userId: string) {
    // Find user by ID
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Update date/time when user last logged out
    if (user) {
      user.lastLogout = new Date();
      await this.userRepository.save(user);
    }

    this.logger.log(`User ${userId} logged out`);

    return { message: 'Logged out successfully' };
  }

  async validateUser(userId: string) {
    // Find user by ID
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return null;
    }

    const { id, email, name, phone } = user;
    return { id, email, name, phone };
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'previousSalons',
        'appointments',
        'appointments.salon',
        'appointments.service',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeAppointments = user.appointments.filter(
      (app) =>
        app.status === AppointmentStatusEnum.BOOKED &&
        app.appointmentDate >= today,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
      appointments: activeAppointments,
      previousSalons: user.previousSalons,
    };
  }
}

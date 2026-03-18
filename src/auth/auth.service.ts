import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { PasswordValidationService } from './password-validation.service';
import { generateJWT, hashPassword, validatePassword } from './auth.utils';

@Injectable()
export class AuthService {
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
      console.error('Error during email lookup', err);
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
    });

    // Save user
    let saved: User;
    try {
      saved = await this.userRepository.save(user);
    } catch (err) {
      console.error('Error during user save', err);
      throw new InternalServerErrorException('Database error during user save');
    }

    // Generate JWT
    const access_token = await generateJWT(saved);

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
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const valid = await validatePassword(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const access_token = await generateJWT(user);

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

    return { message: 'Logged out successfully' };
  }
}

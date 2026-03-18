import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { PasswordValidationService } from './password-validation.service';
import { generateJWT, hashPassword } from './auth.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordValidationService: PasswordValidationService,
  ) {}

  async register(email: string, password: string, name: string, phone: string) {
    const policy = this.passwordValidationService.validate(password, email);

    if (!policy.valid) {
      throw new BadRequestException(policy.message);
    }

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

    const hashed = await hashPassword(password);
    const user = this.userRepository.create({
      email,
      password: hashed,
      name,
      phone,
    });
    let saved: User;

    try {
      saved = await this.userRepository.save(user);
    } catch (err) {
      console.error('Error during user save', err);
      throw new InternalServerErrorException('Database error during user save');
    }

    const access_token = await generateJWT(saved);
    const { id, email: em, name: nm, phone: ph } = saved;

    return {
      access_token,
      user: { id, email: em, name: nm, phone: ph },
    };
  }
}

import { Injectable } from '@nestjs/common';
import {
  isValidPassword,
  isPasswordNotEmail,
} from '../common/utils/password.utils';

@Injectable()
export class PasswordValidationService {
  validate(
    password: string,
    email: string,
  ): { valid: boolean; message: string | null } {
    if (!isValidPassword(password)) {
      return {
        valid: false,
        message:
          'Password must be at least 8 characters and include letters, numbers, and a special character',
      };
    }

    if (!isPasswordNotEmail(password, email)) {
      return {
        valid: false,
        message: 'Password cannot be the same as email',
      };
    }

    return {
      valid: true,
      message: null,
    };
  }
}

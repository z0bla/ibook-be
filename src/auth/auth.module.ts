import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordValidationService } from './password-validation.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGurad } from './guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '24h',
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    PasswordValidationService,
    JwtStrategy,
    JwtAuthGurad,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGurad, JwtStrategy],
})
export class AuthModule {}

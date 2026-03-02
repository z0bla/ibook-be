import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    // Database connection
    DatabaseModule,
    // Other modules will be added here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

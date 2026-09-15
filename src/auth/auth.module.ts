import { Module } from '@nestjs/common';
import { JwtService } from './jwt.services.js';

@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class AuthModule {}
import { Module } from '@nestjs/common';
import { HomeController } from './home.controller.js';
import { HomeService } from './home.services.js';
import { VendorsModule } from '../vendors/vendors.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [VendorsModule, UsersModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
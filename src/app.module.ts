import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { VendorsModule } from './vendors/vendors.module.js';
import { ProductsModule } from './products/products.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HomeModule } from './home/home.module.js';
import { DatabaseModule } from './database/database.module.js'; 
import { RedisModule } from './redis/redis.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    UsersModule,
    VendorsModule,
    ProductsModule,
    AuthModule,
    HomeModule,
    DatabaseModule,
    RedisModule ,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
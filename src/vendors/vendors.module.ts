import { Module } from '@nestjs/common';

import { VendorsController } from './vendors.controller.js';
import { VendorsService } from './vendors.service.js';
import { VendorsRepository } from './vendors.repository.js';

@Module({
  controllers: [VendorsController],

  providers: [
    VendorsService,
    VendorsRepository,
  ],

  exports: [
    VendorsService,
    VendorsRepository,
  ],
})
export class VendorsModule {}
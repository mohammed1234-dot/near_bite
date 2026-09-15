import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';

import { VendorsService } from './vendors.service.js';
import { CreateVendorDto } from './dto/create-vendor.dto.js';
import { UpdateVendorDto } from './dto/update-vendor.dto.js';

import { JwtAuthGuard } from '../guards/jwt.auth.guards.js';
import { RolesGuard } from '../guards/roles.guards.js';
import { Roles } from '../guards/roles.decorators.js';

@Controller('vendors')
export class VendorsController {
  constructor(
    private readonly vendorsService: VendorsService,
  ) {}

  // ADMIN ONLY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(
    @Body() createVendorDto: CreateVendorDto,
    @Request() req: any,
  ) {
    return this.vendorsService.create(
      createVendorDto,
      req.user.id,
    );
  }

  // PUBLIC
  @Get()
  findAll() {
    return this.vendorsService.findAll();
  }

  // PUBLIC
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.vendorsService.findOne(id);
  }

  // ADMIN ONLY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorsService.update(
      id,
      updateVendorDto,
    );
  }

  // ADMIN ONLY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.vendorsService.remove(id);
  }
}
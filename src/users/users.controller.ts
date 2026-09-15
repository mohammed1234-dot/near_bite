import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.createUser(
      createUserDto,
    );
  }

  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto,
  ) {
    return this.usersService.login(
      loginUserDto.email,
      loginUserDto.password,
    );
  }
}
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { UsersRepository } from './users.repository.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const {
      name,
      email,
      password,
      role,
      lat,
      lng,
    } = createUserDto;

   
    const existingUser =
      await this.usersRepository.findByEmail(email);

    if (existingUser.length > 0) {
      throw new ConflictException(
        'Email already exists',
      );
    }


    const passwordHash = await bcrypt.hash(
      password,
      12,
    );

    const [user] =
      await this.usersRepository.create({
        name,
        email,
        password_hash: passwordHash,
        lat,
        lng,
       role: role||'customer',
      });


    const { password_hash, ...safeUser } = user;

    return safeUser;
  }

async login(email: string, password: string) {
  const [user] =
    await this.usersRepository.findByEmail(email);

  if (!user) {
    throw new UnauthorizedException(
      'Invalid email or password',
    );
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash,
  );

  if (!passwordMatch) {
    throw new UnauthorizedException(
      'Invalid email or password',
    );
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: '1d',
    },
  );

  return {
    token,
  };
}
}
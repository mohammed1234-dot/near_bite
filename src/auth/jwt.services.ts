import { Injectable } from '@nestjs/common';
import jwt, { type SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  sign(payload: object) {
    const options: SignOptions = {
      expiresIn:
        (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'],
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      options,
    );
  }
}
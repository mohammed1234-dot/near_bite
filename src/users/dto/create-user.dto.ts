import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString() 
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  role?: string;
  
  @IsString()
  @MinLength(6)
  password!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}
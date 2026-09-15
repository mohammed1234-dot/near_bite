import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUrl()
  @IsNotEmpty()
  logoUrl!: string;

  @IsLatitude()
  lat!: number;

  @IsLongitude()
  lng!: number;
}
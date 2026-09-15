import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength,IsInt,IsPositive} from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name!:string;

    @IsInt()
    @IsPositive()
    vendorId!: number;


    @IsString()
    @IsNotEmpty()
    description?:string;

    @IsNumber()
    @IsPositive()
    price!:number;
}

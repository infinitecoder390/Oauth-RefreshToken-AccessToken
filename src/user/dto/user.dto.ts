import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Prop } from '@nestjs/mongoose';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @Prop()
  firstname?: string;

  @IsOptional()
  @IsString()
  @Prop()
  lastname?: string;

  @IsOptional()
  @IsPhoneNumber(null) // You can specify a country code if needed
  @Prop()
  phone?: string;

  @IsOptional()
  @IsString()
  @Prop()
  countrycode?: string;

  @IsEmail()
  @IsNotEmpty()
  @Prop({ required: true })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Prop({ required: true })
  password: string;
}

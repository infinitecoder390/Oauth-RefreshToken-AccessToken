import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export interface IExistingUser {
  _id?: string;
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  countrycode: string;
  password: string;
}

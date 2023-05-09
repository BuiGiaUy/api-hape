import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(50)
  readonly email: string;

  @IsNotEmpty()
  @MaxLength(50)
  @IsString()
  readonly password: string;
}

/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { LoginController } from './login.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/users.entities';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Users]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: 'dasdasd',
      signOptions: {
        expiresIn: 'sssssss',
      },
    }),
  ],
  controllers: [RegisterController, LoginController],
  providers: [LoginService, RegisterService],
})
export class AuthModule {}

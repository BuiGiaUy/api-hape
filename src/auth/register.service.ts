/*
https://docs.nestjs.com/providers#services
*/

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { IUsers } from 'src/users/interfaces/users.interface';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { EmailDto } from './dto/email.dto';

@Injectable()
export class RegisterService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
  ) {}
  public async checkEmail(emailDto: EmailDto): Promise<boolean> {
    const user = await this.usersService.findOne({ email: emailDto.email });
    if (!user) {
      return true;
    }
    return false;
  }

  public async register(registerUserDto: RegisterUserDto): Promise<IUsers> {
    try {
      const email = registerUserDto.email.split('@');
      const username = await this.usersService.getUniqueUsername(email[0]);
      registerUserDto.password = bcrypt.hashSync(registerUserDto.password, 8);
      const verify_key = nanoid();
      this.sendMailConfirmEmail(registerUserDto, verify_key);
      return await this.usersService.create({
        ...registerUserDto,
        username,
        name: email[0],
        email_verify: false,
        verify_key,
      });
    } catch (error) {
      console.error('register:', error);
    }
  }
  public async verifyEmail(key: string) {
    try {
      const user = await this.usersService.findOne({
        verify_key: key,
        email_verify: false,
      });
      if (user) {
        user.email_verify = true;
        user.verify_key = null;
        await this.usersService.save(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('verifyEmail:', error);
    }
  }
  sendMailConfirmEmail(user, key: string): void {
    this.mailerService
      .sendMail({
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: 'Xác nhận email của bạn trên shop',
        text: 'Xác nhận email của bạn trên shop',
        template: './index',
        context: {
          title: 'Xác nhận email của bạn trên shop',
          description:
            'cảm ơn bạn đã đăng kí tài khoản .Vui lòng xác nhận email' +
            user.email +
            'bên dưới và đăng ký nhận bản tin từ shop để cập nhật tin tức mới nhất. ',
          LinkURL: process.env.FRONTEND_URL + 'api/auth/verify?key=' + key,
          LinkText: 'Xác nhận email.',
        },
      })
      .then((response) => {
        console.log('User Registration: Send Mail Successfully!');
      })
      .catch((err) => {
        console.log('User Registration: Send Mail Failed!', err);
      });
  }
}

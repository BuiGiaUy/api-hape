/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { RegisterService } from './register.service';
import { LoginService } from './login.service';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RecaptchaService } from './recaptcha.service';
import { JwtPayload } from './interface/jwt.payload';
import * as cleanTextUtils from 'clean-text-utils';
import { EmailDto } from './dto/email.dto';

@Controller()
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private loginService: LoginService,
    private recaptchaService: RecaptchaService,
    private readonly usersService: UsersService,
  ) {}

  @Post('api/auth/register')
  public async register(
    @Res() res,
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<any> {
    try {
      const recaptchaValue = await this.recaptchaService.validate(
        registerUserDto.token,
      );
      if (!recaptchaValue) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Error: token is invalid!',
          status: 400,
        });
      }
      if (await this.usersService.findOne({ email: registerUserDto.email })) {
        return {
          status: 400,
          message: 'Email này đã đăng ký.',
        };
      }
      const phone = this.getSlug(registerUserDto.phone);
      if (await this.usersService.findOne({ phone })) {
        return {
          status: 400,
          message: 'số điện thoại đã được đăng ký.',
        };
      }
      const user = await this.registerService.register({
        ...registerUserDto,
        phone,
      });
      if (user && user.id) {
        let accessToken = null;
        const payload: JwtPayload = {
          id: user.id,
        };

        accessToken = this.loginService.getAccessToken(payload);
        return res.status(HttpStatus.OK).json({
          message: 'Access token',
          accessToken,
          user: payload,
          status: 200,
        });
      }
    } catch (error) {
      console.log(error);
    }
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Error: User not registration',
      status: 400,
    });
  }
  public getSlug(path: string) {
    if (path === undefined) return;
    path = path
      .replace(/^\/|\/$/g, '')
      .trim()
      .replace(/[&\/\\#”“!@$`’;,+()$~%.'':*^?<>{}]/g, '')
      .replace(/ /g, '')
      .replace(/_/g, '')
      .replace(/-/g, '')
      .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
      .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/’/g, '');
    return cleanTextUtils.strip.nonASCII(path);
  }
  @Get('api/auth/test')
  public async test(@Res() res): Promise<any> {
    await this.registerService.sendMailConfirmEmail(
      { email: 'truyenbi02@gmail.com' },
      '33333',
    );
    return res.json({});
  }
  @Get('api/auth/verify')
  public async verify(@Res() res): Promise<any> {
    const { key } = res.req.query;
    await this.registerService.verifyEmail(key);

    return res.redirect(process.env.FRONTEND_URL);
  }
  @Get('api/auth/checkEmail')
  public async checkEmail(
    @Res() res,
    @Body() emailDto: EmailDto,
  ): Promise<any> {
    try {
      const status = await this.registerService.checkEmail(emailDto);
      return res.status(HttpStatus.OK).json({
        status,
      });
    } catch (error) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error!',
        status: 400,
      });
    }
  }
}

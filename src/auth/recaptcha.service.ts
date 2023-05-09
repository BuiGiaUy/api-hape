import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecaptchaService {
  constructor() {}
  async validate(token: string): Promise<boolean> {
    const secret = process.env.RECAPTCHA_SECRET;
    const url =
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=` +
      token;
    const { data } = await axios.get(url);
    return data?.success;
  }
}

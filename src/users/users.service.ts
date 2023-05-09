/*
https://docs.nestjs.com/providers#services
*/

import {
  Injectable,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entities';
import { Repository } from 'typeorm';

const ES_INDEX_USER = 'users';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly esService: EsService,
  ) {}
  public async findByUsername(username: string): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: {
        username: username,
      },
    });
    return user;
  }
  public async findByEmail(email: string): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }
    return user;
  }
  public async findById(userID: number): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: {
        id: userID,
      },
    });
    if (!user) {
      throw new NotFoundException(`User ${userID} not found`);
    }
    return user;
  }
  // ESservice
  async createOnES(user: any) {
    try {
      const now = Date.now();
      const createdAt = now.toLocaleString();
      const userID = user.id;
      const record: any = [
        { index: { _index: ES_INDEX_USER } },
        {
          ...user,
          userID,
          updatedAt: createdAt,
          createdAt,
        },
      ];
      await this.esService.createByBulk(ES_INDEX_USER, record);
    } catch (error) {
      console.log(`User create:`, error);
    }
  }
  public async save(user): Promise<Users> {
    return await this.userRepository.save(user);
  }

  public async findOne(where: Object): Promise<Users> {
    return await this.userRepository.findOne({ where });
  }
  public async getUniqueUsername(keyword: string): Promise<string> {
    let username = keyword.toLowerCase().replace(' ', '');
    let count = 0;
    let checkUsername = username;
    while (count < 100) {
      const user = await this.findByUsername(checkUsername);
      if (!user) {
        return checkUsername;
      }
      checkUsername = username + Math.floor(Math.random() * 1000);
      count++;
    }
    return Math.random().toString(36).substring(8);
  }
  public async create(userDto: any): Promise<Users> {
    try {
      const user = await this.userRepository.save(userDto);
      await this.createOnES(user);
      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  public async saveByField(id: number, fields: {}): Promise<Users> {
    const user = {
      id,
      ...fields,
    };
    return await this.userRepository.save(user);
  }
}

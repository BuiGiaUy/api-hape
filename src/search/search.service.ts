/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly esService: ElasticsearchService) {}
  async updateByQuery(query: any) {
    try {
      return await this.esService.updateByQuery(query);
    } catch (error) {
      console.log(error);
    }
  }
  async createIndex(index, body) {
    const checkIndex = await this.esService.indices.exists(index);
    if (!checkIndex.valueOf) {
      const res = await this.esService.indices.create({
        index,
        body: { ...body },
      });
      return res;
    }
  }
  async checkIndexExisting(index: string) {
    const checkIndex = await this.esService.indices.exists({ index });
    if (checkIndex.valueOf) {
      return true;
    }
    return false;
  }

  async update(
    index: string,
    id: string,
    body: any,
    refresh: string = 'wait_for',
  ) {}

  async checkExisting(index: string, field: string, fieldValue: string) {}



  
}

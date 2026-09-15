import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import {
  createClient,
  RedisClientType,
} from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });

    this.client.on('error', (error) => {
      console.error('Redis error:', error);
    });

    this.client.on('connect', () => {
      console.log('Redis connecting...');
    });

    this.client.on('ready', () => {
      console.log('Redis ready');
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ) {
    if (ttlSeconds) {
      await this.client.set(key, value, {
        EX: ttlSeconds,
      });

      return;
    }

    await this.client.set(key, value);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async deleteByPattern(pattern: string) {
    let deleted = 0;

    for await (const key of this.client.scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      if (typeof key === 'string') {
        await this.client.del(key);
        deleted++;
      }
    }

    return deleted;
  }
}
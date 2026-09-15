import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '../database/database.service.js';
import {
  users,
  NewUser,
} from '../database/schema.js';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async create(data: NewUser) {
    return await this.database.db
      .insert(users)
      .values(data)
      .returning();
  }

  async findByEmail(email: string) {
    return await this.database.db
      .select()
      .from(users)
      .where(eq(users.email, email));
  }

  async findById(id: number) {
    return await this.database.db
      .select()
      .from(users)
      .where(eq(users.id, id));
  }

  async findAll() {
    return await this.database.db
      .select()
      .from(users);
  }

  async update(
    id: number,
    data: Partial<NewUser>,
  ) {
    return await this.database.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
  }

  async delete(id: number) {
    return await this.database.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
  }
}
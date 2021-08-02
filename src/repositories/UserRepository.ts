import logger from '@/config/logger';
import db from '@/database/db';
import User from '@/entities/User';
import InternalServerError from '@/exceptions/InternalServerError';

export default class UserRepository {
  public async add(user: User): Promise<User> {
    try {
      const query = await db<User>('users')
        .insert({
          name: user.name,
          email: user.email,
          password: user.password,
          verified_email: false,
        })
        .returning('*');
      return query[0];
    } catch (error) {
      logger.debug(error);
      throw new InternalServerError('Error adding user!');
    }
  }

  public async getById(id: number): Promise<User | undefined> {
    try {
      const query = await db<User>('users')
        .where({ id })
        .select()
        .returning('*');
      return query[0];
    } catch (error) {
      throw new InternalServerError('Unable to find user!');
    }
  }

  public async getByEmail(email: string): Promise<User | undefined> {
    try {
      const query = await db<User>('users').where({ email }).returning('*');
      return query[0];
    } catch (error) {
      throw new InternalServerError('Unable to find user!');
    }
  }

  public async getAll(): Promise<User[] | undefined> {
    try {
      const query = await db<User>('users').select();
      return query;
    } catch (error) {
      throw new InternalServerError('Error listing users!');
    }
  }

  public async modifyVerifiedEmail(
    user: User,
    verifiedEmail: boolean,
  ): Promise<User> {
    try {
      return await db<User>('users')
        .where({ id: user.id })
        .update({ verified_email: verifiedEmail });
    } catch (error) {
      throw new InternalServerError('Error changing email verification!');
    }
  }

  public async updatePassword(password: string, id: number): Promise<User> {
    try {
      return await db<User>('users').where({ id }).update({ password });
    } catch (error) {
      throw new InternalServerError('Error trying to update user password!');
    }
  }

  public async delete(id: number): Promise<void> {
    try {
      await db<User>('users').delete().where({ id });
    } catch (error) {
      throw new InternalServerError('Error deleting user!');
    }
  }
}

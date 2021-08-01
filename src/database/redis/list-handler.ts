import { RedisClient } from 'redis';
import { promisify } from 'util';

type ListHandlerType = {
  add(
    key: string,
    value: string | number,
    expirationDate: number,
  ): Promise<void>;
  getValue(key: string): Promise<string | null>;
  containKey(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
};

export default function listHandler(list: RedisClient): ListHandlerType {
  const setAsync = promisify(list.set).bind(list);
  const existsAsync = promisify(list.exists).bind(list) as (
    arg: string | string[],
  ) => Promise<number>;
  const getAsync = promisify(list.get).bind(list);
  const delAsync = promisify(list.del).bind(list) as (
    arg: string | string[],
  ) => Promise<number>;

  return {
    async add(
      key: string,
      value: string,
      expirationDate: number,
    ): Promise<void> {
      await setAsync(key, value);
      list.expireat(key, expirationDate);
    },

    async getValue(key: string): Promise<string | null> {
      return getAsync(key);
    },

    async containKey(key: string) {
      const result = await existsAsync(key);
      return result === 1;
    },

    async delete(key: string) {
      await delAsync(key);
    },
  };
}

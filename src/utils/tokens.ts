// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');
import crypto from 'crypto';
import moment from 'moment';

import InvalidArgumentError from '../exceptions/InvalidArgumentError';

import blockListAccessToken from '../database/redis/blocklist-access-token';
import allowListRefreshToken from '../database/redis/allowlist-refresh-token';
import passwordResetListAccessToken from '../database/redis/passwordresetlist-access-token';
import logger from '../config/logger';

type BlockListAccessTokenType = typeof blockListAccessToken;
type AllowListAccessTokenType = typeof allowListRefreshToken;

export type Unit = 'day' | 'm' | 'd' | 'h';

function createJWTToken(
  id: string | number,
  amountOfTime: number,
  timeUnit: string,
): string {
  const payload = { id };
  const token = jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: amountOfTime + timeUnit,
  });
  return token as string;
}

async function verifyJWTToken(
  token: string,
  name: string,
  blockList?: BlockListAccessTokenType,
): Promise<number> {
  await verifyBlockListToken(token, name, blockList);
  const { id } = jwt.verify(token, process.env.JWT_KEY);
  return id as number;
}

async function verifyBlockListToken(
  token: string,
  name: string,
  blockList?: BlockListAccessTokenType,
) {
  if (!blockList) {
    return;
  }

  const blockListToken = await blockList.containToken(token);
  if (blockListToken) {
    throw new InvalidArgumentError(`${name} invalid after logout!`);
  }
}

function invalidJWTToken(token: string, blockList: BlockListAccessTokenType) {
  return blockList.add(token);
}

async function createOpaqueToken(
  id: string | number,
  amountOfTime: number,
  timeUnit: Unit,
  allowList: AllowListAccessTokenType,
) {
  const opaqueToken = crypto.randomBytes(24).toString('hex');
  const expirationDate = moment().add(amountOfTime, timeUnit).unix();
  await allowList.add(opaqueToken, id, expirationDate);
  return opaqueToken;
}

async function verifyOpaqueToken(
  token: string,
  name: string,
  allowList: AllowListAccessTokenType,
): Promise<string | null> {
  // eslint-disable-next-line no-useless-catch

  verifySendedToken(token, name);
  const id = await allowList.getValue(token);
  verifyValidToken(id, name);

  return id;
}

async function invalidOpaqueToken(
  token: string,
  allowList: AllowListAccessTokenType,
) {
  await allowList.delete(token);
}

function verifyValidToken(id: string | null, name: string) {
  if (!id) {
    throw new InvalidArgumentError(`${name} Invalid!`);
  }
}

function verifySendedToken(token: string, name: string) {
  if (!token) {
    throw new InvalidArgumentError(`${name} not sended!`);
  }
}

export default {
  access: {
    name: 'Access Token',
    list: blockListAccessToken,
    amountOfTime: 15,
    timeUnit: 'm' as const,
    create(id: string | number): string {
      return createJWTToken(id, this.amountOfTime, this.timeUnit);
    },
    async verify(token: string): Promise<number> {
      return await verifyJWTToken(token, this.name, this.list);
    },
    async invalidate(token: string): Promise<void> {
      return await invalidJWTToken(token, this.list);
    },
  },
  refresh: {
    name: 'Refresh Token',
    list: allowListRefreshToken,
    amountOfTime: 5,
    timeUnit: 'd' as const,
    async create(id: string | number): Promise<string> {
      return await createOpaqueToken(
        id,
        this.amountOfTime,
        this.timeUnit,
        this.list,
      );
    },
    async verify(token: string): Promise<string | null> {
      return await verifyOpaqueToken(token, this.name, this.list);
    },
    async invalidate(token: string): Promise<void> {
      await invalidOpaqueToken(token, this.list);
    },
  },
  emailVerification: {
    name: 'Token of e-mail verification',
    amountOfTime: 1,
    timeUnit: 'h' as const,
    create(id: string | number): string {
      return createJWTToken(id, this.amountOfTime, this.timeUnit);
    },
    async verify(token: string): Promise<number> {
      return await verifyJWTToken(token, this.name);
    },
  },
  passwordReset: {
    name: 'Password Reset',
    list: passwordResetListAccessToken,
    amountOfTime: 1,
    timeUnit: 'h' as const,
    async createToken(id: string | number): Promise<string> {
      return await createOpaqueToken(
        id,
        this.amountOfTime,
        this.timeUnit,
        this.list,
      );
    },
    async verify(token: string): Promise<string | null> {
      return await verifyOpaqueToken(token, this.name, this.list);
    },
  },
};

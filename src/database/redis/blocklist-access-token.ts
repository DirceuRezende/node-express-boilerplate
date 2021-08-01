import redis from 'redis';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');
import { createHash } from 'crypto';
import listHandler from './list-handler';

const blockList = redis.createClient({ prefix: 'blocklist-access-token:' });
const blockListHandler = listHandler(blockList);

function generateTokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

type BlockListFunctionsType = {
  add(token: string): Promise<void>;
  containToken(token: string): Promise<boolean>;
};

const blockListFunctions: BlockListFunctionsType = {
  async add(token: string) {
    const expirationDate = jwt.decode(token).exp;
    const tokenHash = generateTokenHash(token);
    await blockListHandler.add(tokenHash, '', expirationDate);
  },
  async containToken(token: string) {
    const tokenHash = generateTokenHash(token);
    return blockListHandler.containKey(tokenHash);
  },
};

export default blockListFunctions;

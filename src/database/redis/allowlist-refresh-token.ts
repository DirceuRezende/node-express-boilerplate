import redis from 'redis';
import listHandler from './list-handler';
const allowList = redis.createClient({ prefix: 'allowlist-refresh-token:' });
export default listHandler(allowList);

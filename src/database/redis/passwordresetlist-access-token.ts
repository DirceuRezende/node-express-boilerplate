import { createClient } from 'redis';
import listHandler from './list-handler';

const passwordResetList = createClient({ prefix: 'password-reset' });
export default listHandler(passwordResetList);

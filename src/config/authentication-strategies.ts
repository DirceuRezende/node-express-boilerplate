import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import bcrypt from 'bcrypt';

import UserRepository from '@/repositories/UserRepository';
import tokens from '@/utils/tokens';
import User from '@/entities/User';
import logger from './logger';
import InvalidArgumentError from '@/exceptions/InvalidArgumentError';

function verifyUser(user: User | undefined) {
  if (!user) {
    throw new InvalidArgumentError('Invalid e-mail or password.');
  }
}

async function verifyPassword(password: string, hashPassword: string) {
  const validPassword = await bcrypt.compare(password, hashPassword);

  if (!validPassword) {
    throw new InvalidArgumentError('Invalid e-mail or password.');
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email, password, done) => {
      try {
        const userRepository = new UserRepository();

        const user: User | undefined = await userRepository.getByEmail(email);

        verifyUser(user);
        await verifyPassword(password, user!.password);

        done(null, user);
      } catch (error) {
        logger.info('error ' + error);
        done(error);
      }
    },
  ),
);

passport.use(
  new BearerStrategy(async (token, done) => {
    try {
      const id = await tokens.access.verify(token);

      const userRepository = new UserRepository();
      const user = await userRepository.getById(id);

      done(null, user, token);
    } catch (error) {
      done(error);
    }
  }),
);

export default passport;

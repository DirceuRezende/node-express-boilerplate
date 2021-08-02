import logger from '@/config/logger';
import User from '@/entities/User';
import InternalServerError from '@/exceptions/InternalServerError';
import NotFoundException from '@/exceptions/NotFoundException';
import UserRepository from '@/repositories/UserRepository';
import { PasswordResetEmail, VerificationEmail } from '@/utils/emails';
import { generateHash } from '@/utils/hash';
import tokens from '@/utils/tokens';

type LoginReturn = {
  accessToken: string;
  refreshToken: string;
};
export class UserService {
  public async getById(
    id: number,
  ): Promise<Pick<User, 'id' | 'name' | 'email' | 'verified_email'>> {
    const userRepository = new UserRepository();
    const user = await userRepository.getById(id);
    if (!user) {
      throw new NotFoundException('User');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      verified_email: user.verified_email,
    };
  }
  public async changePassword(token: string, password: string): Promise<void> {
    const id = await tokens.passwordReset.verify(token);
    const userRepository = new UserRepository();
    const user = await userRepository.getById(+id!);
    if (!user) {
      throw new NotFoundException('User');
    }
    logger.info(`Changing password from ${user.id}`);
    const passwordHash = await generateHash(password);

    await userRepository.updatePassword(passwordHash, +id!);
  }
  private generateAddress(route: string, token: string): string {
    const baseUrl = `${process.env.BASE_URL}:${process.env.PORT}`;
    return `${baseUrl}${route}${token}`;
  }

  public async create(user: User): Promise<User> {
    logger.info('Creating a new user...');

    const userRepository = new UserRepository();
    const passwordHash = await generateHash(user.password);
    user.password = passwordHash;

    const createdUser = await userRepository.add(user);
    const token = tokens.emailVerification.create(createdUser.id!);

    const address = this.generateAddress('/user/email_verification/', token);

    const verificationEmail = new VerificationEmail(createdUser.email, address);

    verificationEmail.sendEmail().catch((error) => {
      logger.error(`Error sending verification e-mail! ${error.message}`);
      throw new InternalServerError(error.message);
    });
    return createdUser;
  }

  public async delete(
    id: number,
  ): Promise<Pick<User, 'id' | 'name' | 'email'>> {
    const userRepository = new UserRepository();
    const user = await userRepository.getById(id);
    if (!user) {
      throw new NotFoundException('User');
    }
    logger.info(`Deleting user ${user.id} - ${user.email} - ${user.name}.`);
    await userRepository.delete(id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  public async logout(token: string): Promise<void> {
    await tokens.access.invalidate(token);
  }

  public async login(id: number): Promise<LoginReturn> {
    const accessToken = tokens.access.create(id);
    const refreshToken = await tokens.refresh.create(id);
    return {
      accessToken,
      refreshToken,
    };
  }

  public async verifyEmail(user: User): Promise<void> {
    const userRepository = new UserRepository();
    await userRepository.modifyVerifiedEmail(user, true);
  }

  public async list(): Promise<Pick<User, 'id' | 'name' | 'email'>[]> {
    const userRepository = new UserRepository();
    const users = await userRepository.getAll();
    if (!users) {
      const userEmptyArray: User[] = [];
      return userEmptyArray;
    }
    const filteredUser = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
    return filteredUser;
  }

  public async forgetMyPassword(userEmail: string): Promise<void> {
    try {
      const userRepository = new UserRepository();

      const user = await userRepository.getByEmail(userEmail);

      if (user === undefined) {
        throw new NotFoundException('User');
      }
      logger.info(
        `Forget password from e-mail ${userEmail} and user ${user.id}`,
      );
      const token = await tokens.passwordReset.createToken(user.id!);
      const email = new PasswordResetEmail(user.email, token);

      email.sendEmail().catch((err) => {
        logger.error(`Error sending e-mail: ${err.message}`);
        throw new InternalServerError('Error sending e-mail!');
      });
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}

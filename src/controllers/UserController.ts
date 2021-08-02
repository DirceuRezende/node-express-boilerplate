import { NextFunction, Request, Response } from 'express';
import logger from '@/config/logger';
import User from '@/entities/User';
import NotFoundException from '@/exceptions/NotFoundException';
import { UserService } from '@/services/UserService';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const userService = new UserService();
      const user: User = {
        name,
        email,
        password,
      };
      const createdUser = await userService.create(user);

      res.status(201).json(createdUser);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userService = new UserService();
      const user = res.locals.user as User;
      logger.info(`Login user ${user.id} - ${user.email} - ${user.name}`);
      const userTokens = await userService.login(user.id);

      res.set('Authorization', userTokens.accessToken);
      res.status(200).json({ refreshToken: userTokens.refreshToken });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userService = new UserService();
      const token = res.locals.token;
      const user = res.locals.user as User;
      logger.info(`Logout user ${user.id} - ${user.email} - ${user.name}`);
      await userService.logout(token);

      res.status(204).json();
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userService = new UserService();
      const users = await userService.list();

      res.send(users);
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userService = new UserService();
      const { id } = req.params;
      logger.info(`Get user by id: ${id}`);
      const user = await userService.getById(+id);

      res.status(200).send(user);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userService = new UserService();
      const user = res.locals.user as User;
      logger.info(`Verify email from user ${user.id}`);
      await userService.verifyEmail(user);

      res.status(200).json();
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userService = new UserService();
      const { id } = req.params;
      logger.info(`Delete user ${id}`);
      const deletedId = await userService.delete(+id);

      res.status(200).json({ id: deletedId });
    } catch (error) {
      next(error);
    }
  }

  async forgetMyPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const defaultResponse = {
      message:
        'If we find a user with this email, we will send a message with instructions to reset the password.',
    };
    try {
      const userService = new UserService();
      const { email } = req.body;
      logger.info(`Forget password from e-mail ${email}`);
      await userService.forgetMyPassword(email);

      res.status(200).send(defaultResponse);
    } catch (error) {
      logger.error(error);
      if (error instanceof NotFoundException) {
        res.status(200).send(defaultResponse);
        return;
      }

      next(error);
    }
  }

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      /* if (typeof req.body.token !== 'string' || req.body.token.length === 0) {
        throw new InvalidArgumentError('Invalid token');
      } */
      const userService = new UserService();
      const token = req.body.token as string;
      const password = req.body.password as string;

      await userService.changePassword(token, password);

      res.send({ message: 'Your password has been changed with success' });
    } catch (error) {
      next(error);
    }
  }
}

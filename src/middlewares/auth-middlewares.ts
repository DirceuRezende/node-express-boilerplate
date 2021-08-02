import passport from 'passport';
import tokens from '../utils/tokens';
import { NextFunction, Request, Response } from 'express';
import UserRepository from '../repositories/UserRepository';
import HttpException from '../exceptions/HttpException';
import InvalidArgumentError from '../exceptions/InvalidArgumentError';

export function local(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('local', { session: false }, (error, user, info) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      next(new InvalidArgumentError('E-mail and Password are required!'));
    }
    res.locals.user = user;
    res.locals.isAuth = true;
    return next();
  })(req, res, next);
}

export function bearer(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('bearer', { session: false }, (error, user, token) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      next(new InvalidArgumentError('Invalid Token!'));
    }

    res.locals.token = token;
    res.locals.user = user;
    res.locals.isAuth = true;
    return next();
  })(req, res, next);
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    const id = await tokens.refresh.verify(refreshToken);

    await tokens.refresh.invalidate(refreshToken);
    const userRepository = new UserRepository();
    res.locals.user = await userRepository.getById(+id!);

    return next();
  } catch (error: any) {
    if (error.name === 'InvalidArgumentError') {
      return next(error);
    }
    next(new HttpException(500, error.message));
  }
}

export async function emailVerification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = req.params;

    const id = await tokens.emailVerification.verify(token);

    const userRepository = new UserRepository();
    const user = await userRepository.getById(id);

    res.locals.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

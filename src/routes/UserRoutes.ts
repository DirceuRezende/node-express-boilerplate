import express, { Router } from 'express';
import { UserController } from '../controllers/UserController';
import * as authMiddlewares from '../middlewares/auth-middlewares';
import { bodyValidationMiddleware } from '../middlewares/validation-middleware';
import { loginValidator, newUserValidator } from '../validators/UserSchema';

export default class UserRoutes {
  private router: Router = express.Router();
  private userController = new UserController();

  getRoutes(): Router {
    this.router.post('/password-change', this.userController.changePassword);
    this.router.post(
      '/forget-my-password',
      this.userController.forgetMyPassword,
    );
    this.router.post(
      '/token-update',
      authMiddlewares.refresh,
      this.userController.login,
    );
    this.router.post(
      '/login',
      [bodyValidationMiddleware(loginValidator), authMiddlewares.local],
      this.userController.login,
    );
    this.router.post(
      '/logout',
      [authMiddlewares.refresh, authMiddlewares.bearer],
      this.userController.logout,
    );

    this.router.post(
      '/email_verification/:token',
      authMiddlewares.emailVerification,
      this.userController.verifyEmail,
    );

    this.router
      .get('/', authMiddlewares.bearer, this.userController.list)
      .post(
        '/',
        bodyValidationMiddleware(newUserValidator),
        this.userController.create,
      );

    this.router
      .get('/:id', authMiddlewares.bearer, this.userController.getById)
      .delete(
        '/:id',
        [authMiddlewares.bearer, authMiddlewares.local],
        this.userController.delete,
      );

    return this.router;
  }
}

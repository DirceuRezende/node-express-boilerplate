import { Router, Request, Response, NextFunction } from 'express';
import Logger from './config/logger';

const router = Router();

router.use('/', (req: Request, res: Response, next: NextFunction) => {
  return res.send({
    message: 'Ok',
  });
});

export { router };

import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.use('/', (req: Request, res: Response, next: NextFunction) => {
  return res.send({
    message: 'Ok',
  });
});

export { router };

import { NextFunction, Request, Response } from 'express';
import NotFoundException from '@/exceptions/NotFoundException';

function notFoundMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  next(new NotFoundException('Route'));
}

export default notFoundMiddleware;

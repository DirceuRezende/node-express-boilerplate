import { NextFunction, Request, Response } from 'express';
import { Schema, ValidationErrorItem } from 'joi';
import Logger from '../config/logger';

export const bodyValidationMiddleware = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details
        .map((i: ValidationErrorItem) => i.message)
        .join(',');
      Logger.info('error ' + message);
      res.status(422).json({ error: message });
    }
  };
};

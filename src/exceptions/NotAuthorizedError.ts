import HttpException from './HttpException';

class NotAuthorizedError extends HttpException {
  status: number;
  message: string;
  constructor() {
    super(401, 'Unable to access this resource');
    this.status = 401;
    this.message = 'Unable to access this resource';
    this.name = 'NotAuthorizedError';
  }
}

export default NotAuthorizedError;

import HttpException from './HttpException';

class InternalServerError extends HttpException {
  status: number;
  message: string;
  constructor(message: string) {
    super(400, message);
    this.status = 500;
    this.message = message;
    this.name = 'InternalServerError';
  }
}

export default InternalServerError;

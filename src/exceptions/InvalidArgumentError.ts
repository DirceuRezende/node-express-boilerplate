import HttpException from './HttpException';

class InvalidArgumentError extends HttpException {
  status: number;
  message: string;
  constructor(message: string) {
    super(400, message);
    this.status = 400;
    this.message = message;
    this.name = 'InvalidArgumentError';
  }
}

export default InvalidArgumentError;

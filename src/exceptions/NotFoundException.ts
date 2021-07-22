import HttpException from './HttpException';

class NotFoundException extends HttpException {
  status: number;
  message: string;
  constructor() {
    super(404, 'Not Found');
    this.status = 404;
    this.message = 'Not Found';
  }
}

export default NotFoundException;

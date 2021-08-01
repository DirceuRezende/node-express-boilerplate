import HttpException from './HttpException';

class NotFoundException extends HttpException {
  constructor(entity: string) {
    super(400, `${entity} doesn't exist`);
    this.status = 400;
    this.message = `${entity} doesn't exist`;
    this.name = 'NotFoundException';
  }
}

export default NotFoundException;

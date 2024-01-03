import { Injectable, NestMiddleware } from '@nestjs/common';
import * as cors from 'cors';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: any) {
    const options: cors.CorsOptions = {
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      origin: '*',
    };
    return cors(options)(req, res, next);
  }
}

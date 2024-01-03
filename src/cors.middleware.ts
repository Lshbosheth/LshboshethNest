import { Injectable, NestMiddleware } from '@nestjs/common';
import * as express from 'express';
import cors from 'cors';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly corsMiddleware = cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
  });

  use(req: Request | any, res: Response | any, next: any) {
    const request = req as express.Request;
    const response = res as express.Response;
    this.corsMiddleware(request, response, next);
  }
}

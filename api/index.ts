import type { Request, Response } from 'express';
import app from '../server';

export { app };

export default function handler(req: Request, res: Response) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Function Crash]', err);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({
        error: err?.message || 'Internal server error',
        success: false,
      });
    }
  }
}

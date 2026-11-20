import 'dotenv/config';
import app from '../server/app.js';
import { connectToMongo } from '../server/database.js';

function normalizeApiPath(req) {
  const requestUrl = new URL(req.url || '/', 'http://vercel.local');
  const apiPath = requestUrl.searchParams.get('path');

  if (requestUrl.pathname === '/api/index' && apiPath) {
    requestUrl.searchParams.delete('path');
    const query = requestUrl.searchParams.toString();
    req.url = `/api/${apiPath}${query ? `?${query}` : ''}`;
  }

  return requestUrl.pathname === '/api/index' && apiPath
    ? `/api/${apiPath}`
    : requestUrl.pathname;
}

export default async function handler(req, res) {
  const pathname = normalizeApiPath(req);

  if (pathname !== '/api/courses') {
    try {
      await connectToMongo();
    } catch (error) {
      console.error('Vercel API could not connect to MongoDB:', error.message);
      return res.status(503).json({
        message: 'MongoDB bazasiga ulanib bo‘lmadi. Vercel Environment Variables va Atlas IP ruxsatini tekshiring.',
      });
    }
  }

  return app(req, res);
}

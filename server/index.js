import 'dotenv/config';
import app from './app.js';
import { connectToMongo } from './database.js';

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => console.log(`API server http://localhost:${port} manzilida ishlayapti`));

async function connectWithRetry() {
  try {
    await connectToMongo();
    console.log('MongoDB bazasiga ulanildi');
  } catch (error) {
    console.error(`MongoDB ulanmadi: ${error.message}`);
    const retry = setTimeout(connectWithRetry, 5000);
    retry.unref();
  }
}

connectWithRetry();
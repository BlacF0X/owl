import Pusher from 'pusher';
import dotenv from 'dotenv';

dotenv.config();

const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } =
  process.env;

if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
  console.warn('⚠️ Les variables Pusher ne sont pas toutes définies.');
}

export const pusher = new Pusher({
  appId: PUSHER_APP_ID || '',
  key: PUSHER_KEY || '',
  secret: PUSHER_SECRET || '',
  cluster: PUSHER_CLUSTER || 'eu',
  useTLS: true,
});

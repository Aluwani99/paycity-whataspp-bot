import 'dotenv/config';

// Works in Node (reads .env) and in the browser demo build (no process object)
const env = typeof process !== 'undefined' ? process.env : {};

export const config = {
  port: env.PORT || 3001,
  token: env.WHATSAPP_TOKEN,
  phoneNumberId: env.PHONE_NUMBER_ID,
  verifyToken: env.VERIFY_TOKEN,
  appSecret: env.APP_SECRET,
  graphVersion: env.GRAPH_API_VERSION || 'v23.0',
  paycity: {
    provider: env.PAYCITY_PROVIDER || 'mock',
    url: env.PAYCITY_API_URL,
    key: env.PAYCITY_API_KEY,
    showFullFineDetails: env.SHOW_FULL_FINE_DETAILS === 'true',
  },
};

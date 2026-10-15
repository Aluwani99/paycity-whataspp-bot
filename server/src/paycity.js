// payCity data layer.  Three questions the bot asks:
//   searchFines({ type: 'id'|'brn'|'trn', value })  -> { fines: [ {noticeNumber, authority, offenceDate, amount, status} ] }
//   lookupNotice(noticeNumber)                      -> { found:true, fine:{...} } | { found:false }
//   checkMeter(meterNumber)                         -> { supported:boolean, utility?, provider? }
//
// PAYCITY_PROVIDER=mock  -> fake sample data for demos (default)
// PAYCITY_PROVIDER=http  -> calls an authorised payCity API at PAYCITY_API_URL (Bearer PAYCITY_API_KEY):
//     GET {URL}/fines?type=id|brn|trn&value=XXXX -> 200 { "fines":[ { "noticeNumber","authority","offenceDate":"YYYY-MM-DD","amount":750.00,"status":"Outstanding" } ] }
//     GET {URL}/notice?number=XXXX               -> 200 { "noticeNumber","authority","offenceDate","amount","status" }  |  404 not found
//     GET {URL}/meter?number=XXXX                -> 200 { "supported":true, "utility":"Electricity", "provider":"..." }
//   This contract is ours: adapt viaHttp() below to whatever payCity's official API actually returns.
import { config } from './config.js';
import { digits, normBrn, normTrn, normNotice } from './validators.js';

// ---------------- MOCK DATA (fake, for demos only) ----------------
const F = (noticeNumber, authority, offenceDate, amount, status = 'Outstanding') => ({ noticeNumber, authority, offenceDate, amount, status });
const MOCK = {
  fines: {
    id: {
      '8001015009087': [
        F('9/12345/678901/2', 'City of Tshwane', '2026-03-12', 1500),
        F('9/22345/111222/8', 'City of Johannesburg', '2026-06-02', 750),
        F('4/55521/909090/1', 'Ekurhuleni Metro Police', '2026-07-21', 1000, 'Notice before summons'),
      ],
      '9202204720083': [], // valid ID, no fines
    },
    brn: { '2012/123456/07': [F('9/77777/123123/4', 'City of Cape Town', '2026-05-09', 2500)] },
    trn: { TRN123456: [F('9/88888/456456/6', 'City of Ekurhuleni', '2026-04-18', 500)] },
  },
  notices: { '9/12345/678901/2': F('9/12345/678901/2', 'City of Tshwane', '2026-03-12', 1500) },
  meters: { '04012345678': { supported: true, utility: 'Electricity', provider: 'Sample Municipality' } },
};

async function mockSearch({ type, value }) {
  const key = type === 'id' ? digits(value) : type === 'brn' ? normBrn(value) : normTrn(value);
  return { fines: MOCK.fines[type]?.[key] ?? [] };
}
const mockNotice = async (n) => (MOCK.notices[normNotice(n)] ? { found: true, fine: MOCK.notices[normNotice(n)] } : { found: false });
const mockMeter = async (m) => MOCK.meters[digits(m)] ?? { supported: false };

// ---------------- HTTP provider ----------------
async function get(path, params) {
  if (!config.paycity.url) throw new Error('PAYCITY_API_URL is not set');
  const url = new URL(config.paycity.url.replace(/\/$/, '') + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${config.paycity.key}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`payCity API returned ${res.status}`);
  return res.json();
}
const viaHttp = {
  searchFines: async ({ type, value }) => ({ fines: (await get('/fines', { type, value }))?.fines ?? [] }),
  lookupNotice: async (n) => { const d = await get('/notice', { number: normNotice(n) }); return d ? { found: true, fine: d } : { found: false }; },
  checkMeter: async (m) => (await get('/meter', { number: digits(m) })) ?? { supported: false },
};

const useHttp = () => config.paycity.provider === 'http';
export const searchFines = (q) => (useHttp() ? viaHttp.searchFines(q) : mockSearch(q));
export const lookupNotice = (n) => (useHttp() ? viaHttp.lookupNotice(n) : mockNotice(n));
export const checkMeter = (m) => (useHttp() ? viaHttp.checkMeter(m) : mockMeter(m));

// Platform-independent bot logic: input in -> array of message objects out.
import { config } from './config.js';
import { MENU_ROWS, TEXT, FAQ } from './content.js';
import { searchFines, lookupNotice, checkMeter } from './paycity.js';
import { isValidSaId, isValidBrn, isValidTrn, isValidNotice, isValidMeter, digits, normBrn, normTrn, normNotice } from './validators.js';

// In-memory sessions. Use Redis/DB in production so state survives restarts.
const sessions = new Map();
export const resetSession = (id) => sessions.delete(id);

const GREETING = /^(hi|hii+|hello|hey|heita|hallo|start|sawubona|molo|dumela|thobela|ndaa|haai)\b/i;
const MENU_WORD = /^menu$/i;
const MAX_LOOKUPS_PER_HOUR = 10;

const INTENTS = [
  ['notice', /notice/i],
  ['meter', /meter|prepaid|electricity|token/i],
  ['fines', /fine|\bid\b|brn|trn|search|traffic|summons|warrant/i],
  ['services', /service|what do you|what can/i],
  ['about', /about|who are|what is paycity/i],
  ['faq', /faq|question|how do i|how to/i],
  ['contact', /contact|phone|call|email|support|help/i],
];

const text = (body) => ({ type: 'text', body });
const buttons = (body, list) => ({ type: 'buttons', body, buttons: list });
const MENU_BTN = { id: 'topic_menu', title: 'Main menu' };

const mainMenu = (body = TEXT.menuBody) => ({
  type: 'list', header: 'payCity', body, footer: TEXT.menuFooter, button: 'Menu', sectionTitle: 'Menu', rows: MENU_ROWS,
});
const welcome = () => mainMenu(TEXT.welcome);
const faqList = () => ({
  type: 'list', header: 'payCity FAQs', body: 'Choose a question.', button: 'Questions', sectionTitle: 'FAQs',
  rows: FAQ.map((f) => ({ id: `faq_${f.id}`, title: f.title, description: f.description })),
});
const money = (n) => 'R' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
const mask = (n) => (n.length > 4 ? '…' + n.slice(-4) : n);

// ---- flows ----
function startFines(s) {
  if (!s.consent) {
    return [buttons(TEXT.consent, [{ id: 'consent_yes', title: 'I agree' }, { id: 'topic_menu', title: 'Cancel' }])];
  }
  return [buttons(TEXT.chooseType, [
    { id: 'fines_id', title: 'ID number' },
    { id: 'fines_brn', title: 'Business reg. no.' },
    { id: 'fines_trn', title: 'Traffic reg. no.' },
  ])];
}

function rateLimited(s) {
  const now = Date.now();
  s.lookups = (s.lookups || []).filter((t) => now - t < 3600e3);
  if (s.lookups.length >= MAX_LOOKUPS_PER_HOUR) return true;
  s.lookups.push(now);
  return false;
}

async function processInput(s, input) {
  const a = s.awaiting;

  if (a.kind === 'fines') {
    const ok = { id: isValidSaId, brn: isValidBrn, trn: isValidTrn }[a.type](input);
    if (!ok) return [text(TEXT.invalid(TEXT.labels[a.type]))];
    if (rateLimited(s)) return [text(TEXT.rateLimited), buttons(TEXT.more, [MENU_BTN])];
    s.awaiting = null;
    const value = a.type === 'id' ? digits(input) : a.type === 'brn' ? normBrn(input) : normTrn(input);
    let r;
    try { r = await searchFines({ type: a.type, value }); }
    catch (e) { console.error('payCity lookup failed:', e.message); return [text(TEXT.errorService), buttons(TEXT.more, [MENU_BTN])]; } // never log the number
    const again = { id: 'topic_fines', title: 'Search again' };
    if (!r.fines.length) return [text(TEXT.noFines), buttons(TEXT.more, [again, MENU_BTN])];

    const total = r.fines.reduce((t, f) => t + Number(f.amount || 0), 0);
    const full = config.paycity.showFullFineDetails;
    const shown = r.fines.slice(0, 5).map((f, i) =>
      `${i + 1}. Notice ${full ? f.noticeNumber : mask(f.noticeNumber)}\n    ${f.authority} · ${date(f.offenceDate)}\n    ${money(f.amount)} · ${f.status}`);
    const extra = r.fines.length > 5 ? `\n\n…and ${r.fines.length - 5} more.` : '';
    return [
      text(`*${r.fines.length} fine${r.fines.length > 1 ? 's' : ''} found*\nTotal: ${money(total)}\n\n${shown.join('\n\n')}${extra}\n\n${TEXT.finesFooter}`),
      buttons(TEXT.more, [again, MENU_BTN]),
    ];
  }

  if (a.kind === 'notice') {
    if (!isValidNotice(input)) return [text(TEXT.noticeInvalid)];
    if (rateLimited(s)) return [text(TEXT.rateLimited), buttons(TEXT.more, [MENU_BTN])];
    s.awaiting = null;
    const n = normNotice(input);
    let r;
    try { r = await lookupNotice(n); }
    catch (e) { console.error('payCity lookup failed:', e.message); return [text(TEXT.errorService), buttons(TEXT.more, [MENU_BTN])]; }
    const again = { id: 'topic_notice', title: 'Search again' };
    if (!r.found) return [text(TEXT.noticeNotFound(n)), buttons(TEXT.more, [again, MENU_BTN])];
    const f = r.fine;
    return [
      text(`*Notice found*\nNotice: ${f.noticeNumber}\nAuthority: ${f.authority}\nOffence date: ${date(f.offenceDate)}\nAmount: ${money(f.amount)}\nStatus: ${f.status}\n\n👉 To see the full fine, images and a copy of the original, or to pay, register or log in at www.paycity.co.za or use the payCity app.`),
      buttons(TEXT.more, [again, MENU_BTN]),
    ];
  }

  if (a.kind === 'meter') {
    if (!isValidMeter(input)) return [text(TEXT.meterInvalid)];
    if (rateLimited(s)) return [text(TEXT.rateLimited), buttons(TEXT.more, [MENU_BTN])];
    s.awaiting = null;
    const num = digits(input);
    let r;
    try { r = await checkMeter(num); }
    catch (e) { console.error('payCity lookup failed:', e.message); return [text(TEXT.errorService), buttons(TEXT.more, [MENU_BTN])]; }
    const again = { id: 'topic_meter', title: 'Check another' };
    return [text(r.supported ? TEXT.meterYes({ ...r, number: num }) : TEXT.meterNo(num)), buttons(TEXT.more, [again, MENU_BTN])];
  }
}

const info = (body) => [text(body), buttons(TEXT.more, [MENU_BTN])];

// ---- main handler ----
export async function handleMessage(from, { text: raw = '', id = '' }) {
  const s = sessions.get(from) || { consent: false, awaiting: null, started: false, lookups: [] };
  sessions.set(from, s);
  const input = raw.trim();

  // A registration/notice/meter number is expected next
  if (s.awaiting && !id && input && !GREETING.test(input)) {
    if (MENU_WORD.test(input)) { s.awaiting = null; return [mainMenu()]; }
    return processInput(s, input);
  }
  if (id) s.awaiting = null;

  if (GREETING.test(input) || !s.started) { s.started = true; s.awaiting = null; return [welcome()]; }

  switch (id) {
    case 'topic_menu': return [mainMenu()];
    case 'topic_fines': return startFines(s);
    case 'consent_yes': s.consent = true; return startFines(s);
    case 'fines_id': case 'fines_brn': case 'fines_trn': {
      const type = id.slice(6);
      s.awaiting = { kind: 'fines', type };
      return [text(TEXT.prompts[type])];
    }
    case 'topic_notice': s.awaiting = { kind: 'notice' }; return [text(TEXT.noticePrompt)];
    case 'topic_meter': s.awaiting = { kind: 'meter' }; return [text(TEXT.meterPrompt)];
    case 'topic_services': return info(TEXT.services);
    case 'topic_about': return info(TEXT.about);
    case 'topic_contact': return info(TEXT.contact);
    case 'topic_faq': return [faqList()];
  }
  if (id.startsWith('faq_')) {
    const f = FAQ.find((x) => x.id === id.slice(4));
    if (f) return [text(`*${f.title}*\n${f.a}`), buttons(TEXT.more, [{ id: 'topic_faq', title: 'More FAQs' }, MENU_BTN])];
  }

  if (MENU_WORD.test(input)) return [mainMenu()];
  const hit = INTENTS.find(([, re]) => re.test(input));
  if (hit) return handleMessage(from, { id: `topic_${hit[0]}` });
  return [text(TEXT.fallback), mainMenu()];
}

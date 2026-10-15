// All user-facing text (English). Sources: paycity.co.za About, Our Services, FAQs and footer contacts.
// Limits: list row title 24 chars, description 72, reply-button title 20.

export const MENU_ROWS = [
  { id: 'topic_fines', title: 'Search my fines', description: 'By ID, business reg. or traffic reg. number' },
  { id: 'topic_notice', title: 'Notice number search', description: 'Look up a fine with its notice number' },
  { id: 'topic_meter', title: 'Is my meter supported?', description: 'Check a prepaid meter number' },
  { id: 'topic_services', title: 'Our services', description: 'What you can do on payCity' },
  { id: 'topic_about', title: 'About payCity', description: 'Who we are' },
  { id: 'topic_faq', title: 'FAQs', description: 'Frequently asked questions' },
  { id: 'topic_contact', title: 'Contact us', description: 'Phone, email and website' },
];

export const TEXT = {
  welcome:
    '👋 Welcome to the *payCity* assistant.\n\npayCity lets you view and pay traffic fines, buy prepaid electricity, water and gas, and pay municipal accounts.\n\nHow can I help you today? Tap *Menu*.',
  menuBody: 'Choose a topic from the menu.',
  menuFooter: 'Type menu anytime',
  more: 'Is there anything else I can help with?',
  fallback: "Sorry, I didn't understand that. Please use the *Menu* to choose a topic.",

  about:
    '*About payCity*\nThe payCity journey began in 2001 with energy.co.za, a website for buying prepaid electricity online and by cellphone. In 2007 Syntell launched payfine.co.za so the public could view their traffic fines online. payCity.co.za combines the two and adds more services.\n\npayCity is an easy-to-use online system to view and pay outstanding traffic fines, settle municipal accounts and buy prepaid utilities.\n\n🌐 www.paycity.co.za\nOperated by Syntell (Pty) Ltd.',

  services:
    '*Our services*\n• *View and pay fines* – see details, images and a copy of the original fine (selected municipalities)\n• *Buy prepaid utilities* – quick top-ups for electricity, water and gas\n• *Pay municipal bills* – settle your accounts without queues\n• *Vehicle licence renewal* – renew online, with free licence reminders\n\nPay with Mastercard, Visa, credit/debit card or Ozow EFT. Register on www.paycity.co.za or in the payCity app.',

  contact:
    '*Contact payCity*\n📞 087 237 7011\n✉️ support@paycity.co.za\n✉️ team@paycity.co.za\n🌐 www.paycity.co.za\n\nFollow payCity on X (twitter.com/paycity) or Facebook (facebook.com/payCity).\n\nℹ️ payCity is a payment channel. To query or contest a fine itself, contact the authority that issued it.',

  // ---- fines search ----
  consent:
    '🔒 *Before you search*\nPlease only search for *your own* details (or someone who has asked you to). The number you send is used only to check fines and is not stored by this assistant.\n\nDo you agree to continue?',
  chooseType: 'What would you like to search with?',
  prompts: {
    id: '🔎 Please type your 13-digit South African *ID number*.\n\nType *menu* to cancel.',
    brn: '🔎 Please type the *Business Registration Number* (for example 2012/123456/07).\n\nType *menu* to cancel.',
    trn: '🔎 Please type the *Traffic Register Number (TRN)*.\n\nType *menu* to cancel.',
  },
  labels: { id: 'ID number', brn: 'Business Registration Number', trn: 'Traffic Register Number' },
  invalid: (label) =>
    `That doesn't look like a valid ${label}. Please provide a valid ID Number, Traffic Registration Number or Business Registration Number, or type *menu* to cancel.`,
  noFines:
    '✅ *No outstanding fines found* for the number you entered, in the areas payCity covers.\n\nℹ️ Results only include areas payCity supports. Not seeing a fine here does not mean none exists elsewhere.',
  finesFooter:
    '👉 To see full details and images, and to pay, register or log in at www.paycity.co.za or use the payCity app.\n\n🔒 For your privacy you can delete the number you typed from this chat.',

  // ---- notice search ----
  noticePrompt:
    '🔎 Please type the *notice number* exactly as printed on your notice, including any "/" or "-".\n\nType *menu* to cancel.',
  noticeInvalid: "That doesn't look like a notice number. Please type it exactly as printed (including any \"/\" or \"-\"), or type *menu* to cancel.",
  noticeNotFound: (n) =>
    `⚠️ We couldn't find notice *${n}* in the areas payCity covers.\n\nThis does *not* mean the fine is invalid – it may just not be payable through payCity. Please check the number is entered exactly as printed.`,

  // ---- meter ----
  meterPrompt: '🔎 Please type your prepaid *meter number* (digits only).\n\nType *menu* to cancel.',
  meterInvalid: "A meter number is digits only (usually 11). Please check it and try again, or type *menu* to cancel.",
  meterYes: (m) =>
    `✅ *Your meter is supported*\nMeter: ${m.number}${m.utility ? `\nUtility: ${m.utility}` : ''}${m.provider ? `\nProvider: ${m.provider}` : ''}\n\nYou can buy prepaid at www.paycity.co.za or in the payCity app.`,
  meterNo: (n) =>
    `❌ We couldn't confirm that meter *${n}* is supported.\n\nPlease check the number and try again. If it is correct, contact payCity on 087 237 7011 or support@paycity.co.za.`,

  errorService: '⚠️ The payCity lookup is not available right now. Please try again later or call 087 237 7011.',
  rateLimited: 'You have reached the limit of 10 searches per hour. Please try again later.',
};

export const FAQ = [
  { id: 'free', title: 'Is viewing fines free?', description: 'Cost of viewing fines',
    a: 'Viewing your fines on payCity is *free of charge*.' },
  { id: 'pay', title: 'How do I pay a fine?', description: 'Registering and paying',
    a: 'To pay on the website or app, register and add your *ID, BRN, passport or business certificate number* under Traffic Fine services. payCity then looks up any fines issued against it. You can pay by card or Ozow EFT.\n\nStart at www.paycity.co.za or in the payCity app.' },
  { id: 'areas', title: 'Areas covered', description: 'Which municipalities are supported',
    a: 'payCity offers fine viewing and payment for *selected areas*. If you have the notice number, choose *Notice number search* in this chat (or on the website) to check before registering.\n\nA "not found" result does not mean the fine is invalid – it may just not be payable through payCity.' },
  { id: 'issued', title: 'Fines issued against', description: 'ID, BRN or passport?',
    a: 'Most authorities using the Criminal Procedure Act issue fines against the *owner, driver or proxy\'s ID number*.\n\nFor AARTO fines, individuals are issued fines against an *ID or passport number*, and companies against the *Business Registration Number* issued by Natis.' },
  { id: 'passport', title: 'Passport searches', description: 'Searching with a passport number',
    a: 'Not all fines can be retrieved with a passport number. If you know the *notice number*, enter it to view the fine details.' },
  { id: 'reduced', title: 'Reduced fine amounts', description: 'When a reduction shows',
    a: 'Once a reduction has been captured, the *reduced amount* will display on payCity.' },
  { id: 'licence', title: 'Licence renewal fees', description: 'Service fee and reminders',
    a: 'payCity acts as an *intermediary* for vehicle licence renewals with the relevant issuing authorities and charges a *service fee* to process the renewal on your behalf.\n\nLicence reminder notifications are *free*, with no limit on the number of vehicles you add.' },
  { id: 'format', title: 'Notice number format', description: 'Entering notice numbers',
    a: 'Enter the notice number *exactly as printed* on the notice, including any "/" or "-".' },
  { id: 'card', title: 'Card payments', description: '3D Secure and card checks',
    a: 'payCity uses card-fraud prevention, so your credit card may need to be *3D Secure*. Contact your bank for details. You can also pay with Ozow EFT.' },
];

# payCity WhatsApp Assistant – Prototype (Node.js + React + Meta Cloud API)

Say **hi** → menu:
- **Search my fines** – by SA ID number, Business Registration Number (BRN) or Traffic Register Number (TRN)
- **Notice number search**
- **Is my meter supported?** – prepaid meter number check
- **Our services · About payCity · FAQs (9 questions) · Contact us**

Content comes from paycity.co.za (About, Our Services, FAQs, footer contacts).

## Structure
```
server/   Node.js (Express): WhatsApp webhook, bot logic (bot.js), payCity data layer (paycity.js), input checks (validators.js)
client/   React (Vite): WhatsApp-style tester + the hosted demo
```

## Run locally (VS Code terminal)
```bash
cd server && npm install && copy .env.example .env && npm run dev     # terminal 1
cd client && npm install && npm run dev                               # terminal 2  → http://localhost:5173
```
Type **hi**. Sample data to try (all fake):
| Search | Value | Result |
|---|---|---|
| ID | 8001015009087 | 3 fines |
| ID | 9202204720083 | no fines |
| BRN | 2012/123456/07 | 1 fine |
| TRN | TRN123456 | 1 fine |
| Notice | 9/12345/678901/2 | found |
| Meter | 04012345678 | supported |

## The data source (important)
`PAYCITY_PROVIDER=mock` (default) uses the fake data above. To use real data, switch to `http` and set `PAYCITY_API_URL` / `PAYCITY_API_KEY`;
`server/src/paycity.js` documents the three calls the bot makes (fines, notice, meter) and the JSON it expects. **Adapt `viaHttp()` to whatever payCity's official API returns.**

⚠️ Get **written permission / an official API (or partner agreement) from payCity / Syntell**. The endpoints behind the paycity.co.za website are
internal and undocumented; calling them from a bot without permission may breach the site's terms and is fragile (they can change without notice).

## Privacy (POPIA) – built in
- Consent screen before the first fines search; only the user's *own* details should be searched.
- ID numbers are validated (length, date, checksum) before any lookup, are **never logged or stored**, and results show **masked notice numbers** unless `SHOW_FULL_FINE_DETAILS=true`.
- Max 10 lookups per hour per user (in-memory; use Redis in production).
- Results point users to www.paycity.co.za / the app for full details and payment – the bot never takes payment or card details.

## Publish the prototype (GitHub Pages)
The hosted demo runs the bot **inside the browser** (no server). 
```bash
git init
git add .
git commit -m "payCity bot prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/paycity-whatsapp-bot.git
git push -u origin main
```
Then GitHub → **Settings → Pages → Source: GitHub Actions**, wait for the green tick under **Actions**, and share
`https://YOUR-USERNAME.github.io/paycity-whatsapp-bot/`. (Free accounts need a public repo for Pages. Never commit `.env`.)

## Connect to real WhatsApp
Same Meta Cloud API setup as any WhatsApp bot: Meta app → WhatsApp → Phone number ID, access token, App Secret, webhook
`https://YOUR-HOST/webhook` with your `VERIFY_TOKEN`, subscribe to `messages`. Host `server/` on any Node host (Azure App Service, Render…).

## Before production
- [ ] Official payCity API access + agreement; adapt `viaHttp()`.
- [ ] payCity to review all wording (especially fines/privacy messaging) and confirm contact details.
- [ ] Redis/DB sessions, POPIA privacy notice, human hand-off to payCity support.

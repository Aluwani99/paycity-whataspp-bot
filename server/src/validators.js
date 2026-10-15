// Input checks run BEFORE anything is sent to a data source.

export const digits = (s) => String(s).replace(/\D/g, '');

// South African ID: 13 digits, valid date, citizenship digit 0/1, Luhn checksum
export function isValidSaId(raw) {
  const id = digits(raw);
  if (!/^\d{13}$/.test(id)) return false;
  const yy = +id.slice(0, 2), mm = +id.slice(2, 4), dd = +id.slice(4, 6);
  const dateOk = [1900 + yy, 2000 + yy].some((y) => {
    const d = new Date(Date.UTC(y, mm - 1, dd));
    return d.getUTCFullYear() === y && d.getUTCMonth() === mm - 1 && d.getUTCDate() === dd;
  });
  if (!dateOk || !['0', '1'].includes(id[10])) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let n = +id[12 - i];
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}

const clean = (s) => String(s).trim().toUpperCase().replace(/\s+/g, '');

// Business Registration Number – formats vary (e.g. 2012/123456/07, CK2005/012345/23), so check leniently
export const normBrn = clean;
export const isValidBrn = (s) => /^[A-Z0-9/\-]{6,20}$/.test(clean(s)) && /\d/.test(clean(s));

// Traffic Register Number (TRN)
export const normTrn = clean;
export const isValidTrn = (s) => /^[A-Z0-9]{6,15}$/.test(clean(s));

// Notice numbers must keep "/" and "-" exactly as printed on the notice
export const normNotice = (s) => String(s).trim().toUpperCase();
export const isValidNotice = (s) => /^[A-Z0-9/\-]{5,30}$/.test(normNotice(s).replace(/\s+/g, '')) && /\d/.test(s);

// Prepaid meter numbers are digits only (typically 11)
export const isValidMeter = (s) => /^\d{8,13}$/.test(digits(s)) && digits(s).length === String(s).replace(/[\s-]/g, '').length;

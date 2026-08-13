/**
 * DigiKaveri Cheat Code & Promo Validator
 * 
 * Validates:
 * 1. Standard campaign codes (e.g. PROMO15, SENIORI15, OPISKELIJA15)
 * 2. Algorithmic dynamic cheat codes:
 *    Format: DK<discount>-<4_CHAR_SEED><2_CHAR_CHECKSUM>
 *    Example: DK15-9K2MA7 (15% discount), DK20-X8J4C2 (20% discount)
 */

const SECRET_SALT = "DK_KAUPUNKI_AVAIN_2026_DIGIKAVERI";
const STORAGE_KEY = "digikaveri_redeemed_promo_codes";

/**
 * Compute 2-character hex checksum for a given seed and discount
 */
function computeChecksum(discount, seed) {
  const payload = `${discount}-${seed}-${SECRET_SALT}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, "0");
  return hex.substring(0, 2);
}

/**
 * Generate a valid DigiKaveri Cheat Code on the fly
 * @param {number} discount - Discount percentage (e.g. 10, 15, 20, 50)
 * @returns {string} - e.g. "DK15-8M2QA4"
 */
export function generateCheatCode(discount = 15) {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude 0/O and 1/I for clarity
  let seed = "";
  for (let i = 0; i < 4; i++) {
    seed += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const checksum = computeChecksum(discount, seed);
  return `DK${discount}-${seed}${checksum}`;
}

/**
 * Validate any entered promo code
 * @param {string} code - The promo code string
 * @param {object} campaignConfig - Current campaign.json data
 * @returns {{ valid: boolean, discount: number, isCheatCode: boolean, message: string }}
 */
export function validatePromoCode(code, campaignConfig = {}, lang = "fi") {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, discount: 0, isCheatCode: false, message: "" };
  }

  // Check if this single-use code was already redeemed in this browser
  try {
    const redeemed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (redeemed.includes(cleanCode)) {
      return {
        valid: false,
        discount: 0,
        isCheatCode: true,
        message: lang === "en" 
          ? `Code "${cleanCode}" has already been used on this device.` 
          : `Koodi "${cleanCode}" on jo käytetty tällä laitteella.`
      };
    }
  } catch (_) {}

  // 1. Standard Campaign Codes
  const activeCampaignCode = (campaignConfig.promoCode || "PROMO15").trim().toUpperCase();
  const standardCodes = {
    [activeCampaignCode]: campaignConfig.discountPercent || 15,
    "PROMO15": 15,
    "SENIORI15": 15,
    "OPISKELIJA15": 15,
    "DIGIKAVERI10": 10,
    "VIP20": 20
  };

  if (standardCodes[cleanCode]) {
    return {
      valid: true,
      discount: standardCodes[cleanCode],
      isCheatCode: false,
      code: cleanCode,
      message: lang === "en" 
        ? `✓ Code "${cleanCode}" activated (-${standardCodes[cleanCode]}%)!` 
        : `✓ Koodi "${cleanCode}" aktivoitu (-${standardCodes[cleanCode]}%)!`
    };
  }

  // 2. Dynamic Algorithmic Cheat Codes (e.g. DK15-8M2QA4, DK20-X9K2C1)
  const match = cleanCode.match(/^DK(\d{1,2})-([A-Z0-9]{4})([A-Z0-9]{2})$/);
  if (match) {
    const discount = parseInt(match[1], 10);
    const seed = match[2];
    const expectedChecksum = match[3];

    if (discount > 0 && discount <= 70) {
      const computed = computeChecksum(discount, seed);
      if (computed === expectedChecksum) {
        return {
          valid: true,
          discount: discount,
          isCheatCode: true,
          code: cleanCode,
          message: lang === "en"
            ? `✓ Special single-use code "${cleanCode}" activated (-${discount}%)!`
            : `✓ Uniikki asiakasetukoodi "${cleanCode}" aktivoitu (-${discount}%)!`
        };
      }
    }
  }

  // Invalid code
  return {
    valid: false,
    discount: 0,
    isCheatCode: false,
    message: lang === "en" 
      ? `Invalid or expired promo code.` 
      : `Virheellinen tai vanhentunut alennuskoodi.`
  };
}

/**
 * Mark a single-use cheat code as redeemed
 */
export function markPromoCodeRedeemed(code) {
  if (!code) return;
  const cleanCode = code.trim().toUpperCase();
  try {
    const redeemed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!redeemed.includes(cleanCode)) {
      redeemed.push(cleanCode);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(redeemed));
    }
  } catch (_) {}
}

// Expose generator to window for easy client/admin generation in dev or console
if (typeof window !== "undefined") {
  window.generateDigiKaveriCode = (discount = 15) => {
    const code = generateCheatCode(discount);
    console.log(`%c[DigiKaveri Cheat Code Generated]: %c${code} %c(-${discount}%)`, "color:#3b82f6;font-weight:bold", "color:#10b981;font-weight:bold;font-size:14px;", "color:#6b7280;");
    return code;
  };
}

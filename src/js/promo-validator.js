/**
 * DigiKaveri Cloud Promo Validator (Supabase Pure Cloud Setup)
 * 
 * 1. Standard Campaign Codes (e.g. PROMO15 from campaign.json, SENIORI15, OPISKELIJA15)
 * 2. Unique Single-Use Promo Codes stored in Supabase `promo_codes` table.
 * 
 * 100% Secure: Zero formulas, seeds, or generation logic in the frontend/GitHub.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hmwaplhxstzhhrjzgxxv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DZcgH9hp8lB21aeqzKdWzw_kv1pxUmz';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const STORAGE_KEY = "digikaveri_redeemed_promo_codes";

/**
 * Standard reusable campaign codes defined locally
 */
function getStandardCodes(campaignConfig = {}) {
  const activeCampaignCode = (campaignConfig.promoCode || "PROMO15").trim().toUpperCase();
  return {
    [activeCampaignCode]: campaignConfig.discountPercent || 15,
    "PROMO15": 15,
    "SENIORI15": 15,
    "OPISKELIJA15": 15,
    "DIGIKAVERI10": 10,
    "VIP20": 20
  };
}

/**
 * Fast synchronous check for standard campaign codes and local cache
 * @param {string} code 
 * @param {object} campaignConfig 
 * @param {string} lang 
 * @returns {{ valid: boolean, discount: number, isUniqueCode: boolean, message: string, code?: string }}
 */
export function validatePromoCode(code, campaignConfig = {}, lang = "fi") {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, discount: 0, isUniqueCode: false, message: "" };
  }

  // Check local cache if redeemed on this device
  try {
    const redeemed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (redeemed.includes(cleanCode)) {
      return {
        valid: false,
        discount: 0,
        isUniqueCode: true,
        code: cleanCode,
        message: lang === "en" 
          ? `Code "${cleanCode}" has already been used.` 
          : `Koodi "${cleanCode}" on jo käytetty.`
      };
    }
  } catch (_) {}

  // 1. Standard Campaign Codes
  const standardCodes = getStandardCodes(campaignConfig);
  if (standardCodes[cleanCode]) {
    return {
      valid: true,
      discount: standardCodes[cleanCode],
      isUniqueCode: false,
      code: cleanCode,
      message: lang === "en" 
        ? `✓ Code "${cleanCode}" activated (-${standardCodes[cleanCode]}%)!` 
        : `✓ Koodi "${cleanCode}" aktivoitu (-${standardCodes[cleanCode]}%)!`
    };
  }

  // For unique codes, we return valid tentative status and let async cloud check verify
  return {
    valid: false,
    discount: 0,
    isUniqueCode: true,
    code: cleanCode,
    message: lang === "en" ? "Validating code..." : "Tarkistetaan koodia..."
  };
}

/**
 * Validate promo code against Supabase Cloud Database `promo_codes` table
 * @param {string} code 
 * @param {object} campaignConfig 
 * @param {string} lang 
 * @returns {Promise<{ valid: boolean, discount: number, isUniqueCode: boolean, message: string, code?: string }>}
 */
export async function validatePromoCodeAsync(code, campaignConfig = {}, lang = "fi") {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, discount: 0, isUniqueCode: false, message: "" };
  }

  // Check standard codes first
  const standardCodes = getStandardCodes(campaignConfig);
  if (standardCodes[cleanCode]) {
    return {
      valid: true,
      discount: standardCodes[cleanCode],
      isUniqueCode: false,
      code: cleanCode,
      message: lang === "en" 
        ? `✓ Code "${cleanCode}" activated (-${standardCodes[cleanCode]}%)!` 
        : `✓ Koodi "${cleanCode}" aktivoitu (-${standardCodes[cleanCode]}%)!`
    };
  }

  // Check local cache
  try {
    const redeemed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (redeemed.includes(cleanCode)) {
      return {
        valid: false,
        discount: 0,
        isUniqueCode: true,
        code: cleanCode,
        message: lang === "en" 
          ? `Code "${cleanCode}" has already been used.` 
          : `Koodi "${cleanCode}" on jo käytetty.`
      };
    }
  } catch (_) {}

  // Check Supabase Cloud database
  if (!supabase) {
    return {
      valid: false,
      discount: 0,
      isUniqueCode: false,
      message: lang === "en" ? "Invalid or expired promo code." : "Virheellinen tai vanhentunut alennuskoodi."
    };
  }

  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('code, discount, is_redeemed')
      .eq('code', cleanCode)
      .maybeSingle();

    if (error || !data) {
      return {
        valid: false,
        discount: 0,
        isUniqueCode: false,
        message: lang === "en" ? "Invalid or expired promo code." : "Virheellinen tai vanhentunut alennuskoodi."
      };
    }

    if (data.is_redeemed) {
      // Mark locally too
      markPromoCodeRedeemedLocally(cleanCode);
      return {
        valid: false,
        discount: 0,
        isUniqueCode: true,
        code: cleanCode,
        message: lang === "en" 
          ? `Code "${cleanCode}" has already been used.` 
          : `Koodi "${cleanCode}" on jo käytetty.`
      };
    }

    // Code is valid and unused!
    return {
      valid: true,
      discount: data.discount || 15,
      isUniqueCode: true,
      code: cleanCode,
      message: lang === "en" 
        ? `✓ Promo code "${cleanCode}" activated (-${data.discount || 15}%)!` 
        : `✓ Asiakasetukoodi "${cleanCode}" aktivoitu (-${data.discount || 15}%)!`
    };

  } catch (err) {
    console.warn('[Supabase Promo Check Error]:', err);
    return {
      valid: false,
      discount: 0,
      isUniqueCode: false,
      message: lang === "en" ? "Could not verify promo code." : "Alennuskoodin tarkistus epäonnistui."
    };
  }
}

/**
 * Cache redeemed status locally
 */
function markPromoCodeRedeemedLocally(code) {
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

/**
 * Burn the unique code globally in Supabase and locally
 * @param {string} code 
 */
export async function markPromoCodeRedeemed(code) {
  if (!code) return;
  const cleanCode = code.trim().toUpperCase();
  
  // 1. Mark in local storage
  markPromoCodeRedeemedLocally(cleanCode);

  // 2. Mark redeemed in Supabase
  if (supabase) {
    try {
      await supabase
        .from('promo_codes')
        .update({ 
          is_redeemed: true, 
          redeemed_at: new Date().toISOString() 
        })
        .eq('code', cleanCode);
      console.log(`%c[Supabase]: Code ${cleanCode} redeemed!`, "color:#10b981;font-weight:bold;");
    } catch (err) {
      console.warn('[Supabase Redeem Error]:', err);
    }
  }
}

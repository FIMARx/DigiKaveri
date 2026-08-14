#!/usr/bin/env node
/**
 * DigiKaveri Unique Promo Code Generator CLI
 * 
 * Generates clean unique codes and formats them for Supabase SQL insert or customer flyers.
 * 
 * Usage:
 *   node scripts/generate-codes.js [prefix] [discountPercent] [count]
 * 
 * Examples:
 *   npm run generate-codes
 *   node scripts/generate-codes.js ESPOO 15 10
 */

const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomString(len = 4) {
  let res = "";
  for (let i = 0; i < len; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

const args = process.argv.slice(2);
const prefix = (args[0] || "DK15").toUpperCase();
const discount = parseInt(args[1] || "15", 10);
const count = parseInt(args[2] || "5", 10);

console.log("\n=======================================================");
console.log(`🎟️  DigiKaveri Generated Unique Promo Codes (-${discount}%)`);
console.log("=======================================================");
console.log("Here are your generated codes for customers/flyers:\n");

const codes = [];
for (let i = 1; i <= count; i++) {
  const code = `${prefix}-${randomString(4)}`;
  codes.push(code);
  console.log(`  ${i}. ${code}`);
}

console.log("\n-------------------------------------------------------");
console.log("📋 Ready-to-paste SQL for Supabase SQL Editor:");
console.log("-------------------------------------------------------");
const sqlValues = codes.map(c => `  ('${c}', ${discount})`).join(",\n");
console.log(`INSERT INTO promo_codes (code, discount) VALUES\n${sqlValues}\nON CONFLICT (code) DO NOTHING;\n`);
console.log("=======================================================\n");

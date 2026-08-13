#!/usr/bin/env node
/**
 * DigiKaveri Cheat Code Generator CLI
 * 
 * Usage:
 *   node scripts/generate-codes.js [discountPercent] [count]
 * 
 * Examples:
 *   node scripts/generate-codes.js 15 5    -> Generates 5 unique 15% discount codes
 *   node scripts/generate-codes.js 20 1    -> Generates 1 unique 20% discount code
 */

const SECRET_SALT = "DK_KAUPUNKI_AVAIN_2026_DIGIKAVERI";
const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

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

function generateCode(discount) {
  let seed = "";
  for (let i = 0; i < 4; i++) {
    seed += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const checksum = computeChecksum(discount, seed);
  return `DK${discount}-${seed}${checksum}`;
}

const args = process.argv.slice(2);
const discount = parseInt(args[0] || "15", 10);
const count = parseInt(args[1] || "5", 10);

console.log("\n==========================================");
console.log(`🎟️  DigiKaveri Uniikit Alennuskoodit (-${discount}%)`);
console.log("==========================================");
console.log(`Voit antaa näitä koodeja asiakkaille tai tutuille:\n`);

for (let i = 1; i <= count; i++) {
  const code = generateCode(discount);
  console.log(`  ${i}. ${code}`);
}

console.log("\n💡 Koodit toimivat suoraan hintalaskurissa ja lukittuvat laitekohtaisesti.");
console.log("==========================================\n");

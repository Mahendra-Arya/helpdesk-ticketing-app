/**
 * Membersihkan freetext dari spasi berlebih dan membatasi panjang karakter
 * @param {string} input - Teks mentah dari request
 * @param {number} maxLength - Batas maksimal panjang karakter
 * @returns {string}
 */
const sanitizeText = (input, maxLength = 1000) => {
  if (!input || typeof input !== 'string') return '';

  let clean = input.trim();

  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  return clean;
};

module.exports = { sanitizeText };
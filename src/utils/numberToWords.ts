const WORD_TO_NUM: Record<string, number> = {
  zero: 0, oh: 0,
  one: 1, won: 1, wan: 1,
  two: 2, to: 2, too: 2,
  three: 3, tree: 3,
  four: 4, for: 4, fore: 4,
  five: 5, fife: 5,
  six: 6, sicks: 6,
  seven: 7,
  eight: 8, ate: 8,
  nine: 9, nein: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

export function normalizeAnswer(transcript: string): string {
  const cleaned = transcript.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');
  // Try direct number
  const asNum = parseInt(cleaned, 10);
  if (!isNaN(asNum)) return String(asNum);
  // Try word lookup
  const words = cleaned.split(/\s+/);
  for (const word of words) {
    if (WORD_TO_NUM[word] !== undefined) {
      return String(WORD_TO_NUM[word]);
    }
  }
  // Return cleaned string for pronunciation matching
  return cleaned;
}

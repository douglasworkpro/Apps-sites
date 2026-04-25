/**
 * Generates all possible dot variations for an email address.
 * Limits the number of combinations to prevent browser freezing.
 */
export function generateDotVariations(email: string): string[] {
  const parts = email.split('@');
  if (parts.length !== 2) return [];
  const [local, domain] = parts;

  // Remove existing dots in the local part
  const cleanLocal = local.replace(/\./g, '');

  if (cleanLocal.length === 0) return [];

  // Limit length of local part evaluated for dots to avoid crashing.
  // 13 slots = 8192 combinations. This is a reasonable upper limit.
  const MAX_EVALUATED_CHARS = 14; 
  
  const evaluatedPart = cleanLocal.slice(0, MAX_EVALUATED_CHARS);
  const remainingPart = cleanLocal.slice(MAX_EVALUATED_CHARS);

  const variations: string[] = [];
  const slots = evaluatedPart.length - 1;
  const totalCombinations = Math.pow(2, slots);

  for (let i = 0; i < totalCombinations; i++) {
    let currentVar = evaluatedPart[0];
    for (let j = 0; j < slots; j++) {
      if ((i & (1 << j)) !== 0) {
        currentVar += '.';
      }
      currentVar += evaluatedPart[j + 1];
    }
    variations.push(currentVar + remainingPart + '@' + domain);
  }

  return variations;
}

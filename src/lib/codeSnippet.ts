// Contains the main App logic as string to show in CodeSection
export const mainLogicCode = `/**
 * Lógica principal para gerar as variações com pontos de forma segura.
 * O código encontra todas as combinações binárias possíveis de pontos ("slots")
 * entre as letras antes do '@' no endereço de e-mail.
 */
export function generateDotVariations(email: string): string[] {
  const parts = email.split('@');
  if (parts.length !== 2) return [];
  const [local, domain] = parts;

  // Limpa pontos existentes para evitar pontos duplos e erros no cálculo
  const cleanLocal = local.replace(/\\./g, '');

  if (cleanLocal.length === 0) return [];

  // Limite de segurança: avaliamos no máximo 14 caracteres (13 slots = 8.192 variações)
  // Isso evita que o navegador trave (Out of Memory) com nomes muito longos.
  const MAX_EVALUATED_CHARS = 14; 
  const evaluatedPart = cleanLocal.slice(0, MAX_EVALUATED_CHARS);
  const remainingPart = cleanLocal.slice(MAX_EVALUATED_CHARS);

  const variations: string[] = [];
  const slots = evaluatedPart.length - 1;
  const totalCombinations = Math.pow(2, slots); // 2^n combinações possíveis

  for (let i = 0; i < totalCombinations; i++) {
    let currentVar = evaluatedPart[0];
    for (let j = 0; j < slots; j++) {
      // Usamos operações bit-a-bit para determinar se o slot 'j' recebe um ponto
      if ((i & (1 << j)) !== 0) {
        currentVar += '.';
      }
      currentVar += evaluatedPart[j + 1];
    }
    variations.push(currentVar + remainingPart + '@' + domain);
  }

  // Removemos duplicatas que podem ter surgido de forma inesperada na união
  return Array.from(new Set(variations));
}`;

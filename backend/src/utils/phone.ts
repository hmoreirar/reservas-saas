// Normaliza telefonos chilenos a E.164 (+569XXXXXXXX).
// Copia de packages/shared/src/phone.ts (frontend usa waMeLink) — mantener en sync.

export function normalizeClPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;

  // movil nacional: 9 1234 5678
  if (/^9\d{8}$/.test(digits)) return `+56${digits}`;
  // movil con codigo de pais: 56 9 1234 5678
  if (/^569\d{8}$/.test(digits)) return `+${digits}`;
  // fijo nacional: 2 2345 6789 (u otra region de 1 digito)
  if (/^[2-7]\d{7}$/.test(digits)) return `+56${digits}`;
  // fijo con codigo de pais
  if (/^56[2-7]\d{7}$/.test(digits)) return `+${digits}`;

  return null;
}

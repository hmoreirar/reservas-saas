// Telefonos chilenos y links de WhatsApp.
// En Chile la confirmacion de citas se maneja por WhatsApp: la app solo
// normaliza el numero y arma el link wa.me con el mensaje pre-cargado.

// Normaliza a E.164 Chile (+569XXXXXXXX). Devuelve null si no es valido.
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

// Link wa.me con mensaje pre-armado. whatsapp:// en mobile abre la app.
export function waMeLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

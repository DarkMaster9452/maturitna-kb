// JWT secret sa číta výhradne z prostredia (JWT_SECRET) — v kóde nie je žiadna náhradná hodnota.
// Bez nastaveného secretu aplikácia sessions nevydá ani neoverí.
let cached: Uint8Array | null = null;

export function getJwtSecret(): Uint8Array {
  if (cached) return cached;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET nie je nastavený. Doplň ho do .env.local alebo do premenných prostredia.');
  }
  cached = new TextEncoder().encode(secret);
  return cached;
}

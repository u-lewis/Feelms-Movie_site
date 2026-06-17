export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidOtp(code: string): boolean {
  return /^\d{6}$/.test(code);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

const TOKEN_DURATION_SECONDS = 15 * 60;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type VerificationPayload = { phone: string; expiresAt: number };

export function normalizeBrazilianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^\d{10,11}$/.test(digits)) return `+55${digits}`;
  if (/^55\d{10,11}$/.test(digits)) return `+${digits}`;
  return null;
}

function getVerificationSecret() {
  const secret = process.env.PHONE_VERIFICATION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("PHONE_VERIFICATION_SECRET não configurado ou muito curto.");
  }
  return secret;
}

export function createVerificationCode() {
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)];
  }
  return `TT-${code}`;
}

export function createVerificationChallenge() {
  return randomBytes(32).toString("base64url");
}

export function hashVerificationValue(value: string) {
  return createHmac("sha256", getVerificationSecret())
    .update(value)
    .digest("hex");
}

export function createPhoneVerificationToken(phone: string) {
  const payload: VerificationPayload = {
    phone,
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_DURATION_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getVerificationSecret())
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyPhoneVerificationToken(token: string, expectedPhone: string) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expectedSignature = createHmac("sha256", getVerificationSecret())
    .update(encodedPayload)
    .digest("base64url");
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as VerificationPayload;
    return payload.phone === expectedPhone &&
      payload.expiresAt >= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function verifyMetaSignature(rawBody: string, receivedSignature: string | null) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !receivedSignature) return false;

  const expectedSignature = `sha256=${createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;
  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  return receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer);
}

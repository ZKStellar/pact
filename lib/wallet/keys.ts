import { ed25519 } from "@noble/curves/ed25519.js";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const CRC16_TABLE = (() => {
  const table = new Uint16Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
    table[i] = crc;
  }
  return table;
})();

function crc16(data: Uint8Array): number {
  let crc = 0x0000;
  for (const byte of data) {
    crc = ((crc << 8) & 0xffff) ^ CRC16_TABLE[((crc >> 8) ^ byte) & 0xff];
  }
  return crc;
}

function base32Encode(data: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of data) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

export function strkeyEncode(versionByte: number, payload: Uint8Array): string {
  const data = new Uint8Array(payload.length + 2);
  data.set([versionByte]);
  data.set(payload, 1);
  const checksum = crc16(data.subarray(0, payload.length + 1));
  data[data.length - 2] = (checksum >> 8) & 0xff;
  data[data.length - 1] = checksum & 0xff;
  return base32Encode(data);
}

export function addressFromSeed(seed: Uint8Array): string {
  const publicKey = ed25519.getPublicKey(seed);
  return strkeyEncode(6 << 3, publicKey);
}

export function secretFromSeed(seed: Uint8Array): string {
  return strkeyEncode(18 << 3, seed);
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(data);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", copy));
}

export async function deriveAddressFromCredentialId(credentialId: string): Promise<string> {
  const digest = await sha256(base64UrlToBytes(credentialId));
  return addressFromSeed(digest);
}

export async function deriveSecretFromCredentialId(credentialId: string): Promise<string> {
  const digest = await sha256(base64UrlToBytes(credentialId));
  return secretFromSeed(digest);
}

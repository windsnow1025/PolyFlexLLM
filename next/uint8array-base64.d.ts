// Uint8Array.fromBase64 is not yet in TypeScript lib definitions; remove this file once it ships
interface Uint8ArrayConstructor {
  fromBase64(
    base64: string,
    options?: {
      alphabet?: 'base64' | 'base64url';
      lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial';
    },
  ): Uint8Array<ArrayBuffer>;
}

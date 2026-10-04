// Minimal types for the qrcode package (only the call Text Lab uses).
declare module "qrcode" {
  export function toString(text: string, options?: Record<string, unknown>): Promise<string>;
  const qrcode: { toString: typeof toString };
  export default qrcode;
}

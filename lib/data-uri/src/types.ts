declare global {
  interface Uint8ArrayConstructor {
    fromBase64?: (base64: string) => Uint8Array<ArrayBuffer>;
  }
}
export interface DataURIParts {
  data: string;
  isBase64: boolean;
  mediaType: string;
}

export interface Finger {
  id: number | null;
  name: string | null;
  img: string | null;
  fingerPosition: string | null;
  state: FingerPrintState;
}

export enum FingerPrintState {
  CAPTURED,
  NOTCAPTURED,
  INPROGRESS,
}

export namespace FingerPrint {
  export interface Image {
    format: string;
    resolutionDpi: number;
    data: string;
  }

  export interface Fingerprint {
    position: string;
    image: Image;
  }

  export interface FingerPrintRequest {
    cif: string;
    fingerprints: Fingerprint[];
  }
}

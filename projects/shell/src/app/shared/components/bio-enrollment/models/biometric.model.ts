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

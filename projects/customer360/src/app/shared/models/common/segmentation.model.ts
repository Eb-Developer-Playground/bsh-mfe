export interface SegmentationResponse {
  ecosystem: string;
  ecosystemDesc: string;
  environCat: string;
  environCatDesc: string;
  climateCat: string;
  climateCatDesc: string;
  main: { [key: string]: string };
  secondary: { [key: string]: string };
}

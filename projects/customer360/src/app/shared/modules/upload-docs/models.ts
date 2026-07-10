export interface IDocumentSpec {
  id?: any;
  key?: string;
  name: string;
  description: string;
  fileTypes?: string[];
  maxSize?: number;
  maxLength?: number;
  maxWidth?: number;
  required?: boolean;
  icon?: string;
  docCode?: string;
  canUpload?: boolean;
  hasUploadError?: boolean;
  documentCode?: string;
  fileName?: string;
  shortDesc?: string;
}

export interface IFileParams {
  filename: string;
  docCode?: string;
  format: string;
  data: string;
}

export interface IUploadedDocument extends IDocumentSpec {
  fileName?: any;
  fileSize?: string;
  success?: boolean;
  size?: number;
  file?: File | null | undefined;
  url?: string;
  document: IFileParams;
  isAdditional?: boolean;
  documentCode?: string;
}

export type DocumentUploadServiceType = 'NewGen' | 'Blob';

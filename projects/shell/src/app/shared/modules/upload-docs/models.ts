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
  Required?: boolean;
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
  service?: string;
  processName?: string;
  format: string;
  data: string;
}

export interface IUploadedDocument extends IDocumentSpec {
  fileName?: any;
  FileName?: any;
  fileSize?: string;
  service?: string;
  processName?: string;
  success?: boolean;
  size?: number;
  file?: File | null | undefined;
  url?: string;
  document: IFileParams;
  isAdditional?: boolean;
  documentCode?: string;
  DocumentCode?: string;
}

export type DocumentUploadServiceType = 'NewGen' | 'Blob';

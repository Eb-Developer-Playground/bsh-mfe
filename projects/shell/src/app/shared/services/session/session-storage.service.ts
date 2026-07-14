import { Injectable, inject } from '@angular/core';

import { EncryptionService } from '../encryption.service';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  private readonly encryptionService = inject(EncryptionService);

  setEncryptedItem(key: string, value: string): void {
    localStorage.setItem(key, this.encryptionService.encryptAES(value));
  }

  getDecryptedItem(key: string): string | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const decrypted = this.encryptionService.decryptAES(raw);
    if (this.isLegacyDecryptError(decrypted)) {
      return raw;
    }

    return decrypted;
  }

  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  removeItems(keys: string[]): void {
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  }

  clearSessionTokens(): void {
    this.removeItems(['expires_at', 'access_token', 'syncRt']);
  }

  private isLegacyDecryptError(value: string): boolean {
    return value === 'error 1' || value === 'error 2' || value === 'error 3';
  }
}

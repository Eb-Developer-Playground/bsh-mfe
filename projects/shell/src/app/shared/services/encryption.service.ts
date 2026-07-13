import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  /**
   * Encrypt a derived hd private key with a given pin and return it in Base64 form
   */
  encryptAES = (text: any) => {
    return CryptoJS.AES.encrypt(text, environment.encryptionKey).toString();
  };

  /**
   * Decrypt an encrypted message
   * @param encryptedBase64 encrypted data in base64 format
   * @return The decrypted content
   */
  decryptAES = (encryptedBase64: any) => {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedBase64,
      environment.encryptionKey
    );
    if (decrypted) {
      try {
        const str = decrypted.toString(CryptoJS.enc.Utf8);
        if (str.length > 0) {
          return str;
        } else {
          return 'error 1';
        }
      } catch (e) {
        return 'error 2';
      }
    }
    return 'error 3';
  };
}

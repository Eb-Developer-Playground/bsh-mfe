import { Injectable, Input } from '@angular/core';
import { MessageBoxType, ToastService } from '../toast';
import { STORAGE_KEYS } from '../../models';
import { deepmerge } from '../../utils';

@Injectable({
  providedIn: 'root',
})
export class ContextManager {
  context!:
    | 'account_statement'
    | 'account_balance'
    | 'additional_account'
    | 'chequebook_request'
    | 'funds_transfer'
    | 'mandate'
    | 'signatories'
    | 'signature'
    | 'standing_order'
    | 'save_invest'
    | 'known_agent'
    | 'bulk-payment'
    | 'move-money'
    | 'cache'
    | 'cards'
    | 'card-issuance';

  private _transCustomer = false;
  private _highRisk = false;
  private _contextData: any;
  private _subject: any;
  private _dedupe: any;
  private _ticket: any;
  private _customerCif: any;
  private _cif: any;

  constructor(private toastService: ToastService) {
    if (!this.contextData) {
      this.contextData = {};
    }
  }

  set contextData(obj) {
    localStorage.setItem(
      STORAGE_KEYS.CONTEXT_DATA,
      JSON.stringify(deepmerge(this._contextData, obj))
    );
  }

  get contextData(): { [key: string]: any } {
    return this.retrieve(STORAGE_KEYS.CONTEXT_DATA, {});
  }

  patchContextData(kv: Record<string, any>): void {
    let config = this.contextData;
    // @ts-ignore
    Object.keys(kv)
      .filter((i: string) => !kv[`${i}`])
      .forEach(k => {
        delete config[`${k}`];
      });
    // @ts-ignore
    Object.keys(kv)
      .filter((i: string) => kv[`${i}`])
      .forEach(j => {
        let o = {};
        // @ts-ignore
        o[`${j}`] = kv[`${j}`];
        // @ts-ignore
        config[`${j}`] = kv[`${j}`];
        config = deepmerge(config, o);
      });
    try {
      localStorage.setItem(STORAGE_KEYS.CONTEXT_DATA, JSON.stringify(config));
    } catch (e) {
      this.toastService.show(
        null,
        'Your have uploaded many documents. They may NOT be available for preview.',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
    }
  }

  set currentContextData(obj) {
    if (this.context) {
      if (!this.contextData[`${this.context}`]) {
        const config: any = {};
        config[this.context.toString()] = {};
        this.patchContextData(config);
      }
      const currentContext: any = this.contextData[`${this.context}`];
      const newConfig: any = {};
      newConfig[this.context.toString()] = deepmerge(currentContext, obj);
      this.patchContextData(newConfig);
    }
  }

  get currentContextData(): any {
    if (this.context) {
      return this.contextData[this.context] || {};
    }
    return {};
  }

  public patchCurrentContextData(obj: any) {
    if (this.context) {
      const ctxData: any = this.currentContextData;
      Object.keys(obj)
        .filter((i: string) => !obj[`${i}`])
        .forEach(k => {
          delete ctxData[`${k}`];
        });
      const newConfig: any = {};
      newConfig[this.context.toString()] = deepmerge(
        this.currentContextData,
        obj
      );
      this.patchContextData(newConfig);
    }
  }

  public patchCurrentContextDataCallback(obj: any): Promise<void> {
    return new Promise(async resolve => {
      if (!this.context) {
        resolve(); // Resolve immediately if context is not available
        return;
      }

      const ctxData: any = this.currentContextData;

      // Remove keys where the value is falsy
      Object.keys(obj)
        .filter((key: string) => !obj[key])
        .forEach(key => delete ctxData[key]);

      const newConfig: any = {
        [this.context.toString()]: deepmerge(ctxData, obj),
      };

      await this.patchContextData(newConfig);
      resolve(); // Resolve only after patching is complete
    });
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEYS.DEDUPE_RESPONSE);
    localStorage.removeItem(STORAGE_KEYS.STEPPER_SUBJECT);
    localStorage.removeItem(STORAGE_KEYS.CONTEXT_DATA);
    localStorage.removeItem(STORAGE_KEYS.TICKET_RESPONSE);
  }

  private remove(k: string): void {
    localStorage.removeItem(k);
  }

  private retrieve(k: string, _default?: any): any {
    return localStorage.getItem(k)
      ? JSON.parse(<string>localStorage.getItem(k))
      : _default || null;
  }

  private hasValue(key: string): boolean {
    return !!localStorage.getItem(key);
  }
}

import { Injectable } from '@angular/core';

const SELECTED_ACCOUNT_STORAGE_NAME = 'selectedDepositAccount';

@Injectable({
  providedIn: 'root',
})
export class SaveAndInvestDataStoreService {
  constructor() {}

  public setSelectedDepositAccount = (account: any) =>
    localStorage.setItem(
      SELECTED_ACCOUNT_STORAGE_NAME,
      JSON.stringify(account)
    );

  public getSelectedDepositAccount = (): any =>
    JSON.parse(<string>localStorage.getItem(SELECTED_ACCOUNT_STORAGE_NAME));

  public reset = () => {
    localStorage.removeItem(SELECTED_ACCOUNT_STORAGE_NAME);
  };
}

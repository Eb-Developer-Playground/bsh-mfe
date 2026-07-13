import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  datastore!: { [key: string]: any };

  public setData(key: string, value: any): boolean {
    try {
      this.datastore[key] = value;
      return true;
    } catch (e) {
      return false;
    }
  }

  public getData(key: string) {
    if (!key) {
      return this.datastore;
    } else {
      try {
        return this.datastore[key];
      } catch (e) {
        return null;
      }
    }
  }

  public deleteData(key: string): boolean {
    if (!key) {
      return false;
    }
    delete this.datastore[key];
    return true;
  }

  public clearAllData(): void {
    this.datastore = {};
  }
}

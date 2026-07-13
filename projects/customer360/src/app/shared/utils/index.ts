import { v4 as uuidv4 } from 'uuid';

export { deepmerge } from './deepmerge';
export { logFormErrors } from './logger';

export function chunk(arr: unknown[], size: number): unknown[] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export function guid() {
  const a = new Uint32Array(3);
  window.crypto.getRandomValues(a);
  return (
    performance.now().toString(36) +
    Array.from(a)
      .map(A => A.toString(36))
      .join('')
  ).replace(/\./g, '');
}

export function uuid4() {
  return uuidv4();
}

export function weekendsDatesFilter(d: Date | null): boolean {
  d = new Date(d ? d : '');
  const day = d?.getDay();
  return day !== 0 && day !== 6;
}

export function isLocal(): boolean {
    const loc: Location = window.location;
    return loc.port !== "" || loc.hostname.includes("localhost");
}

export function isDev(): boolean {
  const loc: Location = window.location;
  return (
    loc.port !== '' ||
    loc.hostname.includes('localhost') ||
    loc.hostname.includes('-dev.equitybankgroup.com') ||
    loc.hostname.includes('branchservicehub-customer-360-dev.azurewebsites.net')
  );
}

export function isUat(): boolean {
  return window.location.hostname.includes('-uat.equitygroupholdings.com');
}

export function isProd(): boolean {
  return window.location.hostname.includes('-prod.equitygroupholdings.com');
}

export function isDevOrUat(): boolean {
  return isDev() || isUat();
}

export function currentEnviroment() {
  if (isDev()) {
    return 'dev';
  }

  if (isUat()) {
    return 'uat';
  }

  if (isProd()) {
    return 'prod';
  }

  return null;
}

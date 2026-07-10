function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = toCamelCase(key);
      acc[newKey] = convertKeysToCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

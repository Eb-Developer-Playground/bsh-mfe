// Proxy — resolves relative ../../../../shared/utils from transactions components
export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export function sanitizeInput(value: string): string {
  return value?.replace(/[<>"'&]/g, '') ?? '';
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function logFormErrors(form: any): void {
  if (form?.controls) {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      if (control?.errors) {
        console.warn(`[FormError] ${key}:`, control.errors);
      }
    });
  }
}

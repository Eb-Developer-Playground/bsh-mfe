export function logFormErrors(fieldsForm: any, label?: string): void {
  Object.keys(fieldsForm.controls).forEach(key => {
    const controlErrors: any = fieldsForm.get(key)?.errors;
    if (controlErrors != null) {
      Object.keys(controlErrors).forEach(k => {
        // console.log(label || '', 'Key control: ' + key + ', keyError: ' + k + ', err value: ', controlErrors[k]);
      });
    }
  });
}

import { Component,
  effect,
  forwardRef,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-button-toggle',
  standalone: true,
  imports: [],
  templateUrl: './button-toggle.component.html',
  styleUrl: './button-toggle.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonToggleComponent),
      multi: true,
    },
  ],
})
export class ButtonToggleComponent {
  isDisabled: InputSignal<boolean> = input<boolean>(false);
  isToggleChanged: OutputEmitterRef<boolean> = output();
  protected internalToggledState: WritableSignal<boolean> = signal(false);

  // Expose the value signal for the template
  isToggled: Signal<boolean> = this.internalToggledState.asReadonly();

  // CVA Callbacks (provided by the Forms API)
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  //Write the new value from the Forms API to the component
  writeValue(newValue: boolean): void {
    this.internalToggledState.set(newValue);
  }

  //Register the callback to notify the Forms API of changes
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  //Register the callback to mark the control as touched
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onToggle() {
    if (this.isDisabled()) return;

    const newValue = !this.internalToggledState();
    this.internalToggledState.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    this.isToggleChanged.emit(newValue);
  }
}

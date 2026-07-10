# Stepper Module

#### _Version 2.0_

## Fixed issues

1. Fixed issue where **initialize** callback was not called in the first component.

## What's new

1. The StepperModule makes it easy to set up a step-wisely executed process such as account opening.
2. StepperModule now keeps route activation state in the url making it safe to reload and share urls.
3. V 2.0 introduces **StepperChildComponent** and **StepperParentComponent** each with key callbacks that simplify the setup process.
4. No reliance on **Stepper Service** to propagate states and events. Stepper service will be decoupled and be used as a browser storage/cache broker service.

## Usage

1. Import key modules
   ```typescript
   import { CdkStepperModule } from '@angular/cdk/stepper';
   import { StepperModule } from '../shared/modules/stepper';
   ```
2. Create a parent component by extending **StepperParentComponent**
3. Override **onFinish** and **onQuit** callbacks. onFinish is called when user successfully navigates from the last step. onQuit is called whenever a user clicks the **Quit** or it's equivalent button during interaction. Example

   ```typescript
   ....
   export class MyParentComponent extends StepperParentComponent {

       ngOnInit(): void {
       }

       ....
       onFinish(): void {
           this.ctxManager.patchContextData({individual: null});
           this.router.navigate(['/account-opening/success']).then(m => {
           });
       }

       onQuit(): void {
           const dialogRef = this.dialog.open(QuitAccOpeningComponent, {width: '550px'});
           dialogRef.afterClosed().subscribe(result => {
               if (result) {
                   this.ctxManager.patchContextData({individual: null});
                   this.router.navigate(['/account-opening/']).then(m => {
                   });
               } else {
                   // was dismissed
               }
           });
       }
   ```

4. For each of the child components you create, extend the **StepperChildComponent** and implement **OnActive** and **OnSave** StepperModule contracts. Example

   ```javascript

   import {OnActive, OnSave, StepperChildComponent} from "../../shared/modules/stepper";

   ...
   export class MyChildComponent extends StepperChildComponent implements OnInit, OnActive, OnSave {
       constructor() {
           super();
       }

       onActive() {
           // TODO: Do something when user navigates to this component
       }

       onSave() {
           // TODO: Do something before the user navigates away from this step
           this.gotoNext(); // Must be called at the end of all step operations
       }
   }

   ```

5. Set up your parent component's template with _app-stepper_ child component as root and bind useful events and properties as bellow.

   ```angular2html
   <app-stepper
       #stepper
       (onActive)="onActive($event)"
       (onSave)="onSave($event)"
       (onFinish)="onFinish()"
       (onQuit)="onQuit()"
       [stepperLabel]="'My Feature'">
       <cdk-step
           [label]="'One'">
           <app-one
               #components
               [label]="'One'"
               [stepperComponent]="stepper">
           </app-one>
       </cdk-step>
       <cdk-step
           [label]="'Two'">
           <app-two
               #components
               [label]="'Two'"
               [stepperComponent]="stepper">
           </app-two>
       </cdk-step>

       ...

   </app-stepper>
   ```

   Note: **stepperLabel** should be unique because the Stepper module uses it as child component query id. ALL child components must be tagged with **#components**

6. Happy coding

## Go further?

### Enable step validation

To enable step-wise validation, do;

1. Set **linear** property of **<app-stepper>** to **true**.
2. In the parent component, initialize a control (form control, group, or array) for each step and bind as properties as bellow.
   Calls

   ```typescript
   import { Component } from '@angular/core';
   import { StepperParentComponent } from '../shared/modules/stepper';
   import { QuitAccOpeningComponent } from '../home/services/onboarding/ke/qde-components/dialogs';
   import { FormGroup, Validators } from '@angular/forms';

   @Component({
     selector: 'app-stepping',
     templateUrl: './stepping.component.html',
     styleUrls: ['./stepping.component.scss'],
   })
   export class SteppingComponent extends StepperParentComponent {
     oneForm: FormGroup = this.fb.group({ name: ['', Validators.required] });
     twoForm: FormGroup = this.fb.group({ name: ['', Validators.required] });
     threeForm: FormGroup = this.fb.group({ name: ['', Validators.required] });
     fourForm: FormGroup = this.fb.group({ name: ['', Validators.required] });
     fiveForm: FormGroup = this.fb.group({ name: ['', Validators.required] });
     sixForm: FormGroup = this.fb.group({ name: ['', Validators.required] });

     ngOnInit(): void {}
   }
   ```

   Template

   ```angular2html
      <app-stepper
          #stepper
          [linear]="true"
          (onActive)="onActive($event)"
          (onSave)="onSave($event)"
          (onFinish)="onFinish()"
          (onQuit)="onQuit()"
          [stepperLabel]="'My Feature'">
          <cdk-step
              [label]="'One'"
              [stepControl]="myFormGroup">
              <app-one
                  #components
                  [label]="'One'"
                  [stepperComponent]="stepper"
                  [stepControl]="myFormGroup">
              </app-one>
          </cdk-step>
          ...
      </app-stepper>
   ```

   Note: The "go to next" button is disable on a step while the step control is invalid

3. Child component set up is as bellow.

   ```typescript
   @Component({
     selector: 'app-one',
     templateUrl: './one.component.html',
     styleUrls: ['./one.component.scss'],
   })
   export class OneComponent
     extends StepperChildComponent
     implements OnInit, OnSave, OnActive
   {
     get form(): FormGroup {
       return this.stepControl as FormGroup;
     }
     codes = [
       { name: 'Kenyan', code: '254' },
       { name: 'Ugandan', code: '255' },
     ];

     constructor() {
       super();
     }

     ngOnInit(): void {}

     onActive() {}

     onSave() {
       // Nothing to do for now
       this.gotoNext();
     }
   }
   ```

   And the template as bellow

   ```angular2html
   <mat-card class="mb-10" style="margin-top: 1rem; padding: 1.5rem">
       <div class="mb-1">
           <h3 class="mat-title fw-400 mb-0">Form</h3>
       </div>
       <p class="subtitle fw-300 fs-09 mt-0 mb-0">
           Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis cumque delectus deserunt dolorum eum iure pariatur ratione sapiente soluta voluptas!.
       </p>
       <div class="pt-18 pb-18">
           <mat-divider></mat-divider>
       </div>
       <form *ngIf="form" [formGroup]="form" class="fieldset">
           <mat-form-field appearance="fill">
               <mat-label>Nationality</mat-label>
               <mat-select formControlName="name">
                   <mat-option [value]="nationality.code" *ngFor="let nationality of codes">
                       {{nationality.name}}
                   </mat-option>
               </mat-select>
           </mat-form-field>
       </form>
   </mat-card>
   ```

4. Happy coding!

# ToastModule Usage

1. Import `ToastModule` in your module.
2. Inject `ToastService` to your component class.
3. Define toast MessageBoxType.

Example:

component.ts

```
    ...
    action: MessageBoxType = MessageBoxType.DANGER;

    // For gracefully handling subscriptions
    private destroySubject = new Subject();

    ...
    constructor(private toast: ToastService) {
        //
    }

    ...
    showToast(): void {
        this.toastService.show(
            `Oops! That wasn't the plan`,
            '',
            MessageBoxType.DANGER
        );

        this.toastService.dismissed().pipe(takeUntil(this.destroySubject)).subscribe(
            (data: {dismissedByAction: boolean}) => {
                if (this.action === MessageBoxType.DANGER && data.dismissedByAction) {
                    //
                }
            }
        );
    }

    ngOnDestroy(): void {
        this.destroySubject.next('');
        this.destroySubject.complete();
    }
```

Bind event

component.html

```
<button (click)="show()">Toast</button>
```

Demo route
http://localhost:4200/guides#toast

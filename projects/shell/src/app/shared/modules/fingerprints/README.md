# Fingerprints Module

Module for all things fingerprints viz; enrol & verify

## 1. Enrollment

### Fingerprints components

### Enrol fingerprints dialog using BioService

## 2. Verification

### Usage

1. Import FingerprintsModule
2. Import and inject the FingerprintsService
3. Define verify-bio payload and call `verify` on BioService.

Verify-bio Payload

```
{
    account: <object>,
    skipBio: <bool>,
    inProcess: <bool>,
    customerId: <string>,
    customerType: <string>,
    fullName: <string>,
    mandate: <string>,
    bankId: <string>
}
```

- **account** - Account object from account inquiry (v2) api or object with _accountNumber_, _accountName_, _mandate_, _schemeType_ and _schemeCode_.
- **skip** - Flag to enable skip bio. For entity, this will be sourced from mandate inquiry.
- **inProcess** - Flag for whether to trigger skip-bio for specific action or reason. _True_ - does not trigger.
- **customerId** - Customer ID.
- **customerType** - Type of customer **Entity** or **Individual**
- **fullName** - Full name of customer. For an individual it will be a concatenation of first, middle and last names.
- **bankId** - as usual. 54 for KE e.t.c.

```

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class TestComponent {

    constructor(private fService: FingerprintsService) {
    }

    ...

    verifyBiometrics() {
        this.fService.verify({
            account: {
                accountName: "HAFARE INVESTMENT LIMITED",
                accountNumber: "0150297374240",
                schemeType: "CAA",
                mandate: "AWITH",
                schemeCode: "CA200"
            },
            skipBio: false,
            inProcess: true,
            customerId: "54305863701",
            customerType: 'Entity',
            fullName: "HAFARE INVESTMENT LIMITED",
            bankId: "54"
        }).subscribe(
            res => {
                // Handle response accordingly
            }
        )
    }

    ...
}
```

### Response

```
{
    success: <bool>,
    skipBio: <bool>,
    skipBioForm: <obj>,
    documents: <array>,
    bioObj: <obj>,
}
```

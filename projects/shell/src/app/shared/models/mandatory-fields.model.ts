export const MandatoryFieldsStub = {
        personalDetails: {
                firstName: "",
                lastName: "",
                birthDate: "",
                gender: "",
                krapInNumber: "",
                religion: "",
                maritalStatus: "",
                salutation: "",
                nationality: "",
        },
        identificationDetails: {
                idType: "",
                referenceNum: "",
                issueDt: "",
                expiryDt: "",
                countryOfIssue: "",
                placeOfIssue: "",
                preferred: true,
        },
        contactDetails: {
                emailAddresses: [{
                        emailType: "",
                        preferred: true,
                        emailAddress: "",
                }],
                phoneNumbers: [{
                        phoneType: "",
                        phoneNumber: "",
                        preferred: true,
                }],
                addresses: [{
                        addressType: "",
                        country: "",
                        county: "",
                        constituency: "",
                        division: "",
                        location: "",
                        subLocation: "",
                        village: "",
                        estate: "",
                        postalAddress: "",
                        city: "",
                        postalCode: "",
                }]
        },
        sourceOfIncome: {
                employmentStatus: ""
        }
};

export type MandatoryFields = typeof MandatoryFieldsStub;

export const MandatoryFieldsStubKeys = Object.keys(MandatoryFieldsStub) as (keyof MandatoryFields)[]

// Helper to get all paths from the stub automatically
function getObjectPaths(obj: any, prefix = ''): string[] {
        return Object.keys(obj).reduce((acc: string[], key) => {
                const path = prefix ? `${prefix}.${key}` : key;
                if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                        return [...acc, ...getObjectPaths(obj[key], path)];
                }
                return [...acc, path];
        }, []);
}

export const MandatoryFieldsPaths = getObjectPaths(MandatoryFieldsStub);

export interface MissingFields {
        parent: string,
        child: string
}
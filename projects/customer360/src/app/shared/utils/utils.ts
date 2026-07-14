import CONST from "./constants";

const {TICKET_STATUS, LANGUAGES} = CONST;

export function queryParams(url: string, params: Record<string, any>): string {
    const parameters = Object.entries(params)
        .filter(([_, value]) => Boolean(value))
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {} as Record<string, any>);

    if (typeof url === "string" && url.trim() && typeof parameters === "object") {
        if (Object.keys(parameters).length === 0) {
            return url;
        }

        const query = Object.keys(parameters)
            .map((key) => `${key}=${parameters[key]}`)
            .join("&");

        return `${url}?${query}`;
    }

    throw new Error(`Trying to call "queryParams" with invalid params: (${url}, ${parameters})`);
}

export function getTicketStatusLabel(status: string): string {
    let statusLabel;

    switch (status) {
        case TICKET_STATUS.SUBMITTED_TO_COMPLIANCE:
            statusLabel = "Submitted to Compliance";
            break;
        case TICKET_STATUS.SUBMITTED_TO_CHECKER:
            statusLabel = "Submitted to Checker";
            break;
        case TICKET_STATUS.SUBMITTED_TO_OPERATIONS_MANAGER:
            statusLabel = "Submitted to Operations Manager";
            break;
        case TICKET_STATUS.SUBMITTED_TO_GPC:
            statusLabel = "Submitted to Gpc";
            break;
        case TICKET_STATUS.SUBMITTED_TO_BRANCH:
            statusLabel = "Submitted to Branch";
            break;
        case TICKET_STATUS.SUBMITTED_TO_LEGAL:
            statusLabel = "Submitted to Legal";
            break;
        case TICKET_STATUS.RETURNED:
            statusLabel = "Returned";
            break;
        case TICKET_STATUS.PENDING:
            statusLabel = "Pending";
            break;
        case TICKET_STATUS.NEW:
            statusLabel = "New";
            break;
        case TICKET_STATUS.SUBMITTED_TO_BIO_CHECKER:
            statusLabel = "Submitted to Bio Checker";
            break;
        case TICKET_STATUS.SUBMITTED_TO_ID_CHECKER:
            statusLabel = "Submitted to Id Checker";
            break;
        default:
            statusLabel = status;
            break;
    }

    return statusLabel;
}


export function getLanguageLabel(language: string): string {
    let label;

    switch (language) {
        case LANGUAGES.EN:
            label = "English";
            break;
        case LANGUAGES.FR:
            label = "French";
            break;
        case LANGUAGES.FR_CD:
            label = "French DRC";
            break;
        default:
            label = language;
            break;
    }

    return label;
}

export function capitalizedString(_string: string) {
    const splitArr = _string.split(" ");
    const capitalizedArr = splitArr.map(
        (word: string) => word[0].toUpperCase() + word.substring(1).toLowerCase()
    );
    return capitalizedArr.join(" ");
}

/**
 * Groups an array of customer entries by their CIF number.
 * @param entries Array of customer records.
 */
export function groupEntriesByCif(entries: any[]): Record<string, any[]> {
    return entries.reduce(
        (acc, entry) => {
            const {cifNumber} = entry;
            if (cifNumber) {
                if (!acc[cifNumber]) {
                    acc[cifNumber] = [];
                }
                acc[cifNumber].push(entry);
            }
            return acc;
        },
        {} as Record<string, any[]>
    );
}

/**
 * Combines multiple entries for the same CIF number into a single consolidated entry,
 * aggregating all relevant flags and data sets.
 * @param entries Array of entries with the same CIF number.
 */
export function combineCustomerEntries(entries: any[]): any {
    // Start with a shallow copy of the first entry
    const baseEntry = {...entries[0]};

    // Combine flags: if any entry has "1" for a given flag, that flag should be "1" in the final result
    baseEntry.documentNumberFlag = entries.some((e) => e.documentNumberFlag === "1") ? "1" : null;
    baseEntry.emailAddressFlag = entries.some((e) => e.emailAddressFlag === "1") ? "1" : null;
    baseEntry.dateOfBirthFlag = entries.some((e) => e.dateOfBirthFlag === "1") ? "1" : null;
    baseEntry.phoneNumberFlag = entries.some((e) => e.phoneNumberFlag === "1") ? "1" : null;

    // For associated properties, pick the first non-empty value or retain original if needed
    baseEntry.documentNumber = entries.find((e) => e.documentNumber)
        ? entries.find((e) => e.documentNumber)!.documentNumber
        : baseEntry.documentNumber;
    baseEntry.phoneNumber = entries.find((e) => e.phoneNumber && e.phoneNumber.trim())
        ? entries.find((e) => e.phoneNumber && e.phoneNumber.trim())!.phoneNumber
        : baseEntry.phoneNumber;
    baseEntry.emailAddress = entries.find((e) => e.emailAddress && e.emailAddress.trim())
        ? entries.find((e) => e.emailAddress && e.emailAddress.trim())!.emailAddress
        : baseEntry.emailAddress;
    baseEntry.dateOfBirth = entries.find((e) => e.dateOfBirth)
        ? entries.find((e) => e.dateOfBirth)!.dateOfBirth
        : baseEntry.dateOfBirth;

    return baseEntry;
}


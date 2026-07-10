function isEmpty(value: any): boolean {
    return (
        value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)
    );
}

export function findMissingData(object: any, mandatoryFields: string[], path: string = ''): string[] {
    let missingData: string[] = [];

    if (isEmpty(object)) {
        return [];
    }

    if (typeof object === 'object' && object !== null) {
        if (Array.isArray(object)) {
            object.forEach((item) => {
                missingData.push(...findMissingData(item, mandatoryFields));
            });
        } else if (typeof object === 'object' && object !== null) {
            Object.keys(object).forEach(key => {
                const value = object[key];
                const currentPath = path ? `${path}.${key}` : key;

                if (mandatoryFields.includes(currentPath) && isEmpty(value)) {
                    missingData.push(currentPath);
                }

                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    missingData.push(...findMissingData(value, mandatoryFields, currentPath));
                }

                if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        missingData.push(...findMissingData(item, mandatoryFields, `${currentPath}[${index}]`));
                    });
                }

            });
        }

    }
    return [...new Set(missingData)];

}
export function compareVersions(a: string, b: string): number {
    const normalize = (version: string) => version.split('.').map((part) => Number(part) || 0);

    const aParts = normalize(a);
    const bParts = normalize(b);
    const maxLength = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < maxLength; i++) {
        const aVal = aParts[i] ?? 0;
        const bVal = bParts[i] ?? 0;

        if (aVal > bVal) {
            return 1;
        }
        if (aVal < bVal) {
            return -1;
        }
    }

    return 0;
}

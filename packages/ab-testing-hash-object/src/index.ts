import createHash from 'create-hash';

export function hashWithSalt(value: unknown, salt: string): string {
    const hash = createHash('sha256');
    hash.update(salt);
    hash.update(String(value));
    return hash.digest('hex');
}

export function hashArray(values: unknown[], salt: string): string[] {
    return values.map(val => hashWithSalt(val, salt));
}

export function hashObject(
    obj: { [key: string]: string | number | undefined },
    salt: string
): { [key: string]: string };

export function hashObject(
    obj: { [key: string]: string[] | number[] | undefined },
    salt: string
): { [key: string]: string[] };

export function hashObject(obj: { [s: string]: unknown }, salt: string): unknown {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => [
                hashWithSalt(key, salt),
                Array.isArray(value) ? hashArray(value, salt) : hashWithSalt(value, salt),
            ])
    );
}

export default hashObject;

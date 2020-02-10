import 'ts-polyfill/lib/es2019-object';
import createHash from 'create-hash';

export function hashWithSalt(value: unknown, salt: string): string {
    const hash = createHash('sha256');
    hash.update(salt);
    hash.update(String(value));
    return hash.digest('hex');
}

export function hashObject(
    obj: { [key: string]: string | number | undefined },
    salt: string
): { [s: string]: string } {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => [hashWithSalt(key, salt), hashWithSalt(value, salt)])
    );
}

export default hashObject;

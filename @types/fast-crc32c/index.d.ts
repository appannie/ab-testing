declare module 'fast-crc32c' {
    export function calculate(data: string | Buffer, initial?: number): number;
}

declare module 'fast-crc32c/impls/js_crc32c' {
    export * from 'fast-crc32c';
}

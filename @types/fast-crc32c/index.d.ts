declare module 'fast-crc32c' {
    export function calculate(data: string | Buffer, initial?: number): number;
}

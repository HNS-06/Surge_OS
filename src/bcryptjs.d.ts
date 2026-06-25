declare module 'bcryptjs' {
  export function hashSync(password: string, salt: number | string): string;
  export function compareSync(password: string, hash: string): boolean;
  export function hash(password: string, salt: number | string): Promise<string>;
  export function compare(password: string, hash: string): Promise<boolean>;
}

export type Pipe<P extends boolean, R extends any> = P extends true
  ? (...args: any[]) => Promise<R> | R
  : (...args: any[]) => R;

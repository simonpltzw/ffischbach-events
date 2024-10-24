export type Action<T> = {
  [K in keyof T]?: T[K] extends object ? Action<T[K]> : T[K];
};

export interface Error {
  errors: { [key: string]: string[] };
  type: string;
  title: string;
  status: number;
  traceId: string;
}

type Action<T> = {
  [K in keyof T]: T[K] extends object ? Action<T[K]> : T[K];
};


/*
 * DeepReadonly type is a mapped type that recursively applies the `readonly`
 * modifier to all properties and nested properties of a given type `T`.
 */

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

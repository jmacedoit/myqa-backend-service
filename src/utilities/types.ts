
/*
 * Useful to get the type of a property of an object in a type safe way that survives refactoring.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function properties<TObj>(obj?: TObj) {
  return new Proxy({}, {
    get: (_, prop) => prop,
    set: () => {
      throw Error('Set not supported');
    },
  }) as {
      [P in keyof TObj]: P;
    };
}

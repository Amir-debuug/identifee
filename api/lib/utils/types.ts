/**
 * Makes a key required from the given object.
 */
export type RequireKeys<T extends object, K extends keyof T> = Required<
  Pick<T, K>
> &
  Omit<T, K>;

/**
 * Makes a key optional from the given object
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes provided key optional and only returns a type with the partial keys
 */
export type PartialSet<T, K extends keyof T> = PartialBy<Pick<T, K>, K>;

/**
 * Excludes a key from the given object
 */
export type ExcludeKey<T, U extends string> = Exclude<
  {
    [K in keyof T]: K extends U ? never : K;
  }[keyof T],
  null | undefined
>;
export type RequiredNotNull<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
export type Ensure<T extends object, K extends keyof T> = T &
  RequiredNotNull<Pick<RequireKeys<T, K>, K>>;

/**
 * Picks nullable keys from the given object
 */
export type PickNullable<T> = Pick<
  T,
  {
    [K in keyof T]: null extends T[K] ? K : never;
  }[keyof T]
>;
/**
 * Picks non-nullable keys from the given object
 */
export type PickNotNullable<T> = Pick<
  T,
  {
    [K in keyof T]: null extends T[K] ? never : K;
  }[keyof T]
>;
/**
 * Picks non-optional keys from the given object
 */
export type PickNotUndefined<T, U extends keyof T = keyof T> = Pick<
  T,
  U extends string ? (undefined extends T[U] ? never : U) : never
>;
/**
 * Picks optional keys from the given object
 */
export type PickUndefined<T, U extends keyof T = keyof T> = Pick<
  T,
  U extends string ? (undefined extends T[U] ? U : never) : never
>;

/**
 * Makes nullable keys optional in the provided type.
 */
export type OptionalNullable<T> = Partial<PickNullable<T>> & PickNotNullable<T>;

// expands object types one level deep
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
/**
 * Expands object types recursively. This is useful for type generation in situations
 * where a defined type uses utility types.
 *
 * e.g.:
 * type Foo = Omit<MyType, "keyToOmit" | "anotherToOmit">
 *
 * Type generation doesn't know how to handle "Omit" so we need to expand it.
 */
export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

/**
 * Extracts the return type of a Promise function. Similar to using await.
 */
export type AwaitFn<T extends (...args: any[]) => Promise<any>> = Awaited<
  ReturnType<T>
>;

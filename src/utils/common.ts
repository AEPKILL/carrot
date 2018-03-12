const FUNCTION_TYPE_STRING = typeof isFunction;
// tslint:disable-next-line:no-any ban-types
export function isFunction(fn: any): fn is Function {
  return typeof fn === FUNCTION_TYPE_STRING;
}

export function noInArray<T>(items: T[], item: T) {
  return items.indexOf(item) === -1;
}

export interface ResultBase {
  errno: number;
  request_id: number;
}

export interface List<T> {
  list: T[];
}

export type Result<T> = ResultBase & T;

export type ResultList<T> = ResultBase & List<T>;

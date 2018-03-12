export interface RuntimeMessageOption {
  shareCSS: string[];
}
export class RuntimeMessage<T> {
  readonly type: string;
  readonly data: T;
  readonly options: RuntimeMessageOption;
  constructor(message: string, data: T, options: RuntimeMessageOption) {
    this.type = message;
    this.data = data;
    this.options = options;
  }
}

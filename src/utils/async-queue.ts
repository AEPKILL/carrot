import { isFunction } from './common';
export default class AsyncQueue {
  // tslint:disable-next-line:ban-types
  private _queue: Array<Function | number> = [];
  // tslint:disable-next-line:no-any
  private _timer: any = null;
  private _runing = false;

  get runing() {
    return this._runing;
  }

  wait(time: number) {
    this._queue.push(time);
    return this;
  }

  // tslint:disable-next-line:ban-types
  do(fn: Function) {
    this._queue.push(fn);
    return this;
  }

  start() {
    if (!this._runing) {
      this._runing = true;
      this._loop();
    }
  }

  pause() {
    clearTimeout(this._timer);
    this._runing = false;
    return this;
  }

  stop() {
    this.pause();
    this._queue = [];
    return this;
  }

  private _loop() {
    const item = this._queue.shift();
    let time = 0;
    if (item === undefined) {
      this.stop();
      return;
    }
    if (isFunction(item)) {
      item();
    } else {
      time = item;
    }
    this._timer = setTimeout(this._loop.bind(this), time);
  }
}

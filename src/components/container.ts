import BaseComponent from './base-component';

export default class Container extends BaseComponent {
  constructor(name: string) {
    super({ className: `${name}-container` });
  }
}

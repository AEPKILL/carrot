import { addClass, ele, removeClass } from '../utils/dom';
import BaseComponent from './base-component';

export default class Loading extends BaseComponent {
  constructor() {
    super({ className: 'loading-container' });
    const $mask = ele({ className: 'loading-mask' });
    const $loading = ele({ className: 'loading' });
    const $loadingWrap = ele({ className: 'loading-wrap' });
    $loadingWrap.appendChild($loading);
    this.element.appendChild($mask);
    this.element.appendChild($loadingWrap);
  }
  show() {
    addClass(this.element, 'active');
  }
  hide() {
    removeClass(this.element, 'active');
  }
}

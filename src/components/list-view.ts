import PerfectScrollbar from 'perfect-scrollbar';
import { addClass, ele, removeClass } from '../utils/dom';
import BaseComponent from './base-component';

export interface ListItem<T> extends BaseComponent {
  update(data: T, index?: number): void;
}

export default class ListView<T> extends BaseComponent {
  private $emptyText = ele({
    className: 'empty-tips',
    children: ['这里什么也没有']
  });
  private scrollbar!: PerfectScrollbar;
  private scrollTop = 0;
  private items: Array<ListItem<T>> = [];
  // tslint:disable-next-line:no-any
  private renderScrollbarTimer!: any;

  constructor(private itemConstructor: { new (): ListItem<T> }) {
    super({ className: 'list-view' });
    this.element.addEventListener('scroll', this.onScroll.bind(this));
  }
  remove(index: number) {
    const item = this.items[index];
    if (item) {
      this.removeComponent(item);
      this.scrollbar.update();
    }
  }
  set(data: T[]) {
    this.removeComponent(...this.items);
    this.items = [];
    // 更新数据
    this.element.scrollTop = 0;
    this.add(data);
  }

  add(datas: T[]) {
    if (!datas.length) {
      this.addChildren(this.$emptyText);
      return;
    }
    this.removeChildren(this.$emptyText);
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      const listItem = new this.itemConstructor();
      listItem.element.addEventListener(
        'mouseover',
        this.onMouseoverLine.bind(this, listItem)
      );
      listItem.element.addEventListener(
        'mouseout',
        this.onMouseoutLine.bind(this, listItem)
      );
      listItem.update(data, i);
      this.items.push(listItem);
      this.addComponent(listItem);
    }
    this.renderScrollbarTimer = setTimeout(() => {
      if (this.scrollbar) {
        this.scrollbar.update();
      } else {
        this.scrollbar = new PerfectScrollbar(this.element);
      }
    }, 0);
  }

  onDestory() {
    clearTimeout(this.renderScrollbarTimer);
    if (this.scrollbar) {
      this.scrollbar.destroy();
    }
  }

  onRemove() {
    this.scrollTop = this.element.scrollTop;
  }

  onAppend() {
    this.element.scrollTop = this.scrollTop;
  }

  private onMouseoverLine(item: ListItem<T>) {
    addClass(item.element, 'active');
  }

  private onMouseoutLine(item: ListItem<T>) {
    removeClass(item.element, 'active');
  }

  private onScroll() {
    if (
      this.element.scrollTop + this.element.offsetHeight >=
      this.element.scrollHeight
    ) {
      this.emit(ListView.SCROLL_BOTTOM);
    }
  }

  static SCROLL_BOTTOM = 'SCROLL_BOTTOM';
}

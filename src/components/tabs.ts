import { addClass, ele, removeClass } from '../utils/dom';
import BaseComponent from './base-component';
import Container from './container';

export interface Tab {
  name: string;
  body: BaseComponent;
}
export interface TabsOptions {
  active?: number;
}
export default class Tabs extends BaseComponent {
  private activeIdx = -1;
  private tabsBodyContainer = new Container('tabs-body');
  private tabsHeaderContainer = new Container('tabs-header');
  private $line = ele({ className: 'tabs-header__line' });
  private tabsHeaders: HTMLElement[] = [];

  constructor(private tabs: Tab[], private options?: TabsOptions) {
    super({ className: 'tabs' });

    const width = `${100 / tabs.length}%`;
    const lineWidth = `${100 / tabs.length * 0.8}%`;
    this.$line.style.width = lineWidth;

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const tabsHeader = ele({
        className: 'tabs-header',
        children: [
          ele({ className: 'tabs-header__name', children: [tab.name] })
        ]
      });
      tabsHeader.style.width = width;
      this.tabsHeaderContainer.addChildren(tabsHeader);
      this.tabsHeaders.push(tabsHeader);
      tabsHeader.addEventListener('click', () => this.switchTo(i));
    }

    this.addComponent(this.tabsHeaderContainer);
    this.addComponent(this.tabsBodyContainer);
    this.tabsHeaderContainer.element.appendChild(this.$line);
  }

  onAppend() {
    const active = Math.min(
      this.tabs.length - 1,
      Math.max(0, (this.options && this.options.active) || 0)
    );
    this.switchTo(active);
  }

  switchTo(idx: number) {
    if (idx < 0 || idx >= this.tabs.length || idx == this.activeIdx) {
      return;
    }
    const width = 100 / this.tabs.length;

    for (let i = 0; i < this.tabs.length; i++) {
      const tab = this.tabs[i];
      const tabsBody = tab.body;
      const tabsHeader = this.tabsHeaders[i];
      if (i !== idx) {
        this.tabsBodyContainer.removeComponent(tabsBody);
        removeClass(tabsHeader, 'active');
      } else {
        this.tabsBodyContainer.addComponent(tabsBody);
        addClass(tabsHeader, 'active');
      }
    }

    this.$line.style.left = `${idx * width + width * 0.1}%`;
    this.activeIdx = idx;
  }
}

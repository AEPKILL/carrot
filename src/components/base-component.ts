import Events from 'events';
import { noInArray } from '../utils/common';
import { addComponentTo, removeComponent } from '../utils/component';
import { ele, ElementAttrs } from '../utils/dom';

export interface BaseComponent {
  onAppend?(): void;
  onRemove?(): void;
  onDestory?(): void;
}

export abstract class BaseComponent extends Events {
  protected _element!: HTMLElement;
  private _children: BaseComponent[] = [];
  private _dependencies: BaseComponent[] = [];
  private _mounted = false;
  private _destory = false;
  private _parent: BaseComponent | null = null;

  get parent() {
    return this._parent;
  }
  get mounted() {
    return this._mounted;
  }
  get destoryed() {
    return this._destory;
  }
  get children() {
    return this._children.slice(0);
  }
  get dependencies() {
    return this._dependencies.slice(0);
  }
  get element() {
    return this._element;
  }

  constructor(attrs?: ElementAttrs) {
    super();
    this._element = ele(attrs);
  }

  addDependencies(...components: BaseComponent[]) {
    for (const component of components) {
      if (noInArray(this._dependencies, component)) {
        this._dependencies.push(component);
      }
    }
  }

  removeDependencies(...components: BaseComponent[]) {
    for (const component of components) {
      const idx = this._children.indexOf(component);
      if (idx >= 0) {
        this._children.splice(idx, 1);
      }
    }
  }

  addChildren(...children: HTMLElement[]) {
    for (const element of children) {
      this.element.appendChild(element);
    }
  }

  removeChildren(...children: HTMLElement[]) {
    for (const element of children) {
      if (this.element.contains(element)) {
        element.parentElement!.removeChild(element);
      }
    }
  }

  addComponent(...components: BaseComponent[]) {
    for (const component of components) {
      if (noInArray(this._children, component)) {
        this._children.push(component);
        component._parent = this;
        addComponentTo(this.element, component, !this.mounted);
      }
    }
  }

  removeComponent(...components: BaseComponent[]) {
    for (const component of components) {
      const idx = this._children.indexOf(component);
      if (idx >= 0) {
        this._children.splice(idx, 1);
      }
      component._parent = null;
      removeComponent(component, !this.mounted);
    }
  }
}

export default BaseComponent;

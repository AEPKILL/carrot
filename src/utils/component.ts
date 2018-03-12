import BaseComponent from '../components/base-component';

enum MESSAGE {
  INIT,
  REMOVE,
  DESTORY
}

function broadcast(component: BaseComponent, message: MESSAGE) {
  let fn: undefined | (() => void);
  // tslint:disable-next-line:no-any
  const tempComponent = (component as any) as {
    _mounted: boolean;
    _destory: boolean;
  };
  switch (message) {
    case MESSAGE.INIT: {
      if (tempComponent._mounted) {
        return;
      }
      tempComponent._mounted = true;
      fn = component.onAppend;
      break;
    }
    case MESSAGE.REMOVE: {
      if (!tempComponent._mounted) {
        return;
      }
      tempComponent._mounted = false;
      fn = component.onRemove;
      break;
    }
    case MESSAGE.DESTORY: {
      tempComponent._destory = true;
      fn = component.onDestory;
    }
  }
  if (fn) {
    fn.call(component);
  }

  const dependencies = component.children
    .concat(component.dependencies)
    .slice(0);
  for (const comp of dependencies) {
    broadcast(comp, message);
  }
}

export function addComponentTo(
  node: HTMLElement,
  component: BaseComponent,
  noBroadcast = false
) {
  if (component.destoryed) {
    throw new Error(
      `[${
        component.constructor.name
      }]:一个被销毁的 Component 不能再被添加到 DOM 中`
    );
  }
  if (component.mounted) {
    return;
  }
  node.appendChild(component.element);
  if (!noBroadcast) {
    broadcast(component, MESSAGE.INIT);
  }
}

export function render(node: HTMLElement, component: BaseComponent) {
  addComponentTo(node, component);
}

export function removeComponent(component: BaseComponent, noBroadcast = false) {
  const element = component.element;
  const parent = element.parentElement;
  if (!component.mounted || !parent) {
    return;
  }
  if (!noBroadcast) {
    broadcast(component, MESSAGE.REMOVE);
  }
  parent.removeChild(element);
}

export function destoryComponent(component: BaseComponent) {
  broadcast(component, MESSAGE.DESTORY);
  removeComponent(component, true);
  component.removeAllListeners();
}

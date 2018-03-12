export function addClass(element: HTMLElement, ...classNames: string[]) {
  for (const className of classNames) {
    element.classList.add(className);
  }
}

export function removeClass(element: HTMLElement, ...classNames: string[]) {
  for (const className of classNames) {
    element.classList.remove(className);
  }
}

export interface ElementAttrs {
  className?: string;
  text?: string;
  children?: Array<string | HTMLElement>;
  tag?: string;
}

export function ele(attrs?: ElementAttrs) {
  const element = document.createElement((attrs && attrs.tag) || 'div');
  if (attrs) {
    if (attrs.className) {
      element.className = attrs.className;
    }
    if (attrs.text) {
      element.innerText = attrs.text;
    }
    if (attrs.children) {
      for (const child of attrs.children) {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      }
    }
  }
  return element;
}

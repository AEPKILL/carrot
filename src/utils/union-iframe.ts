function loadIframeCSS(iframe: HTMLIFrameElement, src: string) {
  const head = iframe.contentDocument.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = src;
  head.appendChild(link);
}

let sharedCSS!: string[];

function createDownloadIframe() {
  // tslint:disable-next-line:no-bitwise
  const iframeId = `a${((Math.random() * 0xfffffff) >> 0).toString(16)}`;
  const iframe = document.createElement('iframe');
  const iframMask = document.createElement('div');
  const iframeStyle = document.createElement('style');
  iframe.id = iframeId;
  iframMask.id = `${iframeId}c`;
  iframe.addEventListener('load', () => {
    try {
      iframe.contentDocument.write(
        '<html class="carrot-modal-iframe"><head></head><body class="carrot-modal-iframe"></body></html>'
      );
    } catch {
      // nothing to do
    }
  });
  return {
    append() {
      document.body.appendChild(iframe);
      document.body.appendChild(iframMask);
      document.head.appendChild(iframeStyle);
      this.setIframeInnerStyle(sharedCSS);
    },
    hide() {
      if (iframe.parentElement) {
        iframe.parentElement.removeChild(iframe);
      }
      if (iframeStyle.parentElement) {
        iframeStyle.parentElement.removeChild(iframeStyle);
      }
      if (iframMask.parentElement) {
        iframMask.parentElement.removeChild(iframMask);
      }
    },
    changeIframeStyle(css: string) {
      iframeStyle.textContent = css;
    },
    setIframeInnerStyle(cssUrls: string[]) {
      function loadStyle() {
        const links = iframe.contentDocument.getElementsByTagName('link');
        for (const cssUrl of cssUrls) {
          if (
            Array.from(links).filter(link => link.href == cssUrl).length == 0
          ) {
            loadIframeCSS(iframe, cssUrl);
          }
        }
        iframe.removeEventListener('load', loadStyle);
      }
      if (iframe.contentWindow && iframe.contentWindow.window) {
        loadStyle();
      } else {
        iframe.addEventListener('load', loadStyle);
      }
    },
    get ifream() {
      return iframe;
    },
    get id() {
      return iframeId;
    }
  };
}

let unionIfram!: UnionIfram;

export interface UnionIfram {
  readonly ifream: HTMLIFrameElement;
  readonly id: string;
  append(): void;
  hide(): void;
  changeIframeStyle(css: string): void;
  setIframeInnerStyle(cssUrls: string[]): void;
}

export function getUnionIframe() {
  if (!unionIfram) {
    unionIfram = createDownloadIframe();
  }
  return unionIfram;
}

export function init(css: string[]) {
  sharedCSS = css;
}

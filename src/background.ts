import { RuntimeMessage } from './utils/runtime-message';
const DOWNLOAD_MENU_ID = 'CARROT_DOWNLOAD_MENU';

chrome.contextMenus.create({
  title: '下载到百度网盘',
  id: DOWNLOAD_MENU_ID,
  contexts: ['selection', 'link', 'editable', 'image', 'video', 'audio'],
  documentUrlPatterns: ['http://*/*', 'https://*/*'],
  onclick(info, tab) {
    const srcs = [info.selectionText, info.srcUrl, info.linkUrl];
    let src: string | undefined;
    for (src of srcs) {
      if (src) {
        src = src.trim();
        break;
      }
    }
    chrome.tabs.sendMessage(
      tab.id!,
      new RuntimeMessage<string>('download', src!, {
        shareCSS: [
          chrome.extension.getURL('styles/popup.css'),
          chrome.extension.getURL('assets/styles/prefect-scroll.css')
        ]
      })
    );
  }
});

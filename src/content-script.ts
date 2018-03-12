import { DownloadBox } from './components/download-box';
import message from './utils/message';
import { RuntimeMessage } from './utils/runtime-message';
import { init } from './utils/union-iframe';
import { isSupportDownloadLink } from './validator';

const downloadBox = new DownloadBox();

function showDownloadBox(url: string) {
  downloadBox.onDownloadMessage(url);
}

chrome.runtime.onMessage.addListener((msg: RuntimeMessage<string>) => {
  if (msg.type === 'download') {
    init(msg.options.shareCSS);
    if (isSupportDownloadLink(msg.data)) {
      showDownloadBox(msg.data);
    } else {
      message.info('不支持的下载链接');
    }
  }
});

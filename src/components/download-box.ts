// import { USER_STATUS } from '../services/user';
import FileManager from '../services/file-manager';
import OffineDownload, {
  OFFINE_DOWNLOAD_STATUS
} from '../services/offine-download';
import user from '../services/user';
import { addComponentTo, removeComponent } from '../utils/component';
import { ele } from '../utils/dom';
import message from '../utils/message';
import { getUnionIframe, UnionIfram } from '../utils/union-iframe';
import { getVcode, VCodeContent } from '../utils/vcode';
import BaseComponent from './base-component';
import FileList from './file-list';

export class DownloadBox extends BaseComponent {
  private $url = ele({
    tag: 'a',
    className: 'carrot-download-box__url'
  }) as HTMLAnchorElement;
  private downloadModal!: UnionIfram;
  private fileList = new FileList(true);
  private url!: string;
  private $cancelButton = ele({
    className: 'carrot-modal__button cancel',
    children: ['取消']
  });
  private $okButton = ele({
    className: 'carrot-modal__button ok',
    children: ['确定']
  });
  constructor() {
    super({ className: 'carrot-modal download' });
    this.$cancelButton.addEventListener('click', this.onClickCancel.bind(this));
    this.$okButton.addEventListener('click', this.onClickOk.bind(this));
    this.Init();
  }
  async Init() {
    const userInfo = await user.getUser();
    if (userInfo) {
      this.addChildren(
        ele({
          className: 'carrot-modal__header',
          children: ['保存(', this.$url, ')到:']
        })
      );
      this.addComponent(this.fileList);
      this.addChildren(
        ele({
          className: 'carrot-modal__footer',
          children: [this.$cancelButton, this.$okButton]
        })
      );
    } else {
      const noLogin = ele({
        className: 'no-login',
        children: [ele({ tag: 'span', children: ['未登陆百度网盘，点击登陆'] })]
      });
      noLogin.addEventListener('click', () => {
        user.gotoLogin();
        this.hide();
      });
      this.addChildren(noLogin);
    }
  }
  async addDownloadTask(vocde?: VCodeContent) {
    const path = this.fileList.path;
    const taskCreateInfo = await OffineDownload.createOffineDownload(
      this.url,
      path,
      vocde
    );
    // 需要验证码
    if (taskCreateInfo.status === OFFINE_DOWNLOAD_STATUS.NEED_VCODE) {
      const vcodeContent = await getVcode(taskCreateInfo);
      await this.addDownloadTask(vcodeContent);
    }
  }
  async onClickOk() {
    this.hide();
    try {
      await this.addDownloadTask();
      message.info('离线任务添加成功');
    } catch (e) {
      message.info(e.message);
    }
  }
  onClickCancel() {
    this.hide();
    message.info('你取消了下载');
  }
  onDownloadMessage(url: string) {
    const originUrl = url;
    if (url.length > 120) {
      const len = url.length;
      url = url.substr(0, 120);
      if (len > url.length) {
        url = `${url}...`;
      }
    }
    if (!this.downloadModal) {
      this.downloadModal = getUnionIframe();
    }
    if (!this.downloadModal.ifream.parentElement) {
      this.downloadModal.append();
    }
    this.downloadModal.changeIframeStyle(`
      #${this.downloadModal.id} {
        position: fixed;
        height: 800px;
        width: 560px;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        z-index: 2147483647;
        border: none;
      }
      #${this.downloadModal.id}c {
        position: fixed;
        left: 0px;
        top: 0px;
        z-index: 50;
        background: rgb(0, 0, 0);
        opacity: 0.5;
        width: 100%;
        height: 100%;
        display: block;
        z-index: 2147483;
      }
    `);
    this.url = originUrl;
    this.$url.href = originUrl;
    this.$url.innerText = url;
    addComponentTo(this.downloadModal.ifream.contentWindow.document.body, this);
    if (this.fileList.mounted) {
      this.fileList.clearCache();
      this.fileList.changePath(FileManager.ROOT_PATH);
    }
  }
  hide() {
    removeComponent(this);
    this.downloadModal.hide();
  }
}

export default DownloadBox;

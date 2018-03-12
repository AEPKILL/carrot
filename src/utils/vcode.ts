import { deferred } from 'deferred-factory';
import BaseComponent from '../components/base-component';
import {
  OFFINE_DOWNLOAD_STATUS,
  TaskCreateInfo
} from '../services/offine-download';
import { addComponentTo, removeComponent } from './component';
import { ele } from './dom';
import { getUnionIframe, UnionIfram } from './union-iframe';

export interface VCodeContent {
  input: string;
  vcode: string;
}

let vcodeModal: UnionIfram;

class VCode extends BaseComponent {
  $img = ele({
    tag: 'img',
    className: 'carrot-vcode__img'
  }) as HTMLImageElement;
  private $input = ele({
    tag: 'input',
    className: 'carrot-input-vcode'
  }) as HTMLInputElement;
  // private $change = ele({
  //   tag: 'span',
  //   className: 'carrot-vcode__change',
  //   children: ['换一张']
  // });
  private $cancelButton = ele({
    className: 'carrot-modal__button cancel',
    children: ['取消']
  });
  private $okButton = ele({
    className: 'carrot-modal__button ok',
    children: ['确定']
  });
  constructor() {
    super({ className: 'carrot-modal vcode' });
    this.addChildren(
      ele({
        className: 'carrot-modal__header',
        children: ['请输入验证码:']
      }),
      ele({
        className: 'carrot-vcode',
        children: [this.$input, this.$img]
      }),
      ele({
        className: 'carrot-modal__footer',
        children: [this.$cancelButton, this.$okButton]
      })
    );
    this.$cancelButton.addEventListener('click', this.onClickCancel.bind(this));
    this.$okButton.addEventListener('click', this.onClickOk.bind(this));
  }
  onAppend() {
    this.$input.value = '';
  }
  onClickOk() {
    const value = this.$input.value;
    if (value) {
      this.emit(VCode.OK, value);
      this.hide();
    }
  }
  onClickCancel() {
    this.emit(VCode.CANCEL);
    this.hide();
  }
  hide() {
    removeComponent(this);
    vcodeModal.hide();
  }
  static CANCEL = 'CANCEL';
  static OK = 'OK';
}

const vcode = new VCode();

export async function getVcode(
  taskInfo: TaskCreateInfo
): Promise<VCodeContent> {
  const defer = deferred<VCodeContent>();
  vcode.removeAllListeners();
  if (taskInfo.status != OFFINE_DOWNLOAD_STATUS.NEED_VCODE || !taskInfo.data) {
    throw new Error('不需要输入验证码');
  }
  if (!vcodeModal) {
    vcodeModal = getUnionIframe();
  }
  vcodeModal.changeIframeStyle(`
    #${vcodeModal.id} {
      position: fixed;
      height: 800px;
      width: 560px;
      left: 50%;
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      z-index: 2147483647;
      border: none;
    }
    #${vcodeModal.id}c {
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
  if (!vcodeModal.ifream.parentElement) {
    vcodeModal.append();
  }
  vcode.$img.src = taskInfo.data!.img;
  addComponentTo(vcodeModal.ifream.contentDocument.body, vcode);
  vcode.addListener(VCode.OK, (value: string) =>
    defer.resolve({
      vcode: taskInfo.data!.vcode,
      input: value
    })
  );
  vcode.addListener(VCode.CANCEL, () => defer.reject(new Error('取消验证码输入')));
  return defer.promise;
}

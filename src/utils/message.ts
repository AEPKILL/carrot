import AsyncQueue from './async-queue';
import { addClass, ele, removeClass } from './dom';

// tslint:disable-next-line:no-bitwise
const classPrefix = `ms${((Math.random() * 0xfffffff) >> 0).toString(16)}`;
const style = document.createElement('style');
class Message {
  private $text!: HTMLElement;
  private $body!: HTMLElement | null;
  private messageQueue: string[] = [];
  private asyncQueue = new AsyncQueue();

  info(message: string) {
    // 仅保留最后进入队列的 2 个消息
    if (this.messageQueue.length >= 2) {
      this.messageQueue.shift();
    }
    this.messageQueue.push(message);
    if (this.asyncQueue.runing) {
      return;
    }
    this.doShowMessage();
  }
  private destory() {
    if (this.$body) {
      document.body.removeChild(this.$body);
      this.$body = null;
    }
  }
  private createNode() {
    this.$text = ele({ className: classPrefix });
    this.$body = ele({
      className: `${classPrefix}-wrap`,
      children: [this.$text]
    });
    document.body.appendChild(this.$body);
  }
  private doShowMessage() {
    let message: string | undefined;

    // 取一条有内容的消息
    while (this.messageQueue.length && !(message && message.length)) {
      message = this.messageQueue.shift();
      message = message && message.trim();
    }

    // 没有有内容的消息直接返回
    if (!message) {
      return;
    }

    if (!this.$body) {
      this.createNode();
    }

    this.$text.innerText = message;
    this.asyncQueue
      .do(() => {
        addClass(this.$body!, 'before-active');
      })
      .wait(100)
      .do(() => {
        removeClass(this.$body!, 'before-active');
        addClass(this.$body!, 'active');
      })
      .wait(1200)
      .do(() => {
        removeClass(this.$body!, 'active');
        addClass(this.$body!, 'after-active');
      })
      .wait(500)
      .do(() => {
        removeClass(this.$body!, 'after-active');
        if (this.messageQueue.length) {
          this.doShowMessage();
        } else {
          this.destory();
          document.head.removeChild(style);
        }
      });

    if (!this.asyncQueue.runing) {
      document.head.appendChild(style);
      this.asyncQueue.start();
    }
  }
}

export default new Message();

// message 较为特殊，需要动态创建 style
const cssText = `
  .${classPrefix}-wrap {
    position: fixed;
    top: 50px;
    font-family: 'Microsoft YaHei', SimSun;
    -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    left: 50%;
    -webkit-transform: translateX(-50%);
        -ms-transform: translateX(-50%);
            transform: translateX(-50%);
    background: #4c93ff;
    border-radius: 4px;
    color: #fff;
    padding: 0 15px;
    height: 40px;
    line-height: 40px;
    -webkit-transition: all 0.5s;
    -o-transition: all 0.5s;
    transition: all 0.5s;
    display: none;
  }

  .after-active.${classPrefix}-wrap,
  .before-active.${classPrefix}-wrap {
    display: block;
    top: 100px;
    opacity: 0;
  }

  .active.${classPrefix}-wrap {
    display: block;
    opacity: 1;
  }

  .${classPrefix} {
    -o-text-overflow: ellipsis;
       text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 250px;
    overflow: hidden;
  }
`;

style.textContent = cssText;

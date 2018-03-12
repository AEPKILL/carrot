import user, { USER_STATUS } from '../services/user';
import { ele } from '../utils/dom';
import BaseComponent from './base-component';
import FileList from './file-list';
import OfflineDownload from './offline-download';
import Tabs from './tabs';

export default class App extends BaseComponent {
  private tabs: Tabs = new Tabs([
    {
      name: '文件列表',
      body: new FileList()
    },
    {
      name: '离线下载',
      body: new OfflineDownload()
    }
  ]);
  private $noLogin = ele({
    className: 'no-login',
    children: [ele({ tag: 'span', children: ['未登陆百度网盘，点击登陆'] })]
  });
  constructor() {
    super({ className: 'app-container' });
    this.$noLogin.addEventListener('click', this.onClickLogin.bind(this));
    user.addListener(
      user.USER_LOGIN_STATUS_CHANGE,
      this.onUserStatusChange.bind(this)
    );
  }
  async onAppend() {
    const userInfo = await user.getUser();
    if (userInfo) {
      this.addComponent(this.tabs);
    } else {
      this.addChildren(this.$noLogin);
    }
  }
  onUserStatusChange(status: USER_STATUS) {
    if (status === USER_STATUS.NO_LOGIN) {
      this.removeComponent(this.tabs);
      this.addChildren(this.$noLogin);
    } else {
      this.removeChildren(this.$noLogin);
      this.addComponent(this.tabs);
    }
  }
  onClickLogin() {
    user.gotoLogin();
  }
}

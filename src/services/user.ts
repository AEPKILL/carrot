import Events from 'events';
import BaiduUser from '../model/baidu-user';
export enum USER_STATUS {
  LOGIN,
  NO_LOGIN
}

export class User extends Events {
  USER_LOGIN_STATUS_CHANGE = 'USER_LOGIN_STATUS_CHANGE';
  private user: BaiduUser | null = null;
  private userStatus = USER_STATUS.LOGIN;
  async getUser() {
    if (this.user) {
      return this.user;
    }
    const html = await fetch('https://pan.baidu.com/disk/home', {
      credentials: 'include'
    }).then(response => response.text());
    const matchs = html.match(/var context=([\w\W]+?);\n/m);
    if (matchs && matchs[1]) {
      this.user = JSON.parse(matchs[1]);
      if (this.user) {
        this.user.sign5 = this.user.sign3;
        this.user.sign3 =
          this.user.sign3 &&
          this.user.sign3
            .replace('1', 'l')
            .replace('0', 'o')
            .replace('e', 'a');
        this.user.sign4 = this.user.sign3;
      }
    }
    return this.user;
  }
  broadcastUserStatus(status: USER_STATUS) {
    if (this.userStatus !== status) {
      this.emit(this.USER_LOGIN_STATUS_CHANGE, status);
      this.userStatus = status;
    }
  }
  gotoLogin() {
    window.open('https://pan.baidu.com/');
  }
}

export default new User();

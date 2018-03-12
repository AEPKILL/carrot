import { deferred } from 'deferred-factory';
import BaiduFile from '../model/baidu-file';
import BaiduUser from '../model/baidu-user';
import Dictionary from '../model/dictionary';
import { ResultList } from '../model/result';
import { noInArray } from '../utils/common';
import requestJSON from '../utils/request';
import user from './user';

// tslint:disable-next-line:no-var-requires
const fileClassMap: Dictionary<string[]> = require('./file-type-map.json');
const fileClassNames = Object.keys(fileClassMap);
export enum DOWNLOAD_URL_RESULT_CODE {
  SUCCESS = 0,
  V_CODE,
  OTHER
}

export interface DownloadUrlResult {
  code: DOWNLOAD_URL_RESULT_CODE;
  url?: string;
  message: string;
}

export class FileManager {
  static readonly ROOT_PATH = '/';
  static async deletePath(file: BaiduFile) {
    const body = new FormData();
    body.append('filelist', JSON.stringify([file.path]));
    const result = await requestJSON(
      'https://pan.baidu.com/api/filemanager?opera=delete',
      {
        body,
        method: 'POST'
      }
    );
    if (result.errno !== 0) {
      throw new Error(FileManager.formatMessageError(result.errno));
    }
    return result;
  }
  static async readDir(dir: string, page = 1) {
    return requestJSON<ResultList<BaiduFile>>(
      'https://pan.baidu.com/api/list',
      {
        params: {
          dir,
          page,
          order: 'time',
          showempty: 0,
          num: 100,
          desc: 1
        }
      }
    );
  }
  static async getDirDownloadUrl(file: BaiduFile): Promise<DownloadUrlResult> {
    const sign = await FileManager.getSignCode();
    const userInfo = (await user.getUser()) as BaiduUser;
    const result = await requestJSON<{ dlink: string }>(
      'https://pan.baidu.com/api/download',
      {
        method: 'POST',
        params: {
          sign,
          timestamp: userInfo.timestamp,
          fidlist: JSON.stringify([file.fs_id]),
          type: 'batch',
          encrypt: 0
        }
      }
    );
    if (result.errno !== 0) {
      throw new Error(FileManager.formatMessageError(result.errno));
    }
    return {
      url: result.dlink,
      code: result.errno,
      message: FileManager.formatMessageError(result.errno)
    };
  }
  static async getFileDownloadUrl(file: BaiduFile): Promise<DownloadUrlResult> {
    const body = new FormData();
    const sign = await FileManager.getSignCode();
    const userInfo = (await user.getUser()) as BaiduUser;
    body.append('fidlist', JSON.stringify([file.fs_id]));
    const result = await requestJSON<{ dlink: Array<{ dlink: string }> }>(
      'https://pan.baidu.com/api/download',
      {
        body,
        method: 'POST',
        params: {
          sign,
          timestamp: userInfo.timestamp
        }
      }
    );
    if (result.errno !== 0) {
      throw new Error(FileManager.formatMessageError(result.errno));
    }
    const links = result.dlink;
    const url = links[0] && links[0].dlink;
    return {
      url,
      code: result.errno,
      message: FileManager.formatMessageError(result.errno)
    };
  }
  static async getSignCode(): Promise<string> {
    // 百度网盘的 sign code 需要动态计算，其计算过程需要 new Function 或者是使用 eval，使用沙箱来完成
    const userInfo = await user.getUser();
    const defer = deferred<string>();
    if (!userInfo) {
      throw new Error('获取用户信息失败');
    }
    const iframe = document.getElementById('sandbox') as HTMLIFrameElement;
    // 提交待解码的数据到沙箱
    iframe!.contentWindow.postMessage(
      {
        command: 'encode_sign',
        data: userInfo
      },
      '*'
    );
    // 沙箱返回数据
    function message_callback(e: Event) {
      const event = e as MessageEvent;
      defer.resolve(event.data.bdstoken);
      removeEventListener('message', message_callback);
    }
    addEventListener('message', message_callback);
    return defer.promise;
  }
  static getFileClass(path: string): string {
    const matchs = path.match(/\.([^\.]+)$/);
    const type = matchs && matchs[1];
    for (const className of fileClassNames) {
      const types = fileClassMap[className];
      if (types && !noInArray(types, type)) {
        return className;
      }
    }
    return 'default';
  }
  static getFileOrDirName(path: string) {
    const paths = path.split('/');
    return paths[paths.length - 1];
  }
  static formatMessageError(errno: number) {
    let err_msg = '';
    switch (errno) {
      case 2:
        err_msg = '获取下载信息失败，请稍候重试';
        break;
      case -1:
        err_msg = '内容中包含违规信息无法下载';
        break;
      case 118:
        err_msg = '没有下载权限';
        break;
      case 113:
      case 112:
        err_msg = '页面已过期，请刷新后重试';
        break;
      case 121:
        err_msg = '包含文件过多无法获取下载地址';
        break;
      case 132:
        err_msg = '该操作需要验证你的身份，请去网页端完成';
        break;
    }
    return err_msg;
  }
}

export default FileManager;

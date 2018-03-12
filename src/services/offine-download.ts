import { MagnetInfo, TaskInfo } from '../model/offine-download';
import requestJSON from '../utils/request';
import { VCodeContent } from '../utils/vcode';

function isMagnetLink(url: string) {
  return url.indexOf('magnet:?xt=') == 0;
}

export enum OFFINE_DOWNLOAD_STATUS {
  SUCCESS,
  ERROR,
  NEED_VCODE
}

export interface TaskCreateInfo {
  status: OFFINE_DOWNLOAD_STATUS;
  data?: {
    img: string;
    vcode: string;
  };
}

export class OffineDownload {
  static async getOffineTaks(page: number, limit: number) {
    console.log(page, limit);
  }
  static async createMagnetLinkOffineDownload(
    url: string,
    path: string,
    vcode?: VCodeContent
  ) {
    const magnetinfo = await requestJSON<MagnetInfo>(
      'https://pan.baidu.com/rest/2.0/services/cloud_dl',
      {
        method: 'POST',
        params: {
          method: 'query_magnetinfo',
          save_path: path,
          type: 4,
          source_url: url,
          app_id: 250528
        }
      }
    );
    if (!magnetinfo.magnet_info && magnetinfo.error_msg) {
      throw new Error(
        OffineDownload.formatErorMsg(magnetinfo.error_code) ||
          magnetinfo.error_msg
      );
    }
    if (magnetinfo.magnet_info && magnetinfo.total) {
      const postData = new FormData();
      if (vcode) {
        postData.append('input', vcode.input);
        postData.append('vcode', vcode.vcode);
      }
      postData.append('source_url', url);
      postData.append('save_path', path);
      postData.append(
        'selected_idx',
        magnetinfo.magnet_info.map((_value, index) => index).join(',')
      );
      const taskInfo = await requestJSON<TaskInfo>(
        'https://pan.baidu.com/rest/2.0/services/cloud_dl',
        {
          method: 'POST',
          params: {
            method: 'add_task',
            type: 4,
            app_id: 250528
          },
          body: postData
        }
      );
      if (taskInfo.vcode && taskInfo.img) {
        return {
          status: OFFINE_DOWNLOAD_STATUS.NEED_VCODE,
          data: {
            vcode: taskInfo.vcode,
            img: taskInfo.img
          }
        };
      }
      if (taskInfo.error_code && taskInfo.error_msg) {
        throw new Error(taskInfo.error_msg);
      }
      return {
        status: OFFINE_DOWNLOAD_STATUS.SUCCESS
      };
    }
    throw new Error('未知错误');
  }
  static async createNormalLinkOffineDownload(
    url: string,
    path: string,
    vcode?: VCodeContent
  ): Promise<TaskCreateInfo> {
    const postData = new FormData();
    if (vcode) {
      postData.append('input', vcode.input);
      postData.append('vcode', vcode.vcode);
    }
    postData.append('source_url', url);
    postData.append('save_path', path);
    const taskInfo = await requestJSON<TaskInfo>(
      'https://pan.baidu.com/rest/2.0/services/cloud_dl',
      {
        method: 'POST',
        params: {
          method: 'add_task',
          app_id: 250528,
          web: 1
        },
        body: postData
      }
    );
    if (taskInfo.vcode && taskInfo.img) {
      return {
        status: OFFINE_DOWNLOAD_STATUS.NEED_VCODE,
        data: {
          vcode: taskInfo.vcode,
          img: taskInfo.img
        }
      };
    }
    if (taskInfo.error_code && taskInfo.error_msg) {
      throw new Error(taskInfo.error_msg);
    }
    return {
      status: OFFINE_DOWNLOAD_STATUS.SUCCESS
    };
  }
  static async createOffineDownload(
    url: string,
    path: string,
    vcode?: VCodeContent
  ) {
    if (isMagnetLink(url)) {
      const result = await OffineDownload.createMagnetLinkOffineDownload(
        url,
        path,
        vcode
      );
      return result;
    } else {
      const result = await OffineDownload.createNormalLinkOffineDownload(
        url,
        path,
        vcode
      );
      return result;
    }
  }
  static formatErorMsg(code: number) {
    let msg = '';
    switch (code) {
      case 36028: {
        msg = '暂时无法找到相关种子信息';
        break;
      }
    }
    return msg;
  }
}

export default OffineDownload;

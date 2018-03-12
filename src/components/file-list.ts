import BaiduFile from '../model/baidu-file';
import { List, Result } from '../model/result';
import { Download } from '../services/download';
import {
  DOWNLOAD_URL_RESULT_CODE,
  FileManager
} from '../services/file-manager';
import copyText from '../utils/copy-text';
import message from '../utils/message';
import BaseComponent from './base-component';
import FileLine from './file-line';
import ListView from './list-view';
import Loading from './loading';
import Path from './path';
export default class FileList extends BaseComponent {
  private _path!: string;
  private resultData!: Result<List<BaiduFile>>;
  private page = 1;
  private noMore = false;
  private fileListComponent = new ListView(FileLine);
  private cache = new Map<string, BaiduFile[]>();
  private loadingComponent = new Loading();
  private pathComponent = new Path();
  private _fetching = false;
  get path() {
    return this._path || FileManager.ROOT_PATH;
  }
  constructor(private _onlyShowFloder = false) {
    super({ className: 'file-list' });
    this.addComponent(this.loadingComponent);
    this.addComponent(this.pathComponent);
    this.addComponent(this.fileListComponent);

    // 文件路径改变 [返回 | 全部文件]
    this.pathComponent.on(Path.PATH_CHANGE, this.changePath.bind(this));

    // 滚动到底部
    this.fileListComponent.on(
      ListView.SCROLL_BOTTOM,
      this.onScrollBottom.bind(this)
    );

    this.fileListComponent.on(
      FileLine.CLICK_FILE_NAME,
      this.onClickFilename.bind(this)
    );

    this.fileListComponent.on(
      FileLine.CLICK_FILE_COPY,
      this.onClickCopy.bind(this)
    );
    this.fileListComponent.on(
      FileLine.CLICK_FILE_DOWNLOAD,
      this.onClickDownload.bind(this)
    );
    this.fileListComponent.on(
      FileLine.CLICK_FILE_DELETE,
      this.onClickDelete.bind(this)
    );
  }
  clearCache() {
    this.cache = new Map();
    this._path = '';
    this.page = 1;
    this.noMore = false;
    this.fileListComponent.set([]);
  }
  async changePath(path: string, page = 1, useCache = true) {
    let list!: BaiduFile[];
    if (this._fetching) {
      return;
    }
    if (path == this._path && this.page >= page) {
      return;
    }

    this.noMore = false;
    this._fetching = true;

    // 缓存每个路径的第一页 方便快速返回
    if (useCache && page == 1) {
      list = this.cache.get(path)!;
    }

    // 未命中缓存则发起网络请求
    if (!list) {
      this.loadingComponent.show();
      try {
        this.resultData = await FileManager.readDir(path, page);
      } catch {
        message.info(`网络似乎出了一点问题`);
        return;
      } finally {
        this.loadingComponent.hide();
      }
      list = this.resultData.list!;
      if (this._onlyShowFloder) {
        list = list.filter(file => file.isdir);
      }
      if (list && list.length && page == 1) {
        this.cache.set(path, list);
      }
    }

    this._fetching = false;

    // 请求结果不正确
    if (this.resultData.errno !== 0) {
      message.info(`出现了一个未知的错误`);
      return;
    }

    if (this._path == path) {
      this.fileListComponent.add(list);
    } else {
      this.fileListComponent.set(list);
    }

    // 小于100个子项说明这个目录没有更多文件了
    if (list.length < 100) {
      this.noMore = true;
    }

    // 跟新路径&页码
    this.pathComponent.update(path);
    this._path = path;
    this.page = page;
  }

  onClickFilename(file: BaiduFile) {
    if (file.isdir) {
      this.changePath(file.path, 1, false);
    }
  }
  async onClickDownload(file: BaiduFile) {
    this.loadingComponent.show();
    try {
      const result = file.isdir
        ? await FileManager.getDirDownloadUrl(file)
        : await FileManager.getFileDownloadUrl(file);
      if (result.code !== DOWNLOAD_URL_RESULT_CODE.SUCCESS) {
        message.info(result.message);
        return;
      }
      await Download.createDownload(result.url!);
    } catch (e) {
      message.info(e.message);
    } finally {
      this.loadingComponent.hide();
    }
  }
  async onClickCopy(file: BaiduFile) {
    this.loadingComponent.show();
    try {
      const result = file.isdir
        ? await FileManager.getDirDownloadUrl(file)
        : await FileManager.getFileDownloadUrl(file);
      if (result.code !== DOWNLOAD_URL_RESULT_CODE.SUCCESS) {
        message.info(result.message);
        return;
      }
      const copy = await copyText(result.url!);
      if (copy) {
        message.info('下载链接复制成功');
      } else {
        message.info('复制失败');
      }
    } catch (e) {
      message.info(e.message);
    } finally {
      this.loadingComponent.hide();
    }
  }
  async onClickDelete(file: BaiduFile, index: number) {
    this.loadingComponent.show();
    try {
      await FileManager.deletePath(file);
      this.cache.delete(this._path);
      this.fileListComponent.remove(index);
    } catch (e) {
      message.info(e.message);
    } finally {
      this.loadingComponent.hide();
    }
  }
  onScrollBottom() {
    if (!this.noMore) {
      this.changePath(this._path, this.page + 1);
    }
  }
  onAppend() {
    this.changePath(this._path || FileManager.ROOT_PATH, this.page);
  }
}

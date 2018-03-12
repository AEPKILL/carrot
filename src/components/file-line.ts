import BaiduFile from '../model/baidu-file';
import { FileManager } from '../services/file-manager';
import { addClass, ele } from '../utils/dom';
import BaseComponent from './base-component';
import Container from './container';
import { ListItem } from './list-view';

export default class FileLine extends BaseComponent
  implements ListItem<BaiduFile> {
  private $down = ele({
    className: 'file-line__button icon iconfont icon-download'
  });
  private $copy = ele({
    className: 'file-line__button icon iconfont icon-file'
  });
  private $delete = ele({
    className: 'file-line__button icon iconfont icon-delete'
  });
  private $icon = ele();
  private $filename = ele({ className: 'file-line__name' });
  private index!: number;

  private file!: BaiduFile;
  constructor() {
    super();
    const buttonContainer = new Container('button');

    addClass(this.element, 'file-line');

    buttonContainer.addChildren(this.$down, this.$copy, this.$delete);

    this.$down.addEventListener('click', this.onClickDownload.bind(this));
    this.$copy.addEventListener('click', this.onClickCopy.bind(this));
    this.$delete.addEventListener('click', this.onClickDelete.bind(this));
    this.$filename.addEventListener('click', this.onClickFileName.bind(this));

    this.$down.title = '下载';
    this.$copy.title = '复制下载链接';
    this.$delete.title = '删除';

    this.addChildren(this.$icon, this.$filename);
    this.addComponent(buttonContainer);
  }

  update(file: BaiduFile, index = 0) {
    const filename =
      file.server_filename || FileManager.getFileOrDirName(file.path);
    const className = file.isdir
      ? 'folder'
      : FileManager.getFileClass(file.path);
    this.$icon.className = `file-line__icon file-icon`;
    this.file = file;
    this.$filename.innerText = filename;
    this.$filename.title = filename;
    this.index = index;
    addClass(this.$icon, className);
  }
  private onClickFileName() {
    this.parent!.emit(FileLine.CLICK_FILE_NAME, this.file, this.index);
  }
  private onClickDownload() {
    this.parent!.emit(FileLine.CLICK_FILE_DOWNLOAD, this.file, this.index);
  }
  private onClickCopy() {
    this.parent!.emit(FileLine.CLICK_FILE_COPY, this.file, this.index);
  }
  private onClickDelete() {
    this.parent!.emit(FileLine.CLICK_FILE_DELETE, this.file, this.index);
  }
  static CLICK_FILE_NAME = 'CLICK_FILE_NAME';
  static CLICK_FILE_DOWNLOAD = 'CLICK_FILE_DOWNLOAD';
  static CLICK_FILE_COPY = 'CLICK_FILE_COPY';
  static CLICK_FILE_DELETE = 'CLICK_FILE_DELETE';
}

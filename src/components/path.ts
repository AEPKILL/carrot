import { FileManager } from '../services/file-manager';
import { ele } from '../utils/dom';
import BaseComponent from './base-component';

export default class Path extends BaseComponent {
  private $allFileLink = ele({
    tag: 'span',
    className: 'path-all-file link',
    children: ['全部文件']
  });

  private $backLink = ele({
    tag: 'span',
    className: 'path-back link',
    children: ['返回上级']
  });

  private $allFileText = ele({ children: ['全部文件'] });

  private $pathHeader = ele({
    className: 'path-header',
    children: [
      this.$allFileLink,
      ele({ tag: 'span', className: 'gap', children: ['|'] }),
      this.$backLink
    ]
  });

  private paths: string[] = [];

  constructor() {
    super({ className: 'file-path' });

    this.$allFileLink.addEventListener(
      'click',
      this.onClicBackAllFile.bind(this)
    );
    this.$backLink.addEventListener('click', this.onClickBack.bind(this));
    this.element.appendChild(this.$allFileText);
  }

  update(path: string) {
    if (path === FileManager.ROOT_PATH) {
      this.addChildren(this.$allFileText);
      this.removeChildren(this.$pathHeader);
    } else {
      this.removeChildren(this.$allFileText);
      this.addChildren(this.$pathHeader);
    }
    this.paths = path.split('/');
  }

  private onClicBackAllFile() {
    this.emit(Path.PATH_CHANGE, FileManager.ROOT_PATH);
  }

  private onClickBack() {
    const path =
      this.paths.slice(0, this.paths.length - 1).join('/') ||
      FileManager.ROOT_PATH;
    this.emit(Path.PATH_CHANGE, path);
  }

  static PATH_CHANGE = 'PATH_CHANGE';
}

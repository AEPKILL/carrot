import { ele } from '../utils/dom';
import BaseComponent from './base-component';

export default class OfflineDownload extends BaseComponent {
  // private downloadList = new ListView(DownloadLine);
  constructor() {
    super();
    this.element.appendChild(
      ele({
        className: 'todo',
        children: ['懒，这个功能没写']
      })
    );
  }
  onAppend() {
    // todo
  }
  onRemove() {
    // todo
  }
}

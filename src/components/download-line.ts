import BaseComponent from './base-component';
import { ListItem } from './list-view';
export class DownloadLine extends BaseComponent implements ListItem<{}> {
  update(data: {}) {
    console.log(data);
  }
}

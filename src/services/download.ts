import { deferred } from 'deferred-factory';

export class Download {
  static async createDownload(url: string) {
    const defer = deferred();
    chrome.downloads.download(
      {
        url,
        conflictAction: 'uniquify',
        saveAs: true
      },
      downloadId => {
        if (downloadId) {
          defer.resolve();
        } else {
          defer.reject();
        }
      }
    );
    return defer.promise;
  }
}

export default Download;

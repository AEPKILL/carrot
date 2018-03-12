import Clipboard from 'clipboard';
import { deferred } from 'deferred-factory';
import { ele } from './dom';

export default async function copyText(text: string) {
  const element = ele();
  const defer = deferred<boolean>();
  document.body.appendChild(element);
  const clipboard = new Clipboard(element, {
    text() {
      return text;
    }
  });
  clipboard.on('success', () => {
    defer.resolve(true);
  });
  clipboard.on('error', () => {
    defer.resolve(false);
  });
  element.click();
  element.parentElement!.removeChild(element);
  return defer.promise;
}

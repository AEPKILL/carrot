import BaiduUser from './model/baidu-user';
import base64 from './utils/base64';

interface EventData {
  command: string;
  data: BaiduUser;
}

window.addEventListener('message', e => {
  const event = e as MessageEvent;
  const { data, command } = event.data as EventData;
  switch (command) {
    case 'encode_sign': {
      const encodeToden = new Function('return ' + data.sign2)();
      const bdstoken = base64.encode(encodeToden(data.sign5, data.sign1));
      event.source.postMessage(
        {
          bdstoken
        },
        event.origin
      );
      break;
    }
  }
});

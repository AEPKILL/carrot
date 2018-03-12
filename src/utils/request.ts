import BaiduUser from '../model/baidu-user';
import Dictionary from '../model/dictionary';
import { ResultBase } from '../model/result';
import user, { USER_STATUS } from '../services/user';

interface GetRequestOptions {
  params?: Dictionary<string | number>;
  method?: 'GET';
}

interface PostRequestOptions {
  params?: Dictionary<string | number>;
  method?: 'POST';
  // tslint:disable-next-line:no-any
  body?: any;
}

function paramToString(baseUrl: string, params?: Dictionary<string | number>) {
  if (params) {
    const hasQuery = baseUrl.indexOf('?') != -1;
    const queryString = Object.keys(params)
      .map(
        key =>
          `${encodeURIComponent(key)}=${encodeURIComponent(params[
            key
          ] as string)}`
      )
      .join('&');
    return hasQuery ? `${baseUrl}&${queryString}` : `${baseUrl}?${queryString}`;
  }
  return baseUrl;
}

export default async function requestJSON<T>(
  url: string,
  options?: PostRequestOptions | GetRequestOptions
): Promise<ResultBase & T> {
  const baiduUser: BaiduUser | null = await user.getUser();
  const requestOptions: RequestInit = {
    credentials: 'include'
  };
  let params!: Dictionary<string | number> | undefined;
  if (options) {
    params = options.params;
    requestOptions.method = options.method;
    if (options.method === 'POST') {
      requestOptions.body = options.body;
    }
  }
  if (baiduUser) {
    params = {
      ...params,
      bdstoken: baiduUser.bdstoken,
      clienttype: 0,
      web: 1,
      t: Math.random()
    };
  }
  return fetch(paramToString(url, params), requestOptions)
    .then(response => response.json())
    .then((json: ResultBase & T) => {
      if (json.errno == -6) {
        user.broadcastUserStatus(USER_STATUS.NO_LOGIN);
      }
      return json;
    })
    .catch(() => {
      throw new Error('网络错误');
    });
}

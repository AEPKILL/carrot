/**
 * 判断是否是一个受支持的下载链接
 * 支持 http/https/ftp/电驴/迅雷/磁力链接
 *
 * @export
 * @param {string} content
 * @returns {boolean}
 */
export function isSupportDownloadLink(content: string) {
  return /^(((https?|ftp|ed2k):\/\/)|magnet:\?xt=)/.test(content);
}

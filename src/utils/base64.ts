const s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// tslint:disable
function encode(t: string) {
  let e!: string;
  let r!: number;
  let a!: number;
  let n!: number;
  let o!: number;
  let i!: number;

  for (a = t.length, r = 0, e = ''; a > r; ) {
    if (((n = 255 & t.charCodeAt(r++)), r == a)) {
      (e += s.charAt(n >> 2)), (e += s.charAt((3 & n) << 4)), (e += '==');
      break;
    }
    if (((o = t.charCodeAt(r++)), r == a)) {
      (e += s.charAt(n >> 2)),
        (e += s.charAt(((3 & n) << 4) | ((240 & o) >> 4))),
        (e += s.charAt((15 & o) << 2)),
        (e += '=');
      break;
    }
    (i = t.charCodeAt(r++)),
      (e += s.charAt(n >> 2)),
      (e += s.charAt(((3 & n) << 4) | ((240 & o) >> 4))),
      (e += s.charAt(((15 & o) << 2) | ((192 & i) >> 6))),
      (e += s.charAt(63 & i));
  }
  return e;
}

export default {
  encode
};

// tslint:enable

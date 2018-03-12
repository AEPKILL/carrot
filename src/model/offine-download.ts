export interface MagnetInfo {
  error_code: number;
  error_msg: string;
  magnet_info: Array<{ filename: string; size: number }>;
  total: number;
}

export interface TaskInfo {
  error_code: number;
  error_msg: string;
  vcode?: string;
  img?: string;
}

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

// 使用 const 对象代替 enum 以避免 ESLint no-shadow 警告
export const IdPhotoState = {
  UPLOAD: 'UPLOAD',
  CROP: 'CROP',
  RESULT: 'RESULT',
} as const;

// 导出类型
export type IdPhotoState = (typeof IdPhotoState)[keyof typeof IdPhotoState];

// 为了向后兼容，保留别名
export type AppState = IdPhotoState;

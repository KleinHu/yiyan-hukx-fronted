import { PixelCrop } from '../types';

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * This function was adapted from the one in the Readme of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // 设置画布为目标裁剪大小
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.save();

  // 1. 移动到画布中心
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // 2. 旋转画布。因为我们在 Cropper 中计算的是图片旋转后，裁剪框在原始图片空间的位置，
  // 所以这里我们要应用正向旋转来还原图片的姿态。
  ctx.rotate(getRadianAngle(rotation));

  // 3. 绘制图片
  // 我们要裁剪的中心在图片上的坐标是 (pixelCrop.x + pixelCrop.width/2, pixelCrop.y + pixelCrop.height/2)
  // 我们需要把这个点移动到当前画布的中心 (0,0)
  ctx.translate(
    -(pixelCrop.x + pixelCrop.width / 2),
    -(pixelCrop.y + pixelCrop.height / 2)
  );

  ctx.drawImage(image, 0, 0);

  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const downloadImage = (
  base64Data: string,
  filename = 'id-photo.jpg'
) => {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 将base64字符串转换为File对象
 * @param base64Data base64字符串（包含data:image/jpeg;base64,前缀）
 * @param filename 文件名
 * @returns File对象
 */
export const base64ToFile = (
  base64Data: string,
  filename = 'id-photo.jpg'
): File => {
  const arr = base64Data.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; ) {
    u8arr[i] = bstr.charCodeAt(i);
    i += 1;
  }
  return new File([u8arr], filename, { type: mime });
};

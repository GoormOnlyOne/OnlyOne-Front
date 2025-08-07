import apiClient from './client';

interface PresignedUrlRequest {
  fileName: string;
  contentType: string;
  imageSize: number;
}

interface PresignedUrlResponse {
  presignedUrl: string;
  imageUrl: string;
}

// 허용된 이미지 타입 검증
const validateFileType = (file: File): void => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `지원하지 않는 파일 형식입니다. JPEG 또는 PNG 파일만 업로드 가능합니다. (현재: ${file.type})`,
    );
  }
};

// 파일 타입 변환 (image/jpg -> image/jpeg)
const normalizeContentType = (fileType: string): string => {
  return fileType === 'image/jpg' ? 'image/jpeg' : fileType;
};

// presigned URL 발급 (단일 이미지)
export const getPresignedUrl = async (
  file: File,
  imageFolderType: string,
): Promise<PresignedUrlResponse> => {
  validateFileType(file);

  const request: PresignedUrlRequest = {
    fileName: file.name,
    contentType: normalizeContentType(file.type),
    imageSize: file.size,
  };

  const response = await apiClient.post<{
    success: boolean;
    data: PresignedUrlResponse;
  }>(`/${imageFolderType}/presigned-url`, request);

  console.log('Presigned URL Response:', response.data);
  return response.data;
};

// presigned URL 발급 (다중 이미지)
export const getPresignedUrls = async (
  files: File[],
  imageFolderType: string,
): Promise<PresignedUrlResponse[]> => {
  const promises = files.map(file => getPresignedUrl(file, imageFolderType));
  return Promise.all(promises);
};

// S3에 이미지 업로드
export const uploadImagesToS3 = async (
  files: File[],
  presignedUrls: PresignedUrlResponse[],
): Promise<void> => {
  const uploadPromises = files.map(async (file, index) => {
    const { presignedUrl } = presignedUrls[index];

    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': normalizeContentType(file.type),
      },
    });

    if (!response.ok) {
      throw new Error(`이미지 업로드 실패: ${file.name}`);
    }
  });

  await Promise.all(uploadPromises);
};

// 단일 이미지 업로드
export const uploadImage = async (
  file: File,
  imageFolderType: string,
): Promise<string> => {
  const [imageUrl] = await uploadImages([file], imageFolderType);
  return imageUrl;
};

// 다중 이미지 업로드
export const uploadImages = async (
  files: File[],
  imageFolderType: string,
): Promise<string[]> => {
  try {
    // 1. 파일 타입 검증
    files.forEach(validateFileType);

    console.log(files, imageFolderType);

    // 2. presigned URL 발급
    const presignedUrls = await getPresignedUrls(files, imageFolderType);

    // 3. S3에 이미지 업로드
    await uploadImagesToS3(files, presignedUrls);

    // 4. 업로드 된 이미지 URL 반환
    return presignedUrls.map(item => item.imageUrl);
  } catch (error) {
    console.error('이미지 업로드 실패', error);
    throw error;
  }
};

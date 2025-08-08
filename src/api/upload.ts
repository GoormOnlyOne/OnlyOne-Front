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
  try {
    validateFileType(file);

    const request: PresignedUrlRequest = {
      fileName: file.name,
      contentType: normalizeContentType(file.type),
      imageSize: file.size,
    };

    const response = await apiClient.post<PresignedUrlResponse>(
      `/${imageFolderType}/presigned-url`,
      request
    );

    const result = response.data; // ✅ 구조 수정: .data.data ❌ → .data

    if (!result?.presignedUrl || !result?.imageUrl) {
      console.error('❌ presigned URL 응답 형식 이상:', result);
      throw new Error('presigned URL 발급 실패: 응답 누락');
    }

    console.log('📦 Presigned URL 발급 성공:', result);
    return result;
  } catch (err) {
    console.error(`❌ Presigned URL 발급 실패: ${file.name}`, err);
    throw err;
  }
};


// presigned URL 발급 (다중 이미지) — 실패한 파일은 undefined 처리 후 제거
export const getPresignedUrls = async (
  files: File[],
  imageFolderType: string,
): Promise<PresignedUrlResponse[]> => {
  const promises = files.map(file =>
    getPresignedUrl(file, imageFolderType).catch((err) => {
      console.error(`❌ Presigned URL 발급 실패: ${file.name}`, err);
      return undefined;
    })
  );

  const results = await Promise.all(promises);
  const filtered = results.filter((r): r is PresignedUrlResponse => !!r);

  if (filtered.length !== files.length) {
    throw new Error(`일부 presigned URL 발급에 실패했습니다. (${filtered.length}/${files.length})`);
  }

  return filtered;
};

// S3에 이미지 업로드
export const uploadImagesToS3 = async (
  files: File[],
  presignedUrls: PresignedUrlResponse[],
): Promise<void> => {
  if (files.length !== presignedUrls.length) {
    throw new Error('파일 수와 presigned URL 수가 일치하지 않습니다.');
  }

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
      throw new Error(`이미지 업로드 실패: ${file.name} (${response.status})`);
    }

    console.log(`✅ S3 업로드 완료: ${file.name}`);
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
    files.forEach(validateFileType);

    const presignedUrls = await getPresignedUrls(files, imageFolderType);

    await uploadImagesToS3(files, presignedUrls);

    return presignedUrls.map(item => item.imageUrl);
  } catch (error) {
    console.error('❌ 이미지 업로드 실패:', error);
    throw error;
  }
};
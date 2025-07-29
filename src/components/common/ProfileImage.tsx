import React, { useState, useRef, useCallback } from 'react';
import defaultProfileImage from '../../assets/user_profile.jpg';

export interface ProfileImage {
  file: File;
  url: string;
  name: string;
  size: number;
}

interface ProfileImageUploadProps {
  onImageSelect?: (image: ProfileImage) => void;
  onImageRemove?: () => void;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  defaultImage?: string;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  maxSizeInMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png'],
  defaultImage
}) => {
  const [selectedImage, setSelectedImage] = useState<ProfileImage | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // 파일 형식 검증
    if (!acceptedFormats.includes(file.type)) {
      return `지원하지 않는 파일 형식입니다. (${acceptedFormats.map(format => format.split('/')[1]).join(', ')})`;
    }

    // 파일 크기 검증
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `파일 크기가 ${maxSizeInMB}MB를 초과합니다.`;
    }

    return null;
  }, [acceptedFormats, maxSizeInMB]);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      alert(validationError); // 에러 메시지를 alert으로 표시
      return;
    }

    setError('');
    const url = URL.createObjectURL(file);
    const profileImage: ProfileImage = {
      file,
      url,
      name: file.name,
      size: file.size
    };

    setSelectedImage(profileImage);
    onImageSelect?.(profileImage);
  }, [validateFile, onImageSelect]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = (event: React.MouseEvent) => {
    event.stopPropagation(); // 부모의 클릭 이벤트 방지
    
    if (selectedImage?.url) {
      URL.revokeObjectURL(selectedImage.url);
    }
    setSelectedImage(null);
    setError('');
    onImageRemove?.();
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 선택된 이미지가 있으면 해당 이미지, 없으면 기본 이미지 사용
  const displayImage = selectedImage?.url || defaultImage || defaultProfileImage;
  const isCustomImage = selectedImage !== null; // 사용자가 선택한 이미지인지 확인

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 이미지 미리보기 영역 */}
      <div className="relative mb-4 z-0">
        <div
          className="relative w-32 h-32 mx-auto rounded-full cursor-pointer group transition-all duration-200 overflow-visible"
          onClick={handleUploadClick}
        >
          {/* 프로필 이미지 */}
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-gray-300 transition-colors">
            <img
              src={displayImage}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
            />
            
            {/* 이미지 위에 호버 오버레이 */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded-full" />
          </div>

          {/* 카메라 아이콘 (우측 하단) */}
          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg group-hover:bg-blue-600 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* X 버튼 (우측 상단) - 사용자가 선택한 이미지가 있을 때만 표시 */}
          {isCustomImage && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:bg-red-600 transition-colors z-10"
              type="button"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
     
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfileImageUpload;
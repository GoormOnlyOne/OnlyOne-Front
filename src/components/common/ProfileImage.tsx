import React, { useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
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
  editable?: boolean;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  maxSizeInMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png'],
  defaultImage,
  editable = true
}) => {
  const [selectedImage, setSelectedImage] = useState<ProfileImage | null>(null);
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
      alert(validationError); // 에러 메시지를 alert으로 표시
      return;
    }

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
    onImageRemove?.();
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // 선택된 이미지가 있으면 해당 이미지, 없으면 기본 이미지 사용
  const displayImage = selectedImage?.url || defaultImage || defaultProfileImage;
  const hasImage = selectedImage !== null || defaultImage !== undefined;

  return (
    <div className="flex justify-center w-full max-w-md mx-auto">
      {/* 이미지 미리보기 영역 */}
      <div
        onClick={editable ? handleUploadClick : undefined}
        className={clsx(
          'w-24 h-24 rounded-full relative mb-4 group',
          editable ? 'cursor-pointer' : '',
          !hasImage ? 'bg-gray-300 flex items-center justify-center' : ''
        )}
      >
        {/* 이미지 또는 기본 아이콘 */}
        {hasImage ? (
          <img
            src={displayImage}
            alt="프로필 이미지"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <i className="ri-user-fill text-3xl text-white" />
        )}

        {/* 마우스 오버 시 오버레이 (수정 가능할 때만) */}
        {editable && (
          <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        )}

        {/* 카메라 아이콘 (수정 가능할 때만) */}
        {editable && (
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <i className="ri-camera-fill text-xs text-white" />
          </div>
        )}

        {/* X 버튼 (사용자 이미지가 있을 때 + 수정 가능할 때) */}
        {hasImage && editable && (
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors z-10"
            type="button"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
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
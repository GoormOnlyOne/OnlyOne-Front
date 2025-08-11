import { useState, useRef, useEffect } from 'react';
import { uploadImages } from '../../../api/upload';
import { showApiErrorToast } from '../../common/Toast/ToastProvider';
import Loading from '../../common/Loading';

export interface InitialData {
  feedUrls: string[];
  content: string;
}

interface MeetingFeedFormProps {
  mode: 'create' | 'edit';
  initialData?: InitialData;
  onSubmit: (data: SubmittedData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export interface SubmittedData {
  content: string;
  feedUrls?: string[];
  imageUrls?: string[];
  files?: File[];
}

const MeetingFeedForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: MeetingFeedFormProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content ?? '');
      // edit 모드에서 기존 이미지들을 미리보기에 추가
      if (mode === 'edit' && initialData.feedUrls) {
        setExistingImageUrls(initialData.feedUrls);
        setImagePreviews(initialData.feedUrls);
      }
    }
  }, [initialData, mode]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    const currentTotal = selectedImages.length + existingImageUrls.length;
    const remainingSlots = 5 - currentTotal;
    const newFiles = files.slice(0, remainingSlots);

    if (newFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...newFiles]);
      // 미리보기 URL 생성
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageRemove = (index: number) => {
    const existingImagesCount = existingImageUrls.length;

    if (index < existingImagesCount) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      const newImageIndex = index - existingImagesCount;
      const previewUrl = imagePreviews[index];
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedImages(prev => prev.filter((_, i) => i !== newImageIndex));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleImageAreaClick = () => {
    const totalImages = selectedImages.length + existingImageUrls.length;
    if (totalImages < 5) {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;

    try {
      // 이미지 개수 검증 (1개 이상 5개 이하)
      const totalImages = selectedImages.length + existingImageUrls.length;
      if (totalImages === 0) {
        throw new Error('이미지를 최소 1개 이상 등록해주세요.');
      }

      if (totalImages > 5) {
        throw new Error('이미지는 최대 5개까지 등록 가능합니다.');
      }

      let newImageUrls: string[] = [];

      // 새로 선택된 이미지가 있는 경우 업로드
      if (selectedImages.length > 0) {
        newImageUrls = await uploadImages(selectedImages, 'feed');
      }

      // 기존 이미지와 새 이미지 합치기
      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      const requestData: SubmittedData = {
        content: content.trim(),
        imageUrls: allImageUrls,
        feedUrls: allImageUrls,
      };

      onSubmit(requestData);
    } catch (error) {
      console.error('피드 수정 중 오류:', error);
      showApiErrorToast(error);
    }
  };

  const totalImages = selectedImages.length + existingImageUrls.length;

  return (
    <div className="p-4 relative">
      {loading && <Loading overlay text="로딩 중..." />}

      {/* 이미지 등록 영역 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          *사진 등록 ({totalImages}/5) - 최소 1개 이상 필수
        </label>

        {/* 5개 슬롯 그리드 */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
          {/* 첫 번째 줄: 3개 슬롯 */}
          {[0, 1, 2].map(index => (
            <div key={index} className="aspect-square">
              {imagePreviews[index] ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreviews[index]}
                    alt={`미리보기 ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={e => {
                      console.error('이미지 로드 실패:', imagePreviews[index]);
                      // 에러 이미지 처리
                      e.currentTarget.src = '/placeholder-image.png'; // 또는 기본 이미지
                    }}
                  />
                  <button
                    onClick={() => handleImageRemove(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleImageAreaClick}
                  className="w-full h-full bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-400 text-2xl">+</span>
                </div>
              )}
            </div>
          ))}

          {/* 두 번째 줄: 2개 슬롯 (가운데 정렬) */}
          <div className="col-span-3 flex justify-center gap-3">
            {[3, 4].map(index => (
              <div key={index} className="aspect-square w-1/3">
                {imagePreviews[index] ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreviews[index]}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={e => {
                        console.error(
                          '이미지 로드 실패:',
                          imagePreviews[index],
                        );
                        e.currentTarget.src = '/placeholder-image.png';
                      }}
                    />
                    <button
                      onClick={() => handleImageRemove(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={handleImageAreaClick}
                    className="w-full h-full bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-400 text-2xl">+</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* 글 작성 영역 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          글 작성
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="모임에 대한 소감이나 사진에 대한 설명을 작성해주세요"
          maxLength={1000}
          disabled={loading}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {content.length}/1000
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="space-y-3">
        {/* 완료 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={totalImages === 0 || loading}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            totalImages === 0 || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          type="button"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <Loading size="sm" />
              로딩 중...
            </span>
          ) : mode === 'edit' ? (
            '수정 완료'
          ) : (
            '완료'
          )}
        </button>

        {/* 취소 버튼 */}
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingFeedForm;

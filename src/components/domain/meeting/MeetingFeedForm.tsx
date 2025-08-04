import { useState, useRef } from 'react';

interface MeetingFeedFormProps {
  mode: 'create' | 'edit';
  onSubmit?: () => void;
  onCancel?: () => void;
}

const MeetingFeedForm = ({ mode, onSubmit, onCancel }: MeetingFeedFormProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // 최대 5장 제한
    const remainingSlots = 5 - selectedImages.length;
    const newFiles = files.slice(0, remainingSlots);
    
    if (newFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...newFiles]);
      
      // 미리보기 URL 생성
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
    
    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageRemove = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // URL 메모리 해제
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleImageAreaClick = () => {
    if (selectedImages.length < 5) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="p-4">
      {/* 이미지 등록 영역 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          *사진 등록 ({selectedImages.length}/5)
        </label>
        
        {/* 5개 슬롯 그리드 */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
          {/* 첫 번째 줄: 3개 슬롯 */}
          {[0, 1, 2].map((index) => (
            <div key={index} className="aspect-square">
              {imagePreviews[index] ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreviews[index]}
                    alt={`미리보기 ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleImageRemove(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleImageAreaClick}
                  className="w-full h-full bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100"
                >
                  <span className="text-gray-400 text-2xl">+</span>
                </div>
              )}
            </div>
          ))}
          
          {/* 두 번째 줄: 2개 슬롯 (가운데 정렬) */}
          <div className="col-span-3 flex justify-center gap-3">
            {[3, 4].map((index) => (
              <div key={index} className="aspect-square w-1/3">
                {imagePreviews[index] ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreviews[index]}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleImageRemove(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={handleImageAreaClick}
                    className="w-full h-full bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100"
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
          accept="image/*"
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
          className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none"
          placeholder="모임에 대한 소감이나 사진에 대한 설명을 작성해주세요"
        />
      </div>

      {/* 완료 버튼 */}
      <button
        onClick={onSubmit}
        className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
      >
        완료
      </button>
    </div>
  );
};

export default MeetingFeedForm;
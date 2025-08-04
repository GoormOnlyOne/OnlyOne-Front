import { useNavigate } from 'react-router-dom';

export default function CreateMeetingCard() {
  const navigate = useNavigate();

  const createMeeting = () => {
    // 모임 생성 페이지로 이동
    navigate('/meeting/create');
  };

  return (
    <div className="bg-white rounded-2xl p-6 text-center w-full">
      <h2 className="text-base font-semibold text-gray-800 leading-snug">
        함께하는 즐거움, 새로운 만남
      </h2>
      <p className="text-sm text-gray-600 mt-2">
        벗킷에서 당신만의 모임을 만들어보세요
      </p>
      <button
        className="mt-4 bg-blue-500 text-white text-sm px-6 py-2 rounded-full hover:bg-blue-700 cursor-pointer hover:shadow-md transition-shadow"
        onClick={createMeeting}
      >
        <i className="ri-add-line text-lg"></i>
        <span>모임 만들기</span>
      </button>
    </div>
  );
}

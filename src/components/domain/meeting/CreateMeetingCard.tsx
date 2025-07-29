export default function CreateMeetingCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            새로운 모임 만들기
          </h3>
          <p className="text-sm text-gray-600">
            나만의 특별한 모임을 시작해보세요
          </p>
        </div>
        <button className="ml-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <i className="ri-add-line mr-2"></i>
          만들기
        </button>
      </div>
    </div>
  );
}
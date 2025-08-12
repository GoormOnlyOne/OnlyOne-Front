// PointChargePage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast as globalToast } from '../../components/common/Toast/ToastProvider';

interface PointOption {
  points: number;
  price: number;
}

const pointOptions: PointOption[] = [
  { points: 1000, price: 1000 },
  { points: 3000, price: 3000 },
  { points: 5000, price: 5000 },
  { points: 10000, price: 10000 },
  { points: 15000, price: 15000 },
  { points: 20000, price: 20000 },
  { points: 30000, price: 30000 },
  { points: 50000, price: 50000 },
  { points: 100000, price: 100000 },
];

export function PointCharge() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<PointOption | null>(
    null,
  );
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (!selectedOption || !agreed) {
      globalToast('포인트를 선택하고 약관에 동의해주세요.', 'error', 3000);
      return;
    }

    navigate('/payment', {
      state: {
        amount: {
          currency: 'KRW',
          value: selectedOption.price,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-gray-900">포인트 충전</h1>
          <p className="text-sm text-gray-600 mt-1">
            충전할 포인트를 선택해주세요.
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-3 mb-6">
            {pointOptions.map(option => (
              <label
                key={option.points}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer ${
                  selectedOption?.points === option.points
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="pointOption"
                  checked={selectedOption?.points === option.points}
                  onChange={() => setSelectedOption(option)}
                  className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer mr-4"
                />
                <div className="flex justify-between items-center w-full">
                  <div className="text-lg font-semibold text-gray-900">
                    {option.points.toLocaleString()}P
                  </div>
                  <div className="text-sm text-gray-600">
                    ₩{option.price.toLocaleString()}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <div className="text-sm text-gray-700">
              <span className="font-medium">이용약관 및 개인정보 처리방침</span>
              에 동의합니다.
              <br />
              <span className="text-gray-500">
                충전된 포인트는 환불이 불가능하며, 서비스 이용 시 자동으로
                차감됩니다.
              </span>
            </div>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!selectedOption || !agreed}
            className={`w-full py-4 rounded-xl font-semibold transition-colors ${
              selectedOption && agreed
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PointCharge;

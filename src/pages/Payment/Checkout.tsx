import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
import type { TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';
import { showApiErrorToast } from '../../components/common/Toast/ToastProvider';
import apiClient from '../../api/client';

interface SavePaymentRequestDto {
  orderId: string;
  amount: number;
}

interface Amount {
  currency: string;
  value: number;
}

const generateRandomString = () =>
  window.btoa(Math.random().toString()).slice(0, 20);

const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

export function Checkout() {
  const location = useLocation();
  const amountFromRoute = location.state?.amount;

  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [amount, setAmount] = useState<Amount>(
    amountFromRoute || { currency: 'KRW', value: 0 },
  );

  useEffect(() => {
    async function fetchPaymentWidgets() {
      const tossPayments = await loadTossPayments(clientKey);
      const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
      setWidgets(widgets);
    }

    fetchPaymentWidgets();
  }, []);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (!widgets) return;

      await widgets.setAmount(amount);

      await Promise.all([
        widgets.renderPaymentMethods({
          selector: '#payment-method',
          variantKey: 'DEFAULT',
        }),
        widgets.renderAgreement({
          selector: '#agreement',
          variantKey: 'AGREEMENT',
        }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets]);

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-white">
      <div className="w-full max-w-[540px]">
        <div id="payment-method" className="w-full" />
        <div id="agreement" className="w-full" />
        <div className="px-6 mt-6">
          <button
            disabled={!ready}
            className={`w-full py-[11px] px-[22px] rounded-lg font-semibold text-[17px] transition ${
              ready
                ? 'bg-[#3282f6] text-[#f9fcff] hover:bg-[#1e6ce9]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            onClick={async () => {
              const orderId = generateRandomString();

              try {
                const response = await apiClient.post<SavePaymentRequestDto>(
                  `/payments/save`,
                  { orderId, amount: amount.value },
                );
                console.log('orderId={}, amount={}', orderId, amount);
                if (response.success) {
                  await widgets?.requestPayment({
                    orderId,
                    orderName: `${amount.value.toLocaleString()}P 충전`,
                    customerName: '김토스',
                    customerEmail: 'customer123@gmail.com',
                    successUrl:
                      window.location.origin +
                      '/success' +
                      window.location.search,
                    failUrl:
                      window.location.origin + '/fail' + window.location.search,
                  });
                }
              } catch (err: any) {
                showApiErrorToast(err);
                console.error('결제 요청 중 에러:', err);
              }
            }}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}

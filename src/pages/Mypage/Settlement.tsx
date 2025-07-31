import ScrollToTopButton from '../../components/common/ScrollToTopButton';

export const Settlement = () => {
  return (
    <div>
      <p>정산 내역</p>
      
      {/* 맨 위로 가기 버튼 */}
      <ScrollToTopButton />
    </div>
  );
};

export { Settlement as default } from './Settlement';

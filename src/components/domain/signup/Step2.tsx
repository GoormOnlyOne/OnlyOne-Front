import AddressSelector from '../../common/AddressSelector';
import type { AddressData } from '../../common/AddressSelector';

interface Step2Props {
  selectedAddress?: AddressData;
  onAddressChange?: (address: AddressData) => void;
}

const Step2 = ({ selectedAddress, onAddressChange }: Step2Props) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-2">지역 선택</h2>
      <p className="text-gray-600 text-center mb-8">
        활동하실 지역을 선택해주세요
      </p>
      <AddressSelector 
        initialCity={selectedAddress?.city}
        initialDistrict={selectedAddress?.district}
        onAddressChange={onAddressChange}
      />
    </div>
  );
};

export default Step2;
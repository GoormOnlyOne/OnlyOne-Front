import MeetingForm from '../../components/domain/meeting/MeetingForm';

export const MeetingCreate = () => {
  return (
    <MeetingForm
      mode="create"
      onSubmit={(data, address) => {
        console.log('Create 요청', data, address);
        // API 요청 후 navigate 처리 등
      }}
    />
  );
};

export { MeetingCreate as default } from './MeetingCreate';

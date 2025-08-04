import MeetingFeedForm from '../../components/domain/meeting/MeetingFeedForm';

const MeetingFeedCreate = () => {
  const handleSubmit = () => {
    // 피드 생성 로직
    console.log('피드 생성');
  };

  const handleCancel = () => {
    // 뒤로가기 로직
    console.log('취소');
  };

  return (
    <MeetingFeedForm 
      mode="create" 
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default MeetingFeedCreate;
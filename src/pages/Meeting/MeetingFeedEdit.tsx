import MeetingFeedForm from '../../components/domain/meeting/MeetingFeedForm';

const MeetingFeedEdit = () => {
  const handleSubmit = () => {
    // 피드 수정 로직
    console.log('피드 수정');
  };

  const handleCancel = () => {
    // 뒤로가기 로직
    console.log('취소');
  };

  return (
    <MeetingFeedForm
      mode="edit"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default MeetingFeedEdit;

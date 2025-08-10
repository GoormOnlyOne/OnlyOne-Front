import MeetingList from '../components/domain/meeting/MeetingList';

export default function RecommendedMeetings() {
  return (
    <MeetingList 
      mode="full"
      apiEndpoint="/search/recommendations"
    />
  );
}
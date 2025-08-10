import MeetingList from '../components/domain/meeting/MeetingList';

export default function PartnerMeetings() {
  return (
    <MeetingList 
      mode="full"
      apiEndpoint="/search/teammates-clubs"
    />
  );
}
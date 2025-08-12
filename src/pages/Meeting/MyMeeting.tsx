import React from 'react';
import MeetingList from '../../components/domain/meeting/MeetingList';
import CreateMeetingCard from '../../components/domain/meeting/CreateMeetingCard';
import TitleHeader from '../../components/layout/title/Header';

const MyMeeting = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 상단 헤더 */}
      <TitleHeader isBack={true} isTitle={true} titleText="내 모임" />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4">
          <CreateMeetingCard />
          <div className="mt-4">
            <MeetingList mode="my" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyMeeting;

import CreateMeetingCard from '../../domain/meeting/CreateMeetingCard';

interface EmptyStateProps {
  title?: string;
  description?: string;
  image?: string;
  showCreateButton?: boolean;
}

export default function EmptyState({
  title = "검색 결과가 없습니다",
  description = "다른 검색어로 시도해보세요",
  showCreateButton = true
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-8 text-center max-w-xs">{description}</p>
      
      { showCreateButton && <CreateMeetingCard /> }
    </div>
  );
}
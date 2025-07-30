import React from 'react'
import type { Notification } from './NotificationType'
import { getNotificationMessage } from './getNotificationMessage'

interface Props {
  notification: Notification
  onClick?: (noti: Notification) => void
}

const NotificationItem: React.FC<Props> = ({ notification, onClick }) => {
  const message = getNotificationMessage(notification)

  return (
    <div
      onClick={() => onClick?.(notification)}
      className="
        flex items-start
        p-2.5 bg-gray-100 rounded-lg mb-2
        cursor-pointer
        hover:bg-gray-200
        transition-colors duration-200 ease-in-out
      "
    >
      <div className="flex flex-col items-center mr-3">
        <img
          src={notification.groupImageUrl}
          alt="모임 이미지"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="text-xs text-gray-600 mt-1">알림</span>
      </div>
      <div className="text-sm text-gray-800 leading-6">
        {message}
      </div>
    </div>
  )
}

export default NotificationItem
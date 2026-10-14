'use strict';

const getNotificationTone = (type, relatedType = null) => {
  const effectiveType = relatedType || type;

  switch (effectiveType) {
    case 'ACCESS_REQUEST':
      return 'orange';
    case 'REPORT':
      return 'red';
    case 'SYSTEM':
      return 'blue';
    default:
      return 'green';
  }
};

const getNotificationLink = (type, relatedType = null) => {
  const effectiveType = relatedType || type;

  switch (effectiveType) {
    case 'ACCESS_REQUEST':
      return '/admin/dashboard';
    case 'REPORT':
      return '/admin/reports';
    case 'CERTIFICATE_VALIDATION':
    case 'RECOMMENDATION_LETTER_VALIDATION':
    case 'COMMENT_VALIDATION':
    case 'RECOMMENDATION_VALIDATION':
      return '/admin/validations';
    default:
      return '/admin/notifications';
  }
};

const getLegacyNotificationType = (type, relatedType = null) => {
  const effectiveType = relatedType || type;

  switch (effectiveType) {
    case 'REPORT':
      return 'ALERT';
    case 'ACCESS_REQUEST':
    case 'SYSTEM':
      return 'INFO';
    default:
      return 'VALIDATION';
  }
};

const mapNotificationItem = (notification) => ({
  id: notification.id,
  type: getLegacyNotificationType(notification.type, notification.relatedType),
  notificationType: notification.type,
  title: notification.title,
  message: notification.message,
  read: notification.isRead,
  isRead: notification.isRead,
  createdAt: notification.createdAt,
  readAt: notification.readAt,
  tone: getNotificationTone(notification.type, notification.relatedType),
  link: getNotificationLink(notification.type, notification.relatedType),
  target:
    notification.relatedId && (notification.relatedType || notification.type)
      ? {
          itemType: notification.relatedType || notification.type,
          itemId: notification.relatedId,
        }
      : null,
  raw: {
    administratorId: notification.administratorId,
    notificationType: notification.type,
    relatedType: notification.relatedType,
    relatedId: notification.relatedId,
  },
});


module.exports = {
  mapNotificationItem,
};

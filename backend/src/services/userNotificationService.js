'use strict';

const crypto = require('crypto');
const prisma = require('../config/prisma');

const MAX_SYNCED_ITEMS = 50;

const isStructureMissingError = (err) =>
  err?.code === 'P2021' ||
  err?.code === 'P2022' ||
  err?.meta?.code === '42P01' ||
  err?.meta?.code === '42703';

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeText = (value) => String(value || '').trim();
const normalizeType = (value) => normalizeText(value).toUpperCase().replace(/-/g, '_');

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const formatFullName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

const getLegacyNotificationType = (notification) => {
  if (notification.relatedType === 'PROJECT_VALIDATION') return 'VALIDATION';
  if (notification.relatedType === 'INTERNSHIP_VALIDATION') return 'VALIDATION';
  if (notification.relatedType === 'PROFESSIONAL_ACCOUNT_ALERT') return 'ALERT';
  if (notification.type === 'REPORT') return 'ALERT';
  if (notification.type === 'SYSTEM' || notification.type === 'ACCESS_REQUEST') return 'INFO';
  return 'VALIDATION';
};

const getNotificationTone = (notification) => {
  const legacyType = getLegacyNotificationType(notification);
  if (legacyType === 'ALERT') return 'red';
  if (legacyType === 'VALIDATION') return 'green';
  return 'blue';
};

const getNotificationLink = (role, notification) => {
  if (notification.relatedType === 'PROJECT_VALIDATION') return '/professor/validations';
  if (notification.relatedType === 'INTERNSHIP_VALIDATION') return '/professor/validations';
  if (notification.relatedType?.startsWith('PROFESSIONAL_ACCOUNT')) {
    return '/professional/dashboard';
  }

  if (role === 'PROFESSOR') return '/professor/notifications';
  if (role === 'PROFESSIONAL') return '/professional/notifications';
  return '/notifications';
};

const mapNotificationItem = (notification, role) => ({
  id: notification.id,
  type: getLegacyNotificationType(notification),
  notificationType: notification.type,
  title: notification.title,
  message: notification.message,
  read: notification.isRead,
  isRead: notification.isRead,
  createdAt: notification.createdAt,
  readAt: notification.readAt,
  tone: getNotificationTone(notification),
  link: getNotificationLink(role, notification),
  target:
    notification.relatedId && notification.relatedType
      ? {
          itemType: notification.relatedType,
          itemId: notification.relatedId,
        }
      : null,
  raw: {
    userId: notification.userId,
    notificationType: notification.type,
    relatedType: notification.relatedType,
    relatedId: notification.relatedId,
  },
});

const readUserNotificationRows = async (userId, extraWhereSql = '') => {
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT
        "id_notification" AS "id",
        "user_id" AS "userId",
        "type"::text AS "type",
        "title",
        "message",
        "related_type" AS "relatedType",
        "related_id" AS "relatedId",
        "is_read" AS "isRead",
        "created_at" AS "createdAt",
        "read_at" AS "readAt"
      FROM "notifications"
      WHERE "user_id" = $1
      ${extraWhereSql}
      ORDER BY "created_at" DESC
    `,
    userId,
  );

  return rows;
};

const ensureUserNotification = async ({
  userId,
  type = 'SYSTEM',
  title,
  message,
  relatedType = null,
  relatedId = null,
}) => {
  const existing = await prisma.$queryRaw`
    SELECT "id_notification" AS "id"
    FROM "notifications"
    WHERE "user_id" = ${userId}
      AND "type" = CAST(${type} AS "NotificationType")
      AND "title" = ${title}
      AND "related_type" IS NOT DISTINCT FROM ${relatedType}
      AND "related_id" IS NOT DISTINCT FROM ${relatedId}
    LIMIT 1
  `;

  if (existing[0]) {
    return existing[0];
  }

  return prisma.$queryRaw`
    INSERT INTO "notifications" (
      "id_notification",
      "user_id",
      "type",
      "title",
      "message",
      "related_type",
      "related_id",
      "is_read",
      "created_at"
    )
    VALUES (
      ${crypto.randomUUID()},
      ${userId},
      CAST(${type} AS "NotificationType"),
      ${title},
      ${message},
      ${relatedType},
      ${relatedId},
      false,
      ${new Date()}
    )
    RETURNING "id_notification" AS "id"
  `;
};

const syncProfessorNotifications = async (userId) => {
  const professor = await prisma.professor.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!professor) {
    return;
  }

  const [projects, internships] = await Promise.all([
    prisma.project.findMany({
      where: {
        validatorProfessorId: professor.id,
        validationStatus: 'PENDING',
      },
      orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
      take: MAX_SYNCED_ITEMS,
      select: {
        id: true,
        title: true,
        student: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    }),
    prisma.internship.findMany({
      where: {
        supervisorProfessorId: professor.id,
        validationStatus: 'PENDING',
      },
      orderBy: [{ startDate: 'desc' }, { endDate: 'desc' }],
      take: MAX_SYNCED_ITEMS,
      select: {
        id: true,
        hostOrganization: true,
        student: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    }),
  ]);

  await Promise.all([
    ...projects.map((project) =>
      ensureUserNotification({
        userId,
        title: 'Projet a valider',
        message: `Le projet "${project.title}" de ${formatFullName(
          project.student?.user,
        )} attend votre validation.`,
        relatedType: 'PROJECT_VALIDATION',
        relatedId: project.id,
      }),
    ),
    ...internships.map((internship) =>
      ensureUserNotification({
        userId,
        title: 'Stage a valider',
        message: `Le stage chez ${internship.hostOrganization} de ${formatFullName(
          internship.student?.user,
        )} attend votre validation.`,
        relatedType: 'INTERNSHIP_VALIDATION',
        relatedId: internship.id,
      }),
    ),
  ]);
};

const syncProfessionalNotifications = async (userId) => {
  const professional = await prisma.professional.findUnique({
    where: { userId },
    select: {
      id: true,
      isVerified: true,
      isEmailVerified: true,
      approvedAt: true,
      rejectedAt: true,
      rejectionReason: true,
      suspendedAt: true,
      suspensionReason: true,
      user: {
        select: {
          accountStatus: true,
        },
      },
    },
  });

  if (!professional) {
    return;
  }

  if (professional.user.accountStatus === 'SUSPENDED' || professional.suspendedAt) {
    await ensureUserNotification({
      userId,
      title: 'Compte professionnel suspendu',
      message: professional.suspensionReason || 'Votre compte professionnel est suspendu.',
      relatedType: 'PROFESSIONAL_ACCOUNT_ALERT',
      relatedId: professional.id,
    });
    return;
  }

  if (professional.rejectedAt || professional.user.accountStatus === 'INACTIVE') {
    await ensureUserNotification({
      userId,
      title: 'Demande professionnelle rejetee',
      message: professional.rejectionReason || 'Votre demande professionnelle a ete rejetee.',
      relatedType: 'PROFESSIONAL_ACCOUNT_ALERT',
      relatedId: professional.id,
    });
    return;
  }

  if (professional.isVerified || professional.approvedAt) {
    await ensureUserNotification({
      userId,
      title: 'Compte professionnel valide',
      message: 'Votre compte professionnel a ete valide par un administrateur.',
      relatedType: 'PROFESSIONAL_ACCOUNT',
      relatedId: professional.id,
    });
    return;
  }

  if (!professional.isEmailVerified) {
    await ensureUserNotification({
      userId,
      title: 'Email professionnel a verifier',
      message: 'Verifiez votre adresse email pour finaliser votre demande.',
      relatedType: 'PROFESSIONAL_ACCOUNT',
      relatedId: professional.id,
    });
    return;
  }

  await ensureUserNotification({
    userId,
    title: 'Demande professionnelle en attente',
    message: 'Votre demande professionnelle est en attente de validation administrateur.',
    relatedType: 'PROFESSIONAL_ACCOUNT',
    relatedId: professional.id,
  });
};

const getUserRole = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return user.role;
};

const syncUserNotifications = async (userId) => {
  const role = await getUserRole(userId);

  try {
    if (role === 'PROFESSOR') {
      await syncProfessorNotifications(userId);
    }

    if (role === 'PROFESSIONAL') {
      await syncProfessionalNotifications(userId);
    }
  } catch (err) {
    if (!isStructureMissingError(err)) {
      throw err;
    }
  }

  return role;
};

const notificationMatches = (notification, filters) => {
  if (typeof filters.isRead === 'boolean' && notification.isRead !== filters.isRead) {
    return false;
  }

  if (filters.type) {
    const legacyType = getLegacyNotificationType(notification);
    if (legacyType !== filters.type && notification.type !== filters.type) {
      return false;
    }
  }

  if (filters.search) {
    const haystack = [
      notification.title,
      notification.message,
      notification.relatedType,
      notification.relatedId,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!haystack.includes(filters.search.toLowerCase())) {
      return false;
    }
  }

  return true;
};

const listUserNotifications = async (userId, filters = {}) => {
  const page = parsePositiveInt(filters.page, 1);
  const limit = Math.min(parsePositiveInt(filters.limit, 10), 50);
  const role = await syncUserNotifications(userId);

  try {
    const rows = await readUserNotificationRows(userId);
    const type = normalizeType(filters.type);
    const search = normalizeText(filters.search);
    const normalizedFilters = {
      type: type === 'ALL' ? '' : type,
      isRead: typeof filters.isRead === 'boolean' ? filters.isRead : null,
      search,
    };
    const filteredItems = rows
      .filter((notification) => notificationMatches(notification, normalizedFilters))
      .map((notification) => mapNotificationItem(notification, role));
    const start = (page - 1) * limit;

    return {
      filters: normalizedFilters,
      summary: {
        total: filteredItems.length,
        unread: filteredItems.filter((notification) => !notification.isRead).length,
        read: filteredItems.filter((notification) => notification.isRead).length,
      },
      items: filteredItems.slice(start, start + limit),
      pagination: buildPagination(page, limit, filteredItems.length),
    };
  } catch (err) {
    if (isStructureMissingError(err)) {
      return {
        filters: { type: null, isRead: null, search: null },
        summary: { total: 0, unread: 0, read: 0 },
        items: [],
        pagination: buildPagination(page, limit, 0),
      };
    }

    throw err;
  }
};

const getUnreadCount = async (userId) => {
  await syncUserNotifications(userId);

  try {
    const rows = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS "count"
      FROM "notifications"
      WHERE "user_id" = ${userId}
        AND "is_read" = false
    `;

    return Number(rows[0]?.count || 0);
  } catch (err) {
    if (isStructureMissingError(err)) return 0;
    throw err;
  }
};

const getUnreadNotifications = async (userId) => {
  const role = await syncUserNotifications(userId);

  try {
    const rows = await readUserNotificationRows(userId, 'AND "is_read" = false');
    return {
      count: rows.length,
      items: rows.map((notification) => mapNotificationItem(notification, role)),
    };
  } catch (err) {
    if (isStructureMissingError(err)) {
      return { count: 0, items: [] };
    }

    throw err;
  }
};

const markAsRead = async (userId, notificationId) => {
  const rows = await prisma.$queryRaw`
    UPDATE "notifications"
    SET "is_read" = true,
        "read_at" = ${new Date()}
    WHERE "user_id" = ${userId}
      AND "id_notification" = ${notificationId}
    RETURNING
      "id_notification" AS "id",
      "user_id" AS "userId",
      "type"::text AS "type",
      "title",
      "message",
      "related_type" AS "relatedType",
      "related_id" AS "relatedId",
      "is_read" AS "isRead",
      "created_at" AS "createdAt",
      "read_at" AS "readAt"
  `;

  if (!rows[0]) {
    throw new Error('USER_NOTIFICATION_NOT_FOUND');
  }

  return mapNotificationItem(rows[0], await getUserRole(userId));
};

const markAllAsRead = async (userId) => {
  const rows = await prisma.$queryRaw`
    UPDATE "notifications"
    SET "is_read" = true,
        "read_at" = ${new Date()}
    WHERE "user_id" = ${userId}
      AND "is_read" = false
    RETURNING "id_notification" AS "id"
  `;

  return {
    updatedCount: rows.length,
    readAt: new Date(),
  };
};

const deleteNotification = async (userId, notificationId) => {
  const rows = await prisma.$queryRaw`
    DELETE FROM "notifications"
    WHERE "user_id" = ${userId}
      AND "id_notification" = ${notificationId}
    RETURNING "id_notification" AS "id"
  `;

  if (!rows[0]) {
    throw new Error('USER_NOTIFICATION_NOT_FOUND');
  }

  return {
    deleted: true,
    notificationId,
  };
};

module.exports = {
  deleteNotification,
  getUnreadCount,
  getUnreadNotifications,
  listUserNotifications,
  markAllAsRead,
  markAsRead,
};

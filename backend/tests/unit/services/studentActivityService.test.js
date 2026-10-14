'use strict';

jest.mock('../../../src/config/prisma', () => ({
  student: {
    findUnique: jest.fn(),
  },
  extracurricularActivity: {
    findFirst: jest.fn(),
  },
  certificate: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
}));

jest.mock('../../../src/services/student/activityCertificateStorage', () => ({
  deleteActivityCertificate: jest.fn(),
  getActivityCertificateTarget: jest.fn(),
  storeActivityCertificate: jest.fn(),
}));

const prisma = require('../../../src/config/prisma');
const {
  deleteActivityCertificate,
  storeActivityCertificate,
} = require('../../../src/services/student/activityCertificateStorage');
const studentActivityService = require('../../../src/services/studentActivityService');

const activityRecord = {
  id: 'activity-1',
  studentId: 'student-1',
  type: 'EVENT',
  title: 'Forum',
  description: null,
  organization: null,
  startDate: null,
  endDate: null,
  duration: null,
  location: null,
  validationStatus: 'DRAFT',
  visibility: 'PRIVATE',
  certificates: [],
};

describe('studentActivityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
    prisma.extracurricularActivity.findFirst.mockResolvedValue(activityRecord);
    prisma.certificate.findFirst.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(async (callback) =>
      callback({
        extracurricularActivity: {
          update: jest.fn().mockResolvedValue({ id: 'activity-1' }),
        },
        certificate: {
          create: jest.fn().mockResolvedValue({ id: 'certificate-1' }),
          update: jest.fn(),
        },
      }),
    );
  });

  it('persists only fields supported by Certificate', async () => {
    storeActivityCertificate.mockResolvedValue({
      fileName: 'attestation.pdf',
      fileSize: 2468,
      mimeType: 'application/pdf',
      storagePath: 'activities/attestation.pdf',
      publicUrl: null,
    });

    let certificateCreateData;
    prisma.$transaction.mockImplementationOnce(async (callback) =>
      callback({
        extracurricularActivity: {
          update: jest.fn().mockResolvedValue({ id: 'activity-1' }),
        },
        certificate: {
          create: jest.fn(({ data }) => {
            certificateCreateData = data;
            return { id: 'certificate-1' };
          }),
          update: jest.fn(),
        },
      }),
    );

    await studentActivityService.uploadActivityCertificate(
      'user-1',
      'activity-1',
      { originalname: 'attestation.pdf' },
    );

    expect(certificateCreateData).toEqual({
      activityId: 'activity-1',
      documentUrl:
        '/api/student/activities/activity-1/certificate/download',
      fileName: 'attestation.pdf',
      mimeType: 'application/pdf',
      fileSize: 2468,
      storagePath: 'activities/attestation.pdf',
      validationStatus: 'DRAFT',
    });
    expect(certificateCreateData).not.toHaveProperty('publicUrl');
    expect(deleteActivityCertificate).toHaveBeenCalledWith(undefined);
  });
});

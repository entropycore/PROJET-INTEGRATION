'use strict';

jest.mock('../../../src/config/prisma', () => ({
  internship: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  internshipMedia: {
    createMany: jest.fn(),
  },
}));

jest.mock('../../../src/services/student/stageMediaStorage', () => ({
  deleteStageFile: jest.fn(),
  getStageFileTarget: jest.fn(),
  storeStageFile: jest.fn(),
}));

const prisma = require('../../../src/config/prisma');
const {
  storeStageFile,
} = require('../../../src/services/student/stageMediaStorage');
const studentStageMediaService = require('../../../src/services/studentStageMediaService');

describe('studentStageMediaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.internship.findFirst.mockResolvedValue({ id: 'stage-1' });
    prisma.internship.update.mockResolvedValue({ id: 'stage-1' });
    prisma.internshipMedia.createMany.mockResolvedValue({ count: 1 });
  });

  it('persists only report fields supported by Internship', async () => {
    prisma.internship.findFirst.mockResolvedValue({
      id: 'stage-1',
      reportStoragePath: 'stages/old-report.pdf',
    });
    storeStageFile.mockResolvedValue({
      fileName: 'rapport.pdf',
      fileSize: 4321,
      mimeType: 'application/pdf',
      storagePath: 'stages/rapport.pdf',
      publicUrl: null,
    });

    await studentStageMediaService.uploadStageReport(
      'user-1',
      'stage-1',
      { originalname: 'rapport.pdf' },
    );

    expect(prisma.internship.update).toHaveBeenCalledWith({
      where: { id: 'stage-1' },
      data: {
        reportUrl: '/api/student/stages/stage-1/report/download',
        reportFileName: 'rapport.pdf',
        reportMimeType: 'application/pdf',
        reportFileSize: 4321,
        reportStoragePath: 'stages/rapport.pdf',
      },
    });
    expect(prisma.internship.update.mock.calls[0][0].data).not.toHaveProperty(
      'publicUrl',
    );
  });

  it('persists only fields supported by InternshipMedia', async () => {
    storeStageFile.mockResolvedValue({
      fileName: 'stage.png',
      fileSize: 5678,
      mimeType: 'image/png',
      storagePath: 'stages/stage.png',
      publicUrl: null,
    });

    await studentStageMediaService.uploadStageImages(
      'user-1',
      'stage-1',
      [{ originalname: 'stage.png' }],
    );

    const [record] = prisma.internshipMedia.createMany.mock.calls[0][0].data;

    expect(record).toMatchObject({
      internshipId: 'stage-1',
      mediaType: 'IMAGE',
      description: 'stage.png',
      fileName: 'stage.png',
      fileSize: 5678,
      mimeType: 'image/png',
      storagePath: 'stages/stage.png',
    });
    expect(record).not.toHaveProperty('publicUrl');
  });
});

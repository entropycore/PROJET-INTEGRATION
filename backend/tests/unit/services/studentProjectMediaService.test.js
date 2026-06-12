'use strict';

jest.mock('../../../src/config/prisma', () => ({
  project: {
    findFirst: jest.fn(),
  },
  projectMedia: {
    createMany: jest.fn(),
  },
}));

jest.mock('../../../src/services/student/projectMediaStorage', () => ({
  deleteProjectFile: jest.fn(),
  getProjectFileTarget: jest.fn(),
  storeProjectFile: jest.fn(),
}));

const prisma = require('../../../src/config/prisma');
const {
  storeProjectFile,
} = require('../../../src/services/student/projectMediaStorage');
const studentProjectMediaService = require('../../../src/services/studentProjectMediaService');

describe('studentProjectMediaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.project.findFirst.mockResolvedValue({ id: 'project-1' });
    prisma.projectMedia.createMany.mockResolvedValue({ count: 1 });
  });

  it('persists only fields supported by ProjectMedia', async () => {
    storeProjectFile.mockResolvedValue({
      fileName: 'capture.png',
      fileSize: 1234,
      mimeType: 'image/png',
      storagePath: 'projects/capture.png',
      publicUrl: null,
    });

    await studentProjectMediaService.uploadProjectMedia('user-1', 'project-1', {
      screenshots: [{ originalname: 'capture.png' }],
    });

    const [record] = prisma.projectMedia.createMany.mock.calls[0][0].data;

    expect(record).toMatchObject({
      projectId: 'project-1',
      mediaType: 'SCREENSHOT',
      description: 'capture.png',
      fileName: 'capture.png',
      fileSize: 1234,
      mimeType: 'image/png',
      storagePath: 'projects/capture.png',
    });
    expect(record).not.toHaveProperty('publicUrl');
  });
});

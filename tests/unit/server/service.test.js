import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { Service } from '../../../server/service.js';
import TestUtil from '../_util/testUtil.js';
import config from '../../../server/config.js';
import fs from 'fs';
import { join } from 'path';
import fsPromises from 'fs/promises';
const {
  dir: { publicDirectory },
} = config;

describe('controller tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  test('#createFileStream', async () => {
    const mockStream = TestUtil.generateReadableStream(['test']);
    // const mockType = '.html';
    const mockFileName = 'test.html';

    jest.spyOn(fs, 'createReadStream').mockResolvedValue(mockStream);

    const service = new Service();
    const stream = await service.createFileStream(mockFileName);

    expect(stream).toStrictEqual(mockStream);
    expect(fs.createReadStream).toHaveBeenCalledWith(mockFileName);
  });

  test('#getFileInfo', async () => {
    jest.spyOn(fsPromises, fsPromises.access.name).mockResolvedValue();

    const currentSong = 'mySong.mp3';
    const service = new Service();
    const result = await service.getFileInfo(currentSong);
    const expectedResult = {
      type: '.mp3',
      name: `${publicDirectory}/${currentSong}`,
    };

    expect(result).toStrictEqual(expectedResult);
  });

  test('#getFileStream', async () => {
    const typeMock = '.mp3';
    const nameMock = 'mySong.mp3';
    const streamMock = TestUtil.generateReadableStream(['test']);
    jest
      .spyOn(Service.prototype, Service.prototype.getFileInfo.name)
      .mockResolvedValue({
        type: typeMock,
        name: nameMock,
      });
    jest
      .spyOn(Service.prototype, Service.prototype.createFileStream.name)
      .mockReturnValue(streamMock);
    const service = new Service();
    const expectedResult = {
      stream: streamMock,
      type: typeMock,
    };
    const result = await service.getFileStream(nameMock);
    expect(result).toStrictEqual(expectedResult);
  });
});

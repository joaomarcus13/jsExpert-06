import { jest, expect, describe, test, beforeEach } from '@jest/globals';

import config from '../../../server/config.js';
import { Controller } from '../../../server/controller.js';
const {
  pages,
  location,
  constants: { CONTENT_TYPE },
} = config;
import { handler } from '../../../server/routes.js';
import TestUtil from '../_util/testUtil.js';

describe('server routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('GET / - should redirect to home page', async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = 'GET';
    params.request.url = '/';
    await handler(...params.values);
    expect(params.response.writeHead).toHaveBeenCalledWith(302, {
      Location: location.home,
    });
    expect(params.response.end).toHaveBeenCalled();
  });

  test(`GET /home - should response with ${pages.homeHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = 'GET';
    params.request.url = '/home';
    const mockFileStream = TestUtil.generateReadableStream(['data']);
    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      });
    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values);
    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(
      pages.homeHTML
    );
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test(`GET /controller - should response ${pages.controllerHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = 'GET';
    params.request.url = '/controller';
    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(Controller.prototype, 'getFileStream').mockResolvedValue({
      stream: mockFileStream,
    });
    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values);
    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(
      pages.controllerHTML
    );
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test(`GET /file.txt - should response with file stream`, async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = 'GET';
    const filename = '/index.html';
    params.request.url = filename;
    const expectedType = '.html';
    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(Controller.prototype, 'getFileStream').mockResolvedValue({
      stream: mockFileStream,
      type: expectedType,
    });
    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values);
    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(filename);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': CONTENT_TYPE[expectedType],
    });
  });
  test(`GET /file.ext invalid extension - should response with file stream`, async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = 'GET';
    const filename = '/file.ext';
    params.request.url = filename;
    const expectedType = '.ext';
    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(Controller.prototype, 'getFileStream').mockResolvedValue({
      stream: mockFileStream,
      type: expectedType,
    });
    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values);
    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(filename);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).not.toHaveBeenCalledWith();
  });

  test(`GET /unknown - should response with 404`, async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = 'POST';
    params.request.url = '/unknown';

    await handler(...params.values);

    expect(params.response.writeHead).toHaveBeenCalledWith(404);
    expect(params.response.end).toHaveBeenCalled();
  });

  describe('exceptions', () => {
    test('given inexistent file it should response with 404', async () => {
      const params = TestUtil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = '/index.png';

      jest
        .spyOn(Controller.prototype, 'getFileStream')
        .mockRejectedValue(
          new Error(
            "Error: ENOENT: no such file or directory, open '/index.png'"
          )
        );

      await handler(...params.values);

      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });

    test('given an error it should response with 500', async () => {
      const params = TestUtil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = '/index.png';

      jest
        .spyOn(Controller.prototype, 'getFileStream')
        .mockRejectedValue(new Error('Error'));

      await handler(...params.values);

      expect(params.response.writeHead).toHaveBeenCalledWith(500);
      expect(params.response.end).toHaveBeenCalled();
    });
  });
});

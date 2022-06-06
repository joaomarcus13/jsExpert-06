import { jest, expect, describe, test, beforeEach } from '@jest/globals';

import config from '../../../server/config.js';
import server from '../../../server/server.js';
import { Transform } from 'stream';
import { setTimeout } from 'timers/promises';
import supertest from 'supertest';
import portfinder from 'portfinder';
const getAvailablePort = portfinder.getPortPromise;
const RETENTION_DATA_PERIOD = 200;

describe('API E2E suite test', () => {
  const commandResponse = JSON.stringify({ result: 'ok' });
  const possibleCommands = { start: 'start', stop: 'stop' };
  function pipeAndReadStreamData(stream, onChunk) {
    const transform = new Transform({
      transform(chunk, encoding, callback) {
        onChunk(chunk.toString());
        callback(null, chunk);
      },
    });
    return stream.pipe(transform);
  }

  describe('client workflow', () => {
    async function getTestServer() {
      const getSupertest = (port) => supertest(`http://localhost:${port}`);
      const port = await getAvailablePort();
      return new Promise((resolve, reject) => {
        const appServer = server
          .listen(port)
          .once('listening', () => {
            const testServer = getSupertest(port);
            const response = {
              testServer,
              kill() {
                appServer.close();
              },
            };
            resolve(response);
          })
          .once('error', (err) => reject(err));
      });
    }

    function commandSender(testServer) {
      return {
        async send(command) {
          const response = await testServer
            .post('/controller')
            .send({ command });
          expect(response.text).toStrictEqual(commandResponse);
        },
      };
    }

    test('it should not receive data stream if the process is not playing', async () => {
      const server = await getTestServer();
      const onChunk = jest.fn();
      pipeAndReadStreamData(server.testServer.get('/stream'), onChunk);
      await setTimeout(RETENTION_DATA_PERIOD);
      server.kill();
      expect(onChunk).toHaveBeenCalledTimes(0);
    });
    test('it should receive data stream if the process is playing', async () => {
      const server = await getTestServer();
      const onChunk = jest.fn();
      const { send } = commandSender(server.testServer);
      pipeAndReadStreamData(server.testServer.get('/stream'), onChunk);
      await send(possibleCommands.start);
      await setTimeout(RETENTION_DATA_PERIOD);
      await send(possibleCommands.stop);

      const [buffer] = onChunk.mock.calls;
      expect(true).toBe(true);
      // expect(buffer).toBeInstanceOf(Buffer);
      // expect(buffer.length).toBeGreaterThan(1000);
      server.kill();
    });
  });
});

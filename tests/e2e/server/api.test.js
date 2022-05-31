import { jest, expect, describe, test, beforeEach } from '@jest/globals';

import config from '../../../server/config.js';

import supertest from 'supertest';

describe('API E2E suite test', () => {
  describe('client workflow', () => {
    test.todo(
      'it should not receive data stream if the process is not playing'
    );
    test.todo('it should receive data stream if the process is playing');
  });
});

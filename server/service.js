import fs from 'fs';
import fsPromises from 'fs/promises';
import config from './config.js';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { PassThrough, Writable } from 'stream';
import Throttle from 'throttle';
import childProcess from 'child_process';
import { logger } from './util.js';
import streamsPromises from 'stream/promises';
import { once } from 'events';

const {
  dir: { publicDirectory },
  constants: { fallBackBitrate, englishConversation, biteRateDivisor },
} = config;

export class Service {
  constructor() {
    this.clientStreams = new Map();
    this.currentSong = englishConversation;
    this.currentBitRate = 0;
    this.throttleTransform = {};
    this.currentReadable = {};
  }

  createClientStream() {
    const id = randomUUID();
    const clientStream = new PassThrough();
    this.clientStreams.set(id, clientStream);
    return {
      id,
      clientStream,
    };
  }

  removeClientStream(id) {
    this.clientStreams.delete(id);
  }

  _executeSoxCommand(args) {
    return childProcess.spawn('sox', args);
  }

  async getBitrate(song) {
    try {
      const args = [
        '--i', //info
        '-B', //bitrate
        song,
      ];
      const { stdout, stderr, stdin } = this._executeSoxCommand(args);
      await Promise.all([once(stdout, 'readable'), once(stderr, 'readable')]);
      const [success, error] = [stdout, stderr].map((stream) => stream.read());
      if (error) return await Promise.reject(error);
      return success.toString().trim().replace(/k/, '000');
    } catch (error) {
      logger.error(error);
      return fallBackBitrate;
    }
  }

  broadCast() {
    return new Writable({
      write: (chunk, encoding, callback) => {
        for (const [key, stream] of this.clientStreams) {
          //se o cliente desconectou
          if (stream.writableEnded) {
            this.clientStreams.delete(key);
            continue;
          }
          stream.write(chunk);
        }
        callback();
      },
    });
  }

  async startStreaming() {
    logger.info(`Starting stream with ${this.currentSong}`);

    const bitrate = (await this.getBitrate(this.currentSong)) / biteRateDivisor;
    this.currentBitRate = bitrate;

    this.throttleTransform = new Throttle(bitrate);
    const throttleTransform = this.throttleTransform;
    const songReadable = this.createFileStream(this.currentSong);
    this.currentReadable = songReadable;
    return streamsPromises.pipeline(
      songReadable,
      throttleTransform,
      this.broadCast()
    );
  }

  stopStreaming() {
    this.throttleTransform?.end?.();
  }

  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  async getFileInfo(file) {
    //file = home/index.html
    const fullFilePath = join(publicDirectory, file);
    //valida se existe
    await fsPromises.access(fullFilePath);
    const fileType = extname(fullFilePath);
    return {
      type: fileType,
      name: fullFilePath,
    };
  }

  async getFileStream(file) {
    const { name, type } = await this.getFileInfo(file);
    return {
      stream: this.createFileStream(name),
      type,
    };
  }
}

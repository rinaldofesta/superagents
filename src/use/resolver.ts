/**
 * Blueprint source resolver — handles local files and URL downloads
 */

// Node.js built-ins
import { createWriteStream } from 'fs';
import os from 'os';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

export type BlueprintSource =
  | { type: 'local'; path: string }
  | { type: 'url'; url: string };

const MAX_DOWNLOAD_SIZE = 10 * 1024 * 1024; // 10MB

export function parseSource(input: string): BlueprintSource {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return { type: 'url', url: input };
  }
  return { type: 'local', path: input };
}

export async function resolveToLocalPath(source: BlueprintSource): Promise<string> {
  if (source.type === 'local') {
    return path.resolve(source.path);
  }

  const response = await fetch(source.url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_DOWNLOAD_SIZE) {
    throw new Error(`Blueprint too large (${contentLength} bytes). Maximum is 10MB.`);
  }

  const tempPath = path.join(os.tmpdir(), `superagents-blueprint-${Date.now()}.zip`);
  const body = response.body;
  if (!body) {
    throw new Error('Empty response body');
  }

  const nodeStream = Readable.fromWeb(body as import('stream/web').ReadableStream);
  await pipeline(nodeStream, createWriteStream(tempPath));

  return tempPath;
}

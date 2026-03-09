import * as fs from 'fs';
import * as path from 'path';
import { FormattedOutput, WriteOptions } from './types';

export class FileWriterError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'FileWriterError';
  }
}

export async function writeToFile(
  data: string | FormattedOutput,
  filePath: string,
  options: WriteOptions = {}
): Promise<void> {
  const encoding = options.encoding || 'utf-8';
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  try {
    const directory = path.dirname(filePath);
    await fs.promises.mkdir(directory, { recursive: true });
    await fs.promises.writeFile(filePath, content, { encoding });
  } catch (error) {
    if (error instanceof Error) {
      throw new FileWriterError(
        `Failed to write to file: ${filePath}`,
        filePath,
        error
      );
    }
    throw error;
  }
}

export function writeToFileSync(
  data: string | FormattedOutput,
  filePath: string,
  options: WriteOptions = {}
): void {
  const encoding = options.encoding || 'utf-8';
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  try {
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    fs.writeFileSync(filePath, content, { encoding });
  } catch (error) {
    if (error instanceof Error) {
      throw new FileWriterError(
        `Failed to write to file: ${filePath}`,
        filePath,
        error
      );
    }
    throw error;
  }
}

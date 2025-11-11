import glob from 'fast-glob';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { Config } from '../config/loadConfig.js';

export interface FileInfo {
  path: string;
  content: string;
}

export class FileScanner {
  constructor(private config: Config, private logger: any) {}

  async scan(): Promise<FileInfo[]> {
    const ignorePatterns = [...this.config.ignorePatterns];
    if (existsSync(this.config.ignoreFile)) {
      const ignoreContent = await readFile(this.config.ignoreFile, 'utf-8');
      const patterns = ignoreContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
      ignorePatterns.push(...patterns);
    }

    const files = await glob(this.config.sourceGlob, {
      cwd: process.cwd(),
      ignore: ignorePatterns,
    });

    this.logger.verbose(`Found ${files.length} files to scan.`);

    return Promise.all(
      files.map(async (file) => ({
        path: file,
        content: await readFile(file, 'utf-8'),
      }))
    );
  }
}
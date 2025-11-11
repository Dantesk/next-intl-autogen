export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  VERBOSE = 3,
}

export class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  error(message: string): void {
    if (this.level >= LogLevel.ERROR) console.error(`[ERROR] ${message}`);
  }

  warn(message: string): void {
    if (this.level >= LogLevel.WARN) console.warn(`[WARN] ${message}`);
  }

  info(message: string): void {
    if (this.level >= LogLevel.INFO) console.log(`[INFO] ${message}`);
  }

  verbose(message: string): void {
    if (this.level >= LogLevel.VERBOSE) console.log(`[VERBOSE] ${message}`);
  }
}
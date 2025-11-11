import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel } from '../src/utils/Logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logger = new Logger();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should set log level', () => {
    logger.setLevel(LogLevel.ERROR);
    expect(logger).toBeDefined();
  });

  it('should log error messages at ERROR level', () => {
    logger.setLevel(LogLevel.ERROR);
    logger.error('Test error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Test error');
  });

  it('should log warn messages at WARN level', () => {
    logger.setLevel(LogLevel.WARN);
    logger.warn('Test warning');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Test warning');
  });

  it('should log info messages at INFO level', () => {
    logger.setLevel(LogLevel.INFO);
    logger.info('Test info');
    expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] Test info');
  });

  it('should log verbose messages at VERBOSE level', () => {
    logger.setLevel(LogLevel.VERBOSE);
    logger.verbose('Test verbose');
    expect(consoleLogSpy).toHaveBeenCalledWith('[VERBOSE] Test verbose');
  });

  it('should not log warn when level is ERROR', () => {
    logger.setLevel(LogLevel.ERROR);
    logger.warn('Test warning');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should not log info when level is WARN', () => {
    logger.setLevel(LogLevel.WARN);
    logger.info('Test info');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should not log verbose when level is INFO', () => {
    logger.setLevel(LogLevel.INFO);
    logger.verbose('Test verbose');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
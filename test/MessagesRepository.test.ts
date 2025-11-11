import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileMessagesRepository } from '../src/core/MessagesRepository';
import { Config } from '../src/config/loadConfig';
import { writeFileSync, existsSync, unlinkSync, rmSync } from 'fs';
import { join } from 'path';

const testConfig: Config = {
  localesDir: './test-messages',
  defaultLocale: 'it',
  locales: ['it', 'en'],
  sourceGlob: [],
  namespaceStrategy: 'byFolder',
  keyStrategy: 'elementType_slug',
  dryRun: false,
  ignoreFilesUsingTranslations: true,
  placeholderTemplate: 'TODO: {text}',
  ignorePatterns: [],
  ignoreFile: '.next-intl-autogenignore',
};

describe('MessagesRepository', () => {
  let repo: FileMessagesRepository;

  beforeEach(() => {
    repo = new FileMessagesRepository(testConfig);
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(testConfig.localesDir)) {
      rmSync(testConfig.localesDir, { recursive: true });
    }
  });

  it('adds translation idempotently', () => {
    repo.addTranslation('common', 'title', 'Hello', 'it');
    let messages = repo.loadMessages('it');
    expect(messages.common.title).toBe('Hello');

    // Add again, should not change
    repo.addTranslation('common', 'title', 'Hello', 'it');
    messages = repo.loadMessages('it');
    expect(messages.common.title).toBe('Hello');
  });
});
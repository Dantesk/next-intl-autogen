import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileMessagesRepository } from '../src/core/MessagesRepository';
import { Config } from '../src/config/loadConfig';
import { existsSync, rmSync } from 'fs';

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

  it('creates directory if it does not exist', () => {
    // First add a translation to create the directory
    repo.addTranslation('common', 'title', 'Hello', 'it');
    expect(existsSync(testConfig.localesDir)).toBe(true);
  });

  it('saves messages for non-default locale with placeholder', () => {
    repo.addTranslation('common', 'title', 'Hello', 'en'); // en is not default locale (it)
    const messages = repo.loadMessages('en');
    expect(messages.common.title).toBe('TODO: Hello');
  });
});
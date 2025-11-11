import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { Config } from '../config/loadConfig.js';

export interface IMessagesRepository {
  loadMessages(locale: string): Record<string, any>;
  saveMessages(locale: string, messages: Record<string, any>): void;
  addTranslation(namespace: string, key: string, text: string, locale: string): void;
}

export class FileMessagesRepository implements IMessagesRepository {
  constructor(private config: Config) {}

  loadMessages(locale: string): Record<string, any> {
    const filePath = join(this.config.localesDir, `${locale}.json`);
    if (!existsSync(filePath)) return {};
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  }

  saveMessages(locale: string, messages: Record<string, any>): void {
    const filePath = join(this.config.localesDir, `${locale}.json`);
    const dir = dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, JSON.stringify(messages, null, 2));
  }

  addTranslation(namespace: string, key: string, text: string, locale: string): void {
    const messages = this.loadMessages(locale);
    if (!messages[namespace]) messages[namespace] = {};
    if (!messages[namespace][key]) { // Idempotent: only add if not exists
      messages[namespace][key] = locale === this.config.defaultLocale ? text : this.config.placeholderTemplate.replace('{text}', text);
      this.saveMessages(locale, messages);
    }
  }
}
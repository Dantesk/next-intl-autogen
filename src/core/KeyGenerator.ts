import { basename, dirname } from 'path';
import { ExtractedText } from './TextExtractor.js';

export interface KeyGenerationContext {
  filePath: string;
  jsxElementName: string;
  rawText: string;
  indexInFile: number;
}

export interface GeneratedKey {
  namespace: string;
  key: string;
}

export interface IKeyGenerator {
  generateKey(ctx: KeyGenerationContext): GeneratedKey;
}

export class DefaultKeyGenerator implements IKeyGenerator {
  generateKey(ctx: KeyGenerationContext): GeneratedKey {
    const namespace = this.generateNamespace(ctx.filePath);
    const key = this.generateKeyName(ctx);
    return { namespace, key };
  }

  private generateNamespace(filePath: string): string {
    const dir = dirname(filePath);
    const parts = dir.split('/');
    return parts[parts.length - 1] || 'common';
  }

  private generateKeyName(ctx: KeyGenerationContext): string {
    const words = ctx.rawText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const camel = words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');
    return `${ctx.jsxElementName}_${camel}`;
  }
}
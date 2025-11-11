import * as babel from '@babel/core';
import * as t from '@babel/types';
import { FileInfo } from './FileScanner.js';
import { Config } from '../config/loadConfig.js';

export interface ExtractedText {
  filePath: string;
  rawText: string;
  jsxElementName: string;
  indexInFile: number;
  start: number;
  end: number;
}

export class TextExtractor {
  constructor(private config: Config, private logger: any) {}

  extract(file: FileInfo): ExtractedText[] {
    if (this.config.ignoreFilesUsingTranslations && this.usesTranslations(file.content)) {
      this.logger.verbose(`Skipping ${file.path} as it already uses translations.`);
      return [];
    }

    const texts: ExtractedText[] = [];
    const ast = babel.parse(file.content, {
      sourceType: 'module',
      presets: ['@babel/preset-react', '@babel/preset-typescript'],
      filename: file.path,
    });

    if (!ast) return texts;

    const isTechnicalString = (text: string): boolean => {
      return /^\s*$/.test(text) || /^[0-9\s\-.]+$/.test(text);
    };

    babel.traverse(ast, {
      JSXText: (path: babel.NodePath<t.JSXText>) => {
        const text = path.node.value.trim();
        if (text && !isTechnicalString(text)) {
          const parent = path.parent;
          const elementName = parent.type === 'JSXElement' ? (parent.openingElement.name as any).name : 'unknown';
          texts.push({
            filePath: file.path,
            rawText: text,
            jsxElementName: elementName,
            indexInFile: texts.length,
            start: path.node.start!,
            end: path.node.end!,
          });
        }
      },
    });

    return texts;
  }

  private usesTranslations(content: string): boolean {
    return content.includes('useTranslations') || content.includes('t(');
  }

  private isTechnicalString(text: string): boolean {
    // Simple heuristic: ignore if contains only spaces, numbers, or common technical patterns
    return /^\s*$/.test(text) || /^[0-9\s\-.]+$/.test(text);
  }
}
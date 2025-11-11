import { FileInfo } from './FileScanner.js';
import { ExtractedText } from './TextExtractor.js';
import { GeneratedKey } from './KeyGenerator.js';

export interface TextReplacement {
  start: number;
  end: number;
  replacement: string;
}

export class CodeTransformer {
  transform(file: FileInfo, replacements: Map<ExtractedText, GeneratedKey>): string {
    let code = file.content;
    const sortedReplacements = Array.from(replacements.entries()).sort((a, b) => b[0].start - a[0].start);

    for (const [text, key] of sortedReplacements) {
      const replacement = `t('${key.namespace}.${key.key}')`;
      code = code.slice(0, text.start) + replacement + code.slice(text.end);
    }

    // Add import and useTranslations if needed
    if (sortedReplacements.length > 0) {
      code = this.addImportsAndHook(code);
    }

    return code;
  }

  private addImportsAndHook(code: string): string {
    // Simple heuristic: add at top
    const importLine = "import { useTranslations } from 'next-intl';\n";
    const hookLine = "const t = useTranslations('common');\n"; // Assume common namespace

    if (!code.includes(importLine.trim())) {
      code = importLine + code;
    }
    // For simplicity, assume adding after imports if hook not present
    if (!code.includes(hookLine.trim())) {
      const lines = code.split('\n');
      const firstNonImport = lines.findIndex(line => !line.startsWith('import'));
      lines.splice(firstNonImport, 0, '', hookLine);
      code = lines.join('\n');
    }
    return code;
  }
}
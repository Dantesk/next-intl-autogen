import { describe, it, expect } from 'vitest';
import { TextExtractor } from '../src/core/TextExtractor';
import { Config } from '../src/config/loadConfig';
import { Logger } from '../src/utils/Logger';

const testConfig: Config = {
  localesDir: './messages',
  defaultLocale: 'it',
  locales: ['it'],
  sourceGlob: [],
  namespaceStrategy: 'byFolder',
  keyStrategy: 'elementType_slug',
  dryRun: false,
  ignoreFilesUsingTranslations: true,
  placeholderTemplate: 'TODO: {text}',
  ignorePatterns: [],
  ignoreFile: '.next-intl-autogenignore',
};

describe('TextExtractor', () => {
  const logger = new Logger();
  const extractor = new TextExtractor(testConfig, logger);

  it('extracts text from JSX', () => {
    const file = {
      path: 'test.tsx',
      content: `export default function Page() { return <h1>Hello World</h1>; }`,
    };
    const texts = extractor.extract(file);
    expect(texts).toHaveLength(1);
    expect(texts[0].rawText).toBe('Hello World');
    expect(texts[0].jsxElementName).toBe('h1');
  });

  it('skips files with useTranslations', () => {
    const file = {
      path: 'test.tsx',
      content: `import { useTranslations } from 'next-intl'; export default function Page() { const t = useTranslations(); return <h1>Hello</h1>; }`,
    };
    const texts = extractor.extract(file);
    expect(texts).toHaveLength(0);
  });

  it('ignores technical strings with numbers and symbols', () => {
    const file = {
      path: 'test.tsx',
      content: `export default function Page() { return <span>123-456.789</span>; }`,
    };
    const texts = extractor.extract(file);
    expect(texts).toHaveLength(0);
  });

  it('ignores whitespace-only strings', () => {
    const file = {
      path: 'test.tsx',
      content: `export default function Page() { return <div>   </div>; }`,
    };
    const texts = extractor.extract(file);
    expect(texts).toHaveLength(0);
  });
});
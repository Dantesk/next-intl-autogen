import { describe, it, expect, beforeEach } from 'vitest';
import { KeyAnalyzer, IKeyAnalyzer, AnalysisReport } from '../src/core/KeyAnalyzer';
import { Config } from '../src/config/loadConfig';
import { Logger } from '../src/utils/Logger';

const testConfig: Config = {
  localesDir: './test-messages',
  defaultLocale: 'en',
  locales: ['en', 'fr', 'es'],
  sourceGlob: [],
  namespaceStrategy: 'byFolder',
  keyStrategy: 'elementType_slug',
  dryRun: false,
  ignoreFilesUsingTranslations: true,
  placeholderTemplate: 'TODO: {text}',
  ignorePatterns: [],
  ignoreFile: '.next-intl-autogenignore',
};

// Mock MessagesRepository
class MockMessagesRepository {
  private messages: Record<string, Record<string, any>> = {
    en: {
      common: {
        welcome: 'Welcome',
        goodbye: 'Goodbye',
        nested: {
          title: 'Title'
        }
      },
      dashboard: {
        title: 'Dashboard'
      }
    },
    fr: {
      common: {
        welcome: 'Bienvenue',
        // missing: goodbye
        nested: {
          title: 'Titre'
        }
      },
      dashboard: {
        title: 'Tableau de bord'
      }
      // missing: extra key in en
    },
    es: {
      common: {
        welcome: 'Bienvenido',
        goodbye: 'Adiós',
        nested: {
          title: 'Título'
        }
      },
      dashboard: {
        title: 'Panel'
      },
      extra: {
        onlyInSpanish: 'Solo en español'
      }
    }
  };

  loadMessages(locale: string): Record<string, any> {
    return this.messages[locale] || {};
  }
}

describe('KeyAnalyzer', () => {
  let analyzer: IKeyAnalyzer;
  let mockRepo: MockMessagesRepository;
  let logger: Logger;

  beforeEach(() => {
    mockRepo = new MockMessagesRepository();
    logger = new Logger();
    analyzer = new KeyAnalyzer(testConfig, mockRepo as any, logger);
  });

  it('should analyze keys correctly', () => {
    const report: AnalysisReport = analyzer.analyzeKeys();

    expect(report.referenceLocale).toBe('en');
    expect(report.results).toHaveLength(3);

    // Check reference locale (en)
    const enResult = report.results.find(r => r.locale === 'en')!;
    expect(enResult.totalKeys).toBe(4); // common.welcome, common.goodbye, common.nested.title, dashboard.title
    expect(enResult.missingKeys).toHaveLength(0);
    expect(enResult.extraKeys).toHaveLength(0);
    expect(enResult.completeness).toBe(100);

    // Check fr locale
    const frResult = report.results.find(r => r.locale === 'fr')!;
    expect(frResult.totalKeys).toBe(3); // missing common.goodbye
    expect(frResult.missingKeys).toContain('common.goodbye');
    expect(frResult.extraKeys).toHaveLength(0);
    expect(frResult.completeness).toBe(75); // 3 out of 4 keys

    // Check es locale
    const esResult = report.results.find(r => r.locale === 'es')!;
    expect(esResult.totalKeys).toBe(5); // has extra key
    expect(esResult.missingKeys).toHaveLength(0);
    expect(esResult.extraKeys).toContain('extra.onlyInSpanish');
    expect(esResult.completeness).toBe(100); // has all reference keys
  });

  it('should calculate overall completeness correctly', () => {
    const report: AnalysisReport = analyzer.analyzeKeys();

    expect(report.summary.totalKeysInReference).toBe(4);
    expect(report.summary.localesWithMissingKeys).toEqual(['fr']);
    // (75 + 100) / 2 = 87.5 (only non-reference locales)
    expect(report.summary.overallCompleteness).toBe(87.5);
  });

  it('should handle empty messages', () => {
    // Create analyzer with empty repo
    const emptyRepo = {
      loadMessages: () => ({})
    };
    const emptyAnalyzer = new KeyAnalyzer(testConfig, emptyRepo as any, logger);
    const report = emptyAnalyzer.analyzeKeys();

    expect(report.summary.totalKeysInReference).toBe(0);
    expect(report.summary.overallCompleteness).toBe(100); // No keys to translate
    report.results.forEach(result => {
      expect(result.totalKeys).toBe(0);
      expect(result.completeness).toBe(100);
    });
  });

  it('should flatten nested keys correctly', () => {
    const messages = {
      common: {
        simple: 'value',
        nested: {
          deep: 'value2',
          deeper: {
            key: 'value3'
          }
        }
      }
    };

    const analyzer = new KeyAnalyzer(testConfig, mockRepo as any, logger);
    const flattened = (analyzer as any).flattenKeys(messages);

    expect(flattened).toEqual([
      'common.simple',
      'common.nested.deep',
      'common.nested.deeper.key'
    ]);
  });
});
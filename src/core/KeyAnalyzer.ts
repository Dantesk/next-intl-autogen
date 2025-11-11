import { Config } from '../config/loadConfig.js';
import { IMessagesRepository } from './MessagesRepository.js';
import { Logger } from '../utils/Logger.js';

export interface KeyAnalysisResult {
  locale: string;
  totalKeys: number;
  missingKeys: string[];
  extraKeys: string[];
  completeness: number; // percentage
}

export interface AnalysisReport {
  referenceLocale: string;
  results: KeyAnalysisResult[];
  summary: {
    totalKeysInReference: number;
    overallCompleteness: number;
    localesWithMissingKeys: string[];
  };
}

export interface IKeyAnalyzer {
  analyzeKeys(): AnalysisReport;
}

export class KeyAnalyzer implements IKeyAnalyzer {
  constructor(
    private config: Config,
    private repo: IMessagesRepository,
    private logger: Logger
  ) {}

  analyzeKeys(): AnalysisReport {
    this.logger.info('Starting key analysis across locales...');

    // Load all messages for each locale
    const allMessages: Record<string, Record<string, any> | undefined> = {};
    for (const locale of this.config.locales) {
      allMessages[locale] = this.repo.loadMessages(locale) || {};
    }

    // Flatten all keys for each locale (namespace.key format)
    const flattenedKeys: Record<string, string[]> = {};
    for (const locale of this.config.locales) {
      flattenedKeys[locale] = this.flattenKeys(allMessages[locale]!);
    }

    // Use default locale as reference
    const referenceLocale = this.config.defaultLocale;
    const referenceKeys = new Set(flattenedKeys[referenceLocale]);

    this.logger.info(`Using ${referenceLocale} as reference locale with ${referenceKeys.size} keys`);

    // Analyze each locale against reference
    const results: KeyAnalysisResult[] = [];
    for (const locale of this.config.locales) {
      if (locale === referenceLocale) {
        results.push({
          locale,
          totalKeys: referenceKeys.size,
          missingKeys: [],
          extraKeys: [],
          completeness: 100
        });
        continue;
      }

      const localeKeys = new Set(flattenedKeys[locale]);
      const missingKeys = Array.from(referenceKeys).filter(key => !localeKeys.has(key));
      const extraKeys = Array.from(localeKeys).filter(key => !referenceKeys.has(key));

      const completeness = referenceKeys.size > 0
        ? ((referenceKeys.size - missingKeys.length) / referenceKeys.size) * 100
        : 100;

      results.push({
        locale,
        totalKeys: localeKeys.size,
        missingKeys,
        extraKeys,
        completeness: Math.round(completeness * 100) / 100
      });

      this.logger.verbose(`${locale}: ${localeKeys.size} keys, ${missingKeys.length} missing, ${extraKeys.length} extra`);
    }

    // Generate summary
    const localesWithMissingKeys = results
      .filter(r => r.locale !== referenceLocale && r.missingKeys.length > 0)
      .map(r => r.locale);

    const overallCompleteness = results
      .filter(r => r.locale !== referenceLocale)
      .reduce((sum, r) => sum + r.completeness, 0) / (this.config.locales.length - 1);

    const report: AnalysisReport = {
      referenceLocale,
      results,
      summary: {
        totalKeysInReference: referenceKeys.size,
        overallCompleteness: Math.round(overallCompleteness * 100) / 100,
        localesWithMissingKeys
      }
    };

    this.logger.info(`Analysis complete. Overall completeness: ${report.summary.overallCompleteness}%`);
    return report;
  }

  private flattenKeys(messages: Record<string, any>): string[] {
    const keys: string[] = [];

    for (const [namespace, namespaceData] of Object.entries(messages)) {
      if (typeof namespaceData === 'object' && namespaceData !== null) {
        this.flattenNamespaceKeys(namespace, namespaceData, keys);
      }
    }

    return keys;
  }

  private flattenNamespaceKeys(namespace: string, data: any, keys: string[], prefix = ''): void {
    for (const [key, value] of Object.entries(data)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Nested object, recurse
        this.flattenNamespaceKeys(namespace, value, keys, fullKey);
      } else {
        // Leaf value, add the key
        keys.push(`${namespace}.${fullKey}`);
      }
    }
  }
}
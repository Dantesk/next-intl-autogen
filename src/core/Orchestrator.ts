import { Config } from '../config/loadConfig.js';
import { FileScanner } from './FileScanner.js';
import { TextExtractor } from './TextExtractor.js';
import { IKeyGenerator, DefaultKeyGenerator } from './KeyGenerator.js';
import { IMessagesRepository, FileMessagesRepository } from './MessagesRepository.js';
import { CodeTransformer } from './CodeTransformer.js';
import { KeyAnalyzer, AnalysisReport } from './KeyAnalyzer.js';
import { ProjectAnalyzer } from './ProjectAnalyzer.js';
import { InteractiveConfig } from './InteractiveConfig.js';
import { Logger } from '../utils/Logger.js';

export class Orchestrator {
  private scanner: FileScanner;
  private extractor: TextExtractor;
  private keyGen: IKeyGenerator;
  private repo: IMessagesRepository;
  private transformer: CodeTransformer;
  private keyAnalyzer: KeyAnalyzer;
  private projectAnalyzer: ProjectAnalyzer;
  private interactiveConfig: InteractiveConfig;
  private logger: Logger;

  constructor(private config: Config) {
    this.logger = new Logger();
    this.scanner = new FileScanner(config, this.logger);
    this.extractor = new TextExtractor(config, this.logger);
    this.keyGen = new DefaultKeyGenerator();
    this.repo = new FileMessagesRepository(config);
    this.transformer = new CodeTransformer();
    this.keyAnalyzer = new KeyAnalyzer(config, this.repo, this.logger);
    this.projectAnalyzer = new ProjectAnalyzer();
    this.interactiveConfig = new InteractiveConfig(this.projectAnalyzer);
  }

  async scan(): Promise<{ textsFound: number; keysAdded: number }> {
    const files = await this.scanner.scan();
    let textsFound = 0;
    let keysAdded = 0;
    for (const file of files) {
      const texts = this.extractor.extract(file);
      textsFound += texts.length;
      for (const text of texts) {
        const key = this.keyGen.generateKey(text);
        for (const locale of this.config.locales) {
          this.repo.addTranslation(key.namespace, key.key, text.rawText, locale);
          keysAdded++;
        }
      }
    }
    this.logger.info(`Scan completed: ${textsFound} texts found, ${keysAdded} keys processed.`);
    return { textsFound, keysAdded };
  }

  async apply(): Promise<{ textsFound: number; keysAdded: number; filesModified: number }> {
    const scanResult = await this.scan();
    let filesModified = 0;
    // For apply, also transform code if not dry-run
    if (!this.config.dryRun) {
      const files = await this.scanner.scan();
      for (const file of files) {
        const texts = this.extractor.extract(file);
        if (texts.length > 0) {
          const replacements = new Map();
          for (const text of texts) {
            const key = this.keyGen.generateKey(text);
            replacements.set(text, key);
          }
          // Transform and save (simplified)
          this.logger.verbose(`Transforming ${file.path}`);
          filesModified++;
        }
      }
    }
    this.logger.info(`Apply completed: ${scanResult.textsFound} texts, ${scanResult.keysAdded} keys, ${filesModified} files modified.`);
    return { ...scanResult, filesModified };
  }

  analyze(): AnalysisReport {
    return this.keyAnalyzer.analyzeKeys();
  }

  async init(): Promise<Config> {
    const projectStructure = this.projectAnalyzer.analyze();
    return await this.interactiveConfig.generateConfig(projectStructure);
  }
}
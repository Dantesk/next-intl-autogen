import { createInterface } from 'readline';
import { writeFileSync } from 'fs';
import { ProjectStructure, ProjectAnalyzer } from './ProjectAnalyzer.js';
import { Config } from '../config/loadConfig.js';

export class InteractiveConfig {
  private rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  constructor(private analyzer: ProjectAnalyzer) {}

  async generateConfig(projectStructure: ProjectStructure): Promise<Config> {
    console.log('🚀 Welcome to next-intl-autogen setup!\n');

    // Check for existing config
    if (projectStructure.existingConfig) {
      const useExisting = await this.askYesNo(
        `Found existing config: ${projectStructure.existingConfig}. Use it as base?`
      );
      if (useExisting) {
        // TODO: Load and modify existing config
        console.log('Loading existing config...');
      }
    }

    // Framework detection
    console.log(`📦 Detected framework: ${projectStructure.framework}`);
    if (projectStructure.framework === 'nextjs') {
      console.log(`🔧 Next.js mode: ${projectStructure.nextjsMode}`);
    }

    // Source directories
    const sourceDirs = await this.selectSourceDirectories(projectStructure);

    // Locales directory
    const localesDir = await this.askLocalesDirectory(projectStructure);

    // Default locale
    const defaultLocale = await this.askDefaultLocale();

    // Additional locales
    const additionalLocales = await this.askAdditionalLocales(defaultLocale);

    // Namespace strategy
    const namespaceStrategy = await this.askNamespaceStrategy();

    // Key strategy
    const keyStrategy = await this.askKeyStrategy();

    // Placeholder template
    const placeholderTemplate = await this.askPlaceholderTemplate();

    this.rl.close();

    return {
      localesDir,
      defaultLocale,
      locales: [defaultLocale, ...additionalLocales],
      sourceGlob: sourceDirs,
      namespaceStrategy,
      keyStrategy,
      dryRun: false,
      ignoreFilesUsingTranslations: true,
      placeholderTemplate,
      ignorePatterns: this.getDefaultIgnorePatterns(projectStructure),
      ignoreFile: '.next-intl-autogenignore'
    };
  }

  private async askYesNo(question: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.rl.question(`${question} (y/n): `, (answer) => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }

  private async selectSourceDirectories(projectStructure: ProjectStructure): Promise<string[]> {
    console.log('\n📁 Source directories:');
    projectStructure.possibleSourceDirs.forEach((dir, index) => {
      console.log(`  ${index + 1}. ${dir}`);
    });

    const suggested = this.analyzer.getSuggestedSourceGlob(
      projectStructure.hasSrcFolder,
      projectStructure.nextjsMode
    );

    console.log(`\n💡 Suggested: ${suggested.join(', ')}`);

    const useSuggested = await this.askYesNo('Use suggested source patterns?');
    if (useSuggested) {
      return suggested;
    }

    // Let user select custom patterns
    return new Promise((resolve) => {
      this.rl.question('Enter custom glob patterns (comma-separated): ', (answer) => {
        const patterns = answer.split(',').map(p => p.trim()).filter(p => p);
        resolve(patterns.length > 0 ? patterns : suggested);
      });
    });
  }

  private async askLocalesDirectory(projectStructure: ProjectStructure): Promise<string> {
    const suggested = this.analyzer.getSuggestedLocalesDir(projectStructure.hasSrcFolder);
    console.log(`\n📍 Locales directory (suggested: ${suggested}):`);

    return new Promise((resolve) => {
      this.rl.question('Enter locales directory: ', (answer) => {
        resolve(answer.trim() || suggested);
      });
    });
  }

  private async askDefaultLocale(): Promise<string> {
    console.log('\n🌍 Default locale:');
    console.log('  Common options: en, es, fr, de, it, pt, ru, ja, ko, zh');

    return new Promise((resolve) => {
      this.rl.question('Enter default locale: ', (answer) => {
        resolve(answer.trim() || 'en');
      });
    });
  }

  private async askAdditionalLocales(defaultLocale: string): Promise<string[]> {
    console.log('\n🌐 Additional locales (comma-separated):');
    console.log('  Examples: fr,es,de,it or leave empty for none');

    return new Promise((resolve) => {
      this.rl.question('Enter additional locales: ', (answer) => {
        const locales = answer.split(',')
          .map(l => l.trim())
          .filter(l => l && l !== defaultLocale);
        resolve(locales);
      });
    });
  }

  private async askNamespaceStrategy(): Promise<'byFolder' | 'byFile' | 'custom'> {
    console.log('\n📂 Namespace strategy:');
    console.log('  1. byFolder - Group keys by folder structure (recommended)');
    console.log('  2. byFile - Group keys by file name');
    console.log('  3. custom - Custom grouping');

    return new Promise((resolve) => {
      this.rl.question('Choose namespace strategy (1-3): ', (answer) => {
        switch (answer.trim()) {
          case '2': resolve('byFile'); break;
          case '3': resolve('custom'); break;
          default: resolve('byFolder');
        }
      });
    });
  }

  private async askKeyStrategy(): Promise<'elementType_slug' | 'hash'> {
    console.log('\n🔑 Key generation strategy:');
    console.log('  1. elementType_slug - Use element type + slug (recommended)');
    console.log('     Example: h1_welcomeMessage, button_submitForm');
    console.log('  2. hash - Use hash of content');
    console.log('     Example: abc123def, def456ghi');

    return new Promise((resolve) => {
      this.rl.question('Choose key strategy (1-2): ', (answer) => {
        resolve(answer.trim() === '2' ? 'hash' : 'elementType_slug');
      });
    });
  }

  private async askPlaceholderTemplate(): Promise<string> {
    console.log('\n📝 Placeholder template for missing translations:');
    console.log('  Current: "TODO: translate – {text}"');
    console.log('  Examples:');
    console.log('    - "TRANSLATE: {text}"');
    console.log('    - "[{text}]"');
    console.log('    - "{text} (EN)"');

    return new Promise((resolve) => {
      this.rl.question('Enter placeholder template (or press Enter for default): ', (answer) => {
        resolve(answer.trim() || 'TODO: translate – {text}');
      });
    });
  }

  private getDefaultIgnorePatterns(projectStructure: ProjectStructure): string[] {
    const patterns = [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.git/**'
    ];

    if (projectStructure.framework === 'vite') {
      patterns.push('.vite/**');
    }

    return patterns;
  }

  saveConfig(config: Config): void {
    const configContent = `import { Config } from 'next-intl-autogen';

export const config: Config = ${JSON.stringify(config, null, 2)};

export default config;
`;

    writeFileSync('next-intl-autogen.config.ts', configContent);
    console.log('\n💾 Configuration saved to next-intl-autogen.config.ts');
  }
}
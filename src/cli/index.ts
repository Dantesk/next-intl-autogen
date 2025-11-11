#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig } from '../config/loadConfig.js';
import { Orchestrator } from '../core/Orchestrator.js';
import { InteractiveConfig } from '../core/InteractiveConfig.js';
import { ProjectAnalyzer } from '../core/ProjectAnalyzer.js';
import { Logger, LogLevel } from '../utils/Logger.js';

const program = new Command();

program
  .name('next-intl-autogen')
  .description('CLI tool to automate translation extraction for Next.js projects using next-intl')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan files and update JSON messages')
  .option('--dry-run', 'Run without making changes')
  .option('--verbose', 'Enable verbose logging')
  .option('--locales-dir <dir>', 'Directory for locale files')
  .option('--source-glob <glob>', 'Glob pattern for source files')
  .action(async (options: { dryRun?: boolean; verbose?: boolean; localesDir?: string; sourceGlob?: string }) => {
    try {
      const config = await loadConfig();
      const mergedConfig = { ...config, ...options, sourceGlob: options.sourceGlob ? [options.sourceGlob] : config.sourceGlob };
      const logger = new Logger();
      if (options.verbose) logger.setLevel(LogLevel.VERBOSE);
      const orchestrator = new Orchestrator(mergedConfig);
      await orchestrator.scan();
      process.exit(0);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('apply')
  .description('Scan, update JSON, and transform code')
  .option('--dry-run', 'Run without making changes')
  .option('--verbose', 'Enable verbose logging')
  .option('--locales-dir <dir>', 'Directory for locale files')
  .option('--source-glob <glob>', 'Glob pattern for source files')
  .action(async (options: { dryRun?: boolean; verbose?: boolean; localesDir?: string; sourceGlob?: string }) => {
    try {
      const config = await loadConfig();
      const mergedConfig = { ...config, ...options, sourceGlob: options.sourceGlob ? [options.sourceGlob] : config.sourceGlob };
      const logger = new Logger();
      if (options.verbose) logger.setLevel(LogLevel.VERBOSE);
      const orchestrator = new Orchestrator(mergedConfig);
      await orchestrator.apply();
      process.exit(0);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze translation keys completeness across locales')
  .option('--verbose', 'Enable verbose logging')
  .option('--locales-dir <dir>', 'Directory for locale files')
  .action(async (options: { verbose?: boolean; localesDir?: string }) => {
    try {
      const config = await loadConfig();
      const mergedConfig = { ...config, ...options };
      const logger = new Logger();
      if (options.verbose) logger.setLevel(LogLevel.VERBOSE);
      const orchestrator = new Orchestrator(mergedConfig);
      const report = orchestrator.analyze();

      // Display results
      console.log(`\n📊 Translation Keys Analysis Report`);
      console.log(`Reference locale: ${report.referenceLocale}`);
      console.log(`Total keys in reference: ${report.summary.totalKeysInReference}`);
      console.log(`Overall completeness: ${report.summary.overallCompleteness}%`);
      console.log(`Locales with missing keys: ${report.summary.localesWithMissingKeys.join(', ') || 'None'}`);

      console.log(`\n📋 Detailed Results:`);
      for (const result of report.results) {
        console.log(`\n${result.locale}:`);
        console.log(`  Total keys: ${result.totalKeys}`);
        console.log(`  Completeness: ${result.completeness}%`);

        if (result.missingKeys.length > 0) {
          console.log(`  ❌ Missing keys (${result.missingKeys.length}):`);
          result.missingKeys.slice(0, 10).forEach(key => console.log(`    - ${key}`));
          if (result.missingKeys.length > 10) {
            console.log(`    ... and ${result.missingKeys.length - 10} more`);
          }
        }

        if (result.extraKeys.length > 0) {
          console.log(`  ⚠️  Extra keys (${result.extraKeys.length}):`);
          result.extraKeys.slice(0, 10).forEach(key => console.log(`    - ${key}`));
          if (result.extraKeys.length > 10) {
            console.log(`    ... and ${result.extraKeys.length - 10} more`);
          }
        }
      }

      // Exit with error code if there are missing keys
      const hasMissingKeys = report.results.some(r => r.missingKeys.length > 0);
      process.exit(hasMissingKeys ? 1 : 0);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize next-intl-autogen configuration interactively')
  .action(async () => {
    try {
      // Use a minimal config for initialization
      const tempConfig = {
        localesDir: './messages',
        defaultLocale: 'en',
        locales: ['en'],
        sourceGlob: ['**/*.{ts,tsx,js,jsx}'],
        namespaceStrategy: 'byFolder' as const,
        keyStrategy: 'elementType_slug' as const,
        dryRun: false,
        ignoreFilesUsingTranslations: true,
        placeholderTemplate: 'TODO: translate – {text}',
        ignorePatterns: ['node_modules/**'],
        ignoreFile: '.next-intl-autogenignore'
      };

      const orchestrator = new Orchestrator(tempConfig);
      const config = await orchestrator.init();

      // Save the config to file
      const analyzer = new ProjectAnalyzer();
      const interactiveConfig = new InteractiveConfig(analyzer);
      interactiveConfig.saveConfig(config);

      console.log('\n🚀 Ready to use!');
      console.log('Try running:');
      console.log('  next-intl-autogen scan');
      console.log('  next-intl-autogen analyze');

      process.exit(0);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
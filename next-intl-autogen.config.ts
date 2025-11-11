import { z } from 'zod';

export const ConfigSchema = z.object({
  localesDir: z.string().default('./messages'),
  defaultLocale: z.string().default('en'),
  locales: z.array(z.string()).default(['en', 'fr']),
  sourceGlob: z.array(z.string()).default(['app/**/*.{ts,tsx,js,jsx}']),
  namespaceStrategy: z.enum(['byFolder', 'byFile', 'custom']).default('byFolder'),
  keyStrategy: z.enum(['elementType_slug', 'hash']).default('elementType_slug'),
  dryRun: z.boolean().default(false),
  ignoreFilesUsingTranslations: z.boolean().default(true),
  placeholderTemplate: z.string().default('TODO: translate – {text}'),
  ignorePatterns: z.array(z.string()).default(['node_modules/**', '.next/**', 'dist/**', 'coverage/**']),
  ignoreFile: z.string().default('.next-intl-autogenignore'),
});

export type Config = z.infer<typeof ConfigSchema>;

// This is kept for backward compatibility but not used internally
export const defaultConfig: Config = {
  localesDir: './messages',
  defaultLocale: 'en',
  locales: ['en', 'fr'],
  sourceGlob: ['app/**/*.{ts,tsx,js,jsx}'],
  namespaceStrategy: 'byFolder',
  keyStrategy: 'elementType_slug',
  dryRun: false,
  ignoreFilesUsingTranslations: true,
  placeholderTemplate: 'TODO: translate – {text}',
  ignorePatterns: ['node_modules/**', '.next/**', 'dist/**', 'coverage/**'],
  ignoreFile: '.next-intl-autogenignore',
};
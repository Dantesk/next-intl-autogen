# next-intl-autogen

A CLI tool to automate translation extraction for Next.js projects using next-intl. It scans your source files, extracts hardcoded strings from JSX elements, generates i18n keys, updates JSON message files, and optionally transforms code to use `useTranslations`.

## Features

- **Automatic Extraction**: Scans TypeScript/JSX files and extracts hardcoded text from JSX elements.
- **Smart Key Generation**: Generates context-aware keys based on file path, element type, and text content.
- **Idempotent Operations**: Multiple runs don't create duplicates or unnecessary changes.
- **Safety First**: Supports dry-run mode, ignores already-internationalized files, and provides clear logging.
- **Monorepo Support**: Works with relative paths and custom ignore patterns.
- **CI Ready**: Provides meaningful exit codes and verbose output for automation.

## Installation

### Global Installation

```bash
npm install -g next-intl-autogen
```

### Local Installation (for development)

```bash
git clone <repository-url>
cd next-intl-autogen
npm install
npm run build
npm link
```

## Usage

### Commands

#### Initialize Configuration

Set up next-intl-autogen configuration interactively for your project.

```bash
next-intl-autogen init
```

This command will:
- **Auto-detect** your project structure (Next.js App/Pages Router, src folder, etc.)
- **Ask intelligent questions** about your preferred settings
- **Generate** a `next-intl-autogen.config.ts` file with optimal defaults
- **Set up** appropriate ignore patterns and source directories

**What it detects:**
- Framework (Next.js, Vite, or other)
- Next.js mode (App Router vs Pages Router)
- Project structure (src folder, component directories)
- Existing configuration files
- next-intl dependency

**Questions asked:**
- Source directories to scan
- Locales directory location
- Default locale and additional locales
- Key generation strategy
- Translation placeholder template

#### Scan Files and Update Messages

Scans source files and updates JSON message files without modifying code.

```bash
next-intl-autogen scan [options]
```

#### Scan, Update Messages, and Transform Code

Scans, updates messages, and transforms code to use `useTranslations`.

```bash
next-intl-autogen apply [options]
```

#### Analyze Translation Completeness

Analyzes translation keys completeness across all locale files and reports missing or extra keys.

```bash
next-intl-autogen analyze [options]
```

### Options

- `--dry-run`: Simulate operations without making changes
- `--verbose`: Enable verbose logging
- `--locales-dir <dir>`: Directory for locale files (default: './messages')
- `--source-glob <glob>`: Glob pattern for source files (default: 'app/**/*.{ts,tsx,js,jsx}')

## Configuration

Create a `next-intl-autogen.config.ts` file in your project root:

```typescript
import { Config } from 'next-intl-autogen';

export const config: Config = {
  localesDir: './messages',
  defaultLocale: 'en',
  locales: ['en', 'fr'],
  sourceGlob: ['app/**/*.{ts,tsx,js,jsx}'],
  namespaceStrategy: 'byFolder', // 'byFolder' | 'byFile' | 'custom'
  keyStrategy: 'elementType_slug', // 'elementType_slug' | 'hash'
  dryRun: false,
  ignoreFilesUsingTranslations: true,
  placeholderTemplate: 'TODO: translate – {text}',
  ignorePatterns: ['node_modules/**', '.next/**', 'dist/**', 'coverage/**'],
  ignoreFile: '.next-intl-autogenignore',
};

export default config;
```

### Ignore File

Create a `.next-intl-autogenignore` file to exclude specific files/directories:

```
# Ignore build outputs
dist/
.next/

# Ignore specific files
src/components/OldComponent.tsx

# Ignore patterns
**/test/**
```

## Examples

### Basic Usage

1. Set up your Next.js project with next-intl.

2. Create configuration file.

3. Run scan to extract translations:

```bash
next-intl-autogen scan --verbose
```

This will:
- Scan `app/**/*.{ts,tsx,js,jsx}` files
- Extract hardcoded strings from JSX elements
- Generate keys like `dashboard.h1_welcomeToTheDashboard`
- Update `messages/en.json` and `messages/fr.json`

### Dry Run

Test what would happen without making changes:

```bash
next-intl-autogen scan --dry-run --verbose
```

### Transform Code

Apply transformations to use `useTranslations`:

```bash
next-intl-autogen apply
```

This adds imports and hooks, replacing hardcoded text with `t('key')`.

### Before and After

**Before:**
```tsx
export default function Dashboard() {
  return <h1>Welcome to the dashboard</h1>;
}
```

**After:**
```tsx
import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const t = useTranslations('dashboard');
  return <h1>{t('h1_welcomeToTheDashboard')}</h1>;
}
```

## Key Generation Rules

- **Namespace**: Derived from file path (e.g., `app/dashboard/page.tsx` → `dashboard`)
- **Key**: Element type + camelCase text (e.g., `h1_welcomeToTheDashboard`)

## Safety Features

- Skips files already using `useTranslations` or `t()`
- Idempotent: running multiple times doesn't duplicate entries
- Dry-run mode for safe testing
- Clear logging with error/warn/info/verbose levels
- Exit codes: 0 (success), 1 (error)

### Analyze Translation Completeness

Check if all translation keys are present across locales:

```bash
next-intl-autogen analyze --verbose
```

Example output:
```
📊 Translation Keys Analysis Report
Reference locale: en
Total keys in reference: 4
Overall completeness: 75%
Locales with missing keys: fr

📋 Detailed Results:

en:
  Total keys: 4
  Completeness: 100%

fr:
  Total keys: 3
  Completeness: 75%
  ❌ Missing keys (1):
    - common.goodbye
```

## How to Use

### Quick Start

1. **Initialize configuration:**
```bash
next-intl-autogen init
```

2. **Extract translations from source files:**
```bash
next-intl-autogen scan
```

3. **Check translation completeness:**
```bash
next-intl-autogen analyze --verbose
```

4. **Translate missing keys** in the JSON files for each locale

5. **Apply code transformations** (optional):
```bash
next-intl-autogen apply
```

### Typical Workflow

1. **Extract translations from source files:**
```bash
next-intl-autogen scan
```

2. **Check translation completeness:**
```bash
next-intl-autogen analyze --verbose
```

3. **Translate missing keys** in the JSON files for each locale

4. **Apply code transformations** (optional):
```bash
next-intl-autogen apply
```

### CI/CD Integration

To ensure all translations are complete before deployment:

```bash
next-intl-autogen analyze || exit 1  # Fails if keys are missing
```

### Practical Examples

**Check a specific project:**
```bash
next-intl-autogen analyze --locales-dir ./src/messages --verbose
```

**Use in automation scripts:**
```bash
#!/bin/bash
next-intl-autogen scan --dry-run
if [ $? -eq 0 ]; then
  next-intl-autogen analyze
  if [ $? -eq 0 ]; then
    echo "✅ All translations are complete!"
  else
    echo "❌ Some translations are missing"
    exit 1
  fi
fi
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Running Locally

```bash
npm run dev scan -- --verbose
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT
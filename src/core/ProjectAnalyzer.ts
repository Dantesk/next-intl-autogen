import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export interface ProjectStructure {
  framework: 'nextjs' | 'vite' | 'other';
  nextjsMode?: 'app-router' | 'pages-router' | undefined;
  hasSrcFolder: boolean;
  possibleSourceDirs: string[];
  hasNextIntl: boolean;
  existingConfig?: string | undefined;
  packageJson: PackageJson;
}

export class ProjectAnalyzer {
  constructor(private projectRoot: string = process.cwd()) {}

  analyze(): ProjectStructure {
    const packageJson = this.readPackageJson();
    const framework = this.detectFramework(packageJson);
    const nextjsMode = framework === 'nextjs' ? this.detectNextjsMode() : undefined;
    const hasSrcFolder = existsSync(join(this.projectRoot, 'src'));
    const possibleSourceDirs = this.findPossibleSourceDirs(hasSrcFolder, nextjsMode);
    const hasNextIntl = this.detectNextIntl(packageJson);
    const existingConfig = this.findExistingConfig();

    const structure: ProjectStructure = {
      framework,
      nextjsMode,
      hasSrcFolder,
      possibleSourceDirs,
      hasNextIntl,
      existingConfig,
      packageJson
    };

    return structure;
  }

  private readPackageJson(): PackageJson {
    try {
      const packagePath = join(process.cwd(), 'package.json');
      const content = readFileSync(packagePath, 'utf-8');
      return JSON.parse(content) as PackageJson;
    } catch {
      return {};
    }
  }

  private detectFramework(packageJson: PackageJson): 'nextjs' | 'vite' | 'other' {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps?.['next']) {
      return 'nextjs';
    }
    if (deps?.['vite']) {
      return 'vite';
    }
    return 'other';
  }

  private detectNextjsMode(): 'app-router' | 'pages-router' {
    // Check for app directory (App Router)
    if (existsSync(join(this.projectRoot, 'app')) ||
        existsSync(join(this.projectRoot, 'src', 'app'))) {
      return 'app-router';
    }

    // Check for pages directory (Pages Router)
    if (existsSync(join(this.projectRoot, 'pages')) ||
        existsSync(join(this.projectRoot, 'src', 'pages'))) {
      return 'pages-router';
    }

    // Default to app-router for newer Next.js versions
    return 'app-router';
  }

  private findPossibleSourceDirs(hasSrcFolder: boolean, nextjsMode?: 'app-router' | 'pages-router'): string[] {
    const dirs: string[] = [];

    if (hasSrcFolder) {
      dirs.push('src/');
      if (nextjsMode === 'app-router') {
        dirs.push('src/app/');
      } else if (nextjsMode === 'pages-router') {
        dirs.push('src/pages/');
      }
    } else {
      if (nextjsMode === 'app-router') {
        dirs.push('app/');
      } else if (nextjsMode === 'pages-router') {
        dirs.push('pages/');
      }
    }

    // Add common component directories
    if (hasSrcFolder) {
      dirs.push('src/components/', 'src/lib/', 'src/utils/');
    } else {
      dirs.push('components/', 'lib/', 'utils/');
    }

    // Filter existing directories
    return dirs.filter(dir => existsSync(join(this.projectRoot, dir.replace(/\/$/, ''))));
  }

  private detectNextIntl(packageJson: PackageJson): boolean {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return !!(deps?.['next-intl'] || deps?.['@next-intl']);
  }

  private findExistingConfig(): string | undefined {
    const configFiles = [
      'next-intl-autogen.config.ts',
      'next-intl-autogen.config.js',
      '.next-intl-autogenrc',
      'next-intl.config.ts',
      'next-intl.config.js'
    ];

    for (const file of configFiles) {
      if (existsSync(join(this.projectRoot, file))) {
        return file;
      }
    }

    return undefined;
  }

  getSuggestedLocalesDir(hasSrcFolder: boolean): string {
    const suggestions = hasSrcFolder
      ? ['./src/messages', './src/locales', './src/i18n']
      : ['./messages', './locales', './i18n'];

    // Return first existing or first suggestion
    for (const dir of suggestions) {
      if (existsSync(join(this.projectRoot, dir))) {
        return dir;
      }
    }

    return suggestions[0]!;
  }

  getSuggestedSourceGlob(hasSrcFolder: boolean, nextjsMode?: 'app-router' | 'pages-router'): string[] {
    const baseDir = hasSrcFolder ? 'src/' : '';

    if (nextjsMode === 'app-router') {
      return [`${baseDir}app/**/*.{ts,tsx,js,jsx}`];
    } else if (nextjsMode === 'pages-router') {
      return [`${baseDir}pages/**/*.{ts,tsx,js,jsx}`];
    }

    // Default patterns
    return [
      `${baseDir}**/*.{ts,tsx,js,jsx}`,
      `${baseDir}components/**/*.{ts,tsx,js,jsx}`
    ].filter(_pattern => {
      // Check if pattern matches any files
      return true; // For now, return all patterns
    });
  }
}
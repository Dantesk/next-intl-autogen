import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectAnalyzer } from '../src/core/ProjectAnalyzer';
import { existsSync, readFileSync } from 'fs';

// Mock fs functions
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);

describe('ProjectAnalyzer', () => {
  let analyzer: ProjectAnalyzer;

  beforeEach(() => {
    vi.clearAllMocks();
    analyzer = new ProjectAnalyzer('/test/project');
  });

  it('should detect Next.js App Router project', () => {
    mockExistsSync.mockImplementation((path: any) => {
      if (path === '/test/project/package.json') return true;
      if (path === '/test/project/app') return true;
      if (path === '/test/project/src') return false;
      return false;
    });

    mockReadFileSync.mockReturnValue(JSON.stringify({
      dependencies: { 'next': '^13.0.0' }
    }));

    const structure = analyzer.analyze();

    expect(structure.framework).toBe('nextjs');
    expect(structure.nextjsMode).toBe('app-router');
    expect(structure.hasSrcFolder).toBe(false);
  });

  it('should detect Next.js Pages Router with src folder', () => {
    mockExistsSync.mockImplementation((path: any) => {
      if (path === '/test/project/package.json') return true;
      if (path === '/test/project/src') return true;
      if (path === '/test/project/src/pages') return true;
      if (path === '/test/project/app') return false;
      return false;
    });

    mockReadFileSync.mockReturnValue(JSON.stringify({
      dependencies: { 'next': '^12.0.0' }
    }));

    const structure = analyzer.analyze();

    expect(structure.framework).toBe('nextjs');
    expect(structure.nextjsMode).toBe('pages-router');
    expect(structure.hasSrcFolder).toBe(true);
  });

  it('should detect Vite project', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(JSON.stringify({
      dependencies: { 'vite': '^4.0.0' }
    }));

    const structure = analyzer.analyze();

    expect(structure.framework).toBe('vite');
  });

  it('should detect next-intl dependency', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(JSON.stringify({
      dependencies: { 'next-intl': '^2.0.0' }
    }));

    const structure = analyzer.analyze();

    expect(structure.hasNextIntl).toBe(true);
  });

  it('should find existing config files', () => {
    mockExistsSync.mockImplementation((path: any) => {
      if (path === '/test/project/package.json') return true;
      if (path === '/test/project/next-intl-autogen.config.ts') return true;
      return false;
    });

    mockReadFileSync.mockReturnValue(JSON.stringify({ dependencies: {} }));

    const structure = analyzer.analyze();

    expect(structure.existingConfig).toBe('next-intl-autogen.config.ts');
  });

  it('should suggest correct locales directory', () => {
    // With src folder
    expect(analyzer.getSuggestedLocalesDir(true)).toBe('./src/messages');

    // Without src folder
    expect(analyzer.getSuggestedLocalesDir(false)).toBe('./messages');
  });

  it('should suggest correct source globs for App Router', () => {
    const globs = analyzer.getSuggestedSourceGlob(false, 'app-router');
    expect(globs).toEqual(['app/**/*.{ts,tsx,js,jsx}']);
  });

  it('should suggest correct source globs for Pages Router', () => {
    const globs = analyzer.getSuggestedSourceGlob(true, 'pages-router');
    expect(globs).toEqual(['src/pages/**/*.{ts,tsx,js,jsx}']);
  });
});
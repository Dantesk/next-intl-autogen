import { describe, it, expect } from 'vitest';
import { DefaultKeyGenerator } from '../src/core/KeyGenerator';

describe('KeyGenerator', () => {
  const generator = new DefaultKeyGenerator();

  it('generates key for title', () => {
    const ctx = {
      filePath: 'app/dashboard/page.tsx',
      jsxElementName: 'h1',
      rawText: 'Welcome to the dashboard',
      indexInFile: 0,
    };
    const key = generator.generateKey(ctx);
    expect(key.namespace).toBe('dashboard');
    expect(key.key).toBe('h1_welcomeToTheDashboard');
  });
});
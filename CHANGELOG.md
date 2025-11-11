# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-11

### Added
- Initial release of next-intl-autogen CLI tool
- Automatic extraction of hardcoded strings from JSX elements
- Smart key generation based on file path and content
- Support for Next.js App Router and Pages Router
- Interactive configuration setup (`init` command)
- Translation completeness analysis (`analyze` command)
- Code transformation to use `useTranslations` hook (`apply` command)
- Comprehensive test suite with Vitest
- TypeScript support with strict type checking
- ESM module support
- Monorepo support with custom ignore patterns
- Dry-run mode for safe operations
- Verbose logging and progress reporting
- CI-ready with meaningful exit codes

### Features
- **File Scanning**: Scans TypeScript/JSX files with glob patterns
- **Text Extraction**: Uses Babel AST parsing for accurate JSX text extraction
- **Key Generation**: Context-aware keys with namespace support
- **Message Management**: Idempotent JSON updates with placeholders
- **Code Transformation**: Automatic import injection and code modification
- **Configuration**: Zod-validated configuration with sensible defaults
- **CLI Interface**: Commander.js based CLI with help and options

### Technical Details
- Built with TypeScript 5.9.3
- Node.js ESM modules
- Babel 7.28.5 for AST manipulation
- Commander 14.0.2 for CLI parsing
- Zod 4.1.12 for configuration validation
- Fast-glob 3.3.3 for file pattern matching
- Comprehensive error handling and logging

### Dependencies
- Runtime: @babel/core, @babel/generator, @babel/parser, @babel/traverse, @babel/types, commander, fast-glob, zod
- Development: TypeScript, Vitest, tsx, @types packages

---

## Types of changes
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities
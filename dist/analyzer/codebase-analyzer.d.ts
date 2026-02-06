/**
 * Codebase analyzer - detects project type, frameworks, and patterns
 */
import type { CodebaseAnalysis, MonorepoInfo } from '../types/codebase.js';
export declare class CodebaseAnalyzer {
    private projectRoot;
    constructor(projectRoot: string);
    analyze(): Promise<CodebaseAnalysis>;
    /**
     * Load and parse .superagentsignore from project root.
     * Returns an empty array if the file does not exist.
     */
    private loadIgnorePatterns;
    /**
     * Build the full ignore list by merging defaults with user patterns
     */
    private buildIgnorePatterns;
    private detectPrimaryLanguage;
    private detectProjectType;
    private detectFramework;
    private detectPythonFramework;
    private detectJavaFramework;
    private detectPhpFramework;
    private detectRubyFramework;
    private getDependencies;
    private getDevDependencies;
    private countFilesAndLines;
    private categorizeDependency;
    private detectPatterns;
    private inferAgents;
    private inferSkills;
    /**
     * Sample important files for AI generation context
     * Prioritizes configuration files, entry points, and representative code
     */
    private sampleFiles;
    /**
     * Try to add a file to sampled files array.
     * Skips files that match any of the ignore patterns.
     */
    private tryAddFile;
    /**
     * Detect if project is a monorepo and identify packages
     */
    detectMonorepo(): Promise<MonorepoInfo | null>;
}
//# sourceMappingURL=codebase-analyzer.d.ts.map
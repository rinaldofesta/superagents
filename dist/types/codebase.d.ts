/**
 * Types for codebase analysis
 */
export type ProjectType = 'nextjs' | 'react' | 'vue' | 'angular' | 'svelte' | 'node' | 'python' | 'go' | 'rust' | 'java' | 'csharp' | 'php' | 'ruby' | 'unknown';
export type ProgrammingLanguage = 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'java' | 'csharp' | 'php' | 'ruby';
export type Framework = 'nextjs' | 'nuxtjs' | 'react' | 'vue' | 'angular' | 'svelte' | 'express' | 'fastify' | 'nestjs' | 'django' | 'fastapi' | 'flask' | 'gin' | 'fiber' | 'actix' | 'rocket' | 'spring' | 'laravel' | 'rails' | null;
export type DependencyCategory = 'framework' | 'ui' | 'database' | 'orm' | 'auth' | 'payments' | 'testing' | 'build' | 'other';
export interface Dependency {
    name: string;
    version: string;
    category: DependencyCategory;
}
export type PatternType = 'api-routes' | 'server-actions' | 'components' | 'services' | 'models' | 'controllers' | 'middleware' | 'hooks' | 'utils' | 'tests';
export interface Pattern {
    type: PatternType;
    paths: string[];
    confidence: number;
    description: string;
}
export interface FileNode {
    path: string;
    type: 'file' | 'directory';
    size?: number;
    children?: FileNode[];
}
export interface MCPServer {
    name: string;
    path: string;
    capabilities: string[];
}
export interface ExistingClaudeConfig {
    hasClaudeDir: boolean;
    hasCLAUDEMd: boolean;
    agents: string[];
    skills: string[];
    hooks: string[];
}
export interface CodebaseAnalysis {
    projectRoot: string;
    projectType: ProjectType;
    language: ProgrammingLanguage | null;
    framework: Framework;
    dependencies: Dependency[];
    devDependencies: Dependency[];
    fileStructure: FileNode[];
    totalFiles: number;
    totalLines: number;
    detectedPatterns: Pattern[];
    suggestedSkills: string[];
    suggestedAgents: string[];
    existingClaudeConfig: ExistingClaudeConfig | null;
    mcpServers: MCPServer[];
    sampledFiles: SampledFile[];
    analyzedAt: string;
    analysisTimeMs: number;
}
export interface SampledFile {
    path: string;
    content: string;
    purpose: string;
}
//# sourceMappingURL=codebase.d.ts.map
/**
 * ASCII art banner and branding
 */
export declare const BANNER = "\n  \u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E\n  \u2502                                          \u2502\n  \u2502        S U P E R A G E N T S             \u2502\n  \u2502                                          \u2502\n  \u2502   Your AI team, configured in seconds    \u2502\n  \u2502   Powered by Play New's community        \u2502\n  \u2502                                          \u2502\n  \u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F\n";
/**
 * Expert attribution for each agent
 */
export declare const AGENT_EXPERTS: Record<string, {
    expert: string;
    domain: string;
}>;
export declare function displayBanner(): void;
export declare function displaySuccess(summary: {
    agents: string[];
    skills: string[];
    projectRoot: string;
    claudeDir: string;
}): void;
export declare function displayError(error: string): void;
//# sourceMappingURL=banner.d.ts.map
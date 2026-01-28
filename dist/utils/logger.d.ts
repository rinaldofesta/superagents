/**
 * Verbose logging utility for SuperAgents
 */
export declare function setVerbose(enabled: boolean): void;
export declare const log: {
    info: (message: string) => void;
    success: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
    debug: (message: string) => void;
    verbose: (message: string) => void;
    section: (title: string) => void;
    table: (data: Record<string, string | number>) => void;
};
//# sourceMappingURL=logger.d.ts.map
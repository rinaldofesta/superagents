/**
 * Verbose logging utility for SuperAgents
 * Provides structured logging with operation context
 */
export declare function setVerbose(enabled: boolean): void;
export declare function isVerbose(): boolean;
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
/**
 * Operation logger interface
 */
export interface OperationLogger {
    debug: (message: string) => void;
    verbose: (message: string) => void;
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
}
/**
 * Create a logger with operation context prefix
 * Useful for tracking logs from specific operations (e.g., cache, generator)
 */
export declare function createOperationLogger(operationId: string): OperationLogger;
//# sourceMappingURL=logger.d.ts.map
/**
 * Standardized exit codes for CLI
 * Following Unix conventions for different error types
 */
export declare const EXIT_CODES: {
    /** Successful execution */
    readonly SUCCESS: 0;
    /** User error: validation failures, bad input, missing required args */
    readonly USER_ERROR: 1;
    /** System error: API failures, disk errors, network issues */
    readonly SYSTEM_ERROR: 2;
    /** User cancelled operation (Ctrl+C) */
    readonly CANCELLED: 130;
};
export type ExitCode = typeof EXIT_CODES[keyof typeof EXIT_CODES];
/**
 * Determine appropriate exit code based on error type
 */
export declare function getExitCodeForError(error: Error): ExitCode;
//# sourceMappingURL=exit-codes.d.ts.map
/**
 * Standardized exit codes for CLI
 * Following Unix conventions for different error types
 */
export const EXIT_CODES = {
    /** Successful execution */
    SUCCESS: 0,
    /** User error: validation failures, bad input, missing required args */
    USER_ERROR: 1,
    /** System error: API failures, disk errors, network issues */
    SYSTEM_ERROR: 2,
    /** User cancelled operation (Ctrl+C) */
    CANCELLED: 130
};
/**
 * Determine appropriate exit code based on error type
 */
export function getExitCodeForError(error) {
    const message = error.message.toLowerCase();
    // User cancellation
    if (message.includes('cancelled') || message.includes('canceled')) {
        return EXIT_CODES.CANCELLED;
    }
    // Validation errors (user input)
    if (message.includes('validation') ||
        message.includes('invalid') ||
        message.includes('required') ||
        message.includes('must be')) {
        return EXIT_CODES.USER_ERROR;
    }
    // API/network errors (system)
    if (message.includes('api') ||
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('connection') ||
        message.includes('authentication')) {
        return EXIT_CODES.SYSTEM_ERROR;
    }
    // Default to user error for unknown errors
    return EXIT_CODES.USER_ERROR;
}
//# sourceMappingURL=exit-codes.js.map
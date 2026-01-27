/**
 * Progress indicators and spinners
 */
export declare class ProgressIndicator {
    private spinner;
    start(message: string): void;
    update(message: string): void;
    succeed(message?: string): void;
    fail(message?: string): void;
    info(message: string): void;
    warn(message: string): void;
}
export declare function withProgress<T>(message: string, task: () => Promise<T>, successMessage?: string): Promise<T>;
//# sourceMappingURL=progress.d.ts.map
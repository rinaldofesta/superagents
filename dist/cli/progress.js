/**
 * Progress indicators and spinners
 */
import ora from 'ora';
export class ProgressIndicator {
    spinner = null;
    start(message) {
        this.spinner = ora({
            text: message,
            color: 'cyan'
        }).start();
    }
    update(message) {
        if (this.spinner) {
            this.spinner.text = message;
        }
    }
    succeed(message) {
        if (this.spinner) {
            this.spinner.succeed(message);
            this.spinner = null;
        }
    }
    fail(message) {
        if (this.spinner) {
            this.spinner.fail(message);
            this.spinner = null;
        }
    }
    info(message) {
        if (this.spinner) {
            this.spinner.info(message);
            this.spinner = null;
        }
    }
    warn(message) {
        if (this.spinner) {
            this.spinner.warn(message);
            this.spinner = null;
        }
    }
}
export async function withProgress(message, task, successMessage) {
    const progress = new ProgressIndicator();
    progress.start(message);
    try {
        const result = await task();
        progress.succeed(successMessage || message);
        return result;
    }
    catch (error) {
        progress.fail(message);
        throw error;
    }
}
//# sourceMappingURL=progress.js.map
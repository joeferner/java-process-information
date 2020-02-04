import { exec, ExecOptions } from 'child_process';

export interface ExecResults {
    stdout: string;
    stderr: string;
}

export function execPromise(cmd: string, options?: ExecOptions): Promise<ExecResults> {
    return new Promise((resolve, reject) => {
        const opts: ExecOptions = { ...options };
        exec(cmd, opts, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            resolve({
                stdout,
                stderr,
            });
        });
    });
}

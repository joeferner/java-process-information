import { execPromise } from './exec';
import { JStackParseResults, parseJStack } from './jstack-parse';

export interface JStackOptions {
    force?: boolean;
    pid: number;
    cmd?: string;
}

export async function jstack(options: JStackOptions): Promise<JStackParseResults> {
    options = {
        force: false,
        cmd: 'jstack',
        ...(options || {}),
    };
    let command = options.cmd || '';
    if (options.force) {
        command += ' -F';
    }
    command += ` ${options.pid}`;
    const { stdout, stderr } = await execPromise(command);
    return parseJStack(stdout, stderr);
}

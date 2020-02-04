import { JMapParseResults, parseJmapHisto } from './jmap-histo-parse';
import { execPromise } from './exec';

export interface JMapHistoOptions {
    cmd?: string;
    live?: boolean;
    force?: boolean;
    flags?: string[];
    pid: number;
}

export async function jmapHisto(options: JMapHistoOptions): Promise<JMapParseResults> {
    const cmd = 'cmd' in options ? options.cmd : 'jmap';
    const live = 'live' in options ? options.live : false;
    const force = 'force' in options ? options.force : false;
    const flags = options.flags || [];
    let command = `${cmd} -histo`;
    if (live) {
        command += ':live';
    }
    if (force) {
        command += ' -F';
    }
    for (const flag of flags) {
        command += ` "-J${flag}"`;
    }
    command += ` ${options.pid}`;

    let maxBuffer = 1024 * 1024;
    let stdout = '';
    let stderr = '';
    for (let i = 0; i < 3; i++) {
        try {
            const results = await execPromise(command, { maxBuffer });
            stdout = results.stdout;
            stderr = results.stderr;
        } catch (err) {
            if (err.toString().indexOf('ERR_CHILD_PROCESS_STDIO_MAXBUFFER') >= 0) {
                maxBuffer = 10 * maxBuffer;
            } else {
                throw err;
            }
        }
    }
    return parseJmapHisto(stdout, stderr);
}

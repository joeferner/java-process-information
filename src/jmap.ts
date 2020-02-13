import { JMapParseResults, parseJmapHisto } from './jmap-histo-parse';
import { execPromise } from './exec';

export interface JMapHistoOptions {
    cmd?: string;
    live?: boolean;
    force?: boolean;
    flags?: string[];
    pid: number;
    maxBufferSize?: number;
}

export async function jmapHisto(options: JMapHistoOptions): Promise<JMapParseResults> {
    const cmd = 'cmd' in options ? options.cmd : 'jmap';
    const live = 'live' in options ? options.live : false;
    const force = 'force' in options ? options.force : false;
    const maxBufferSize = 'maxBufferSize' in options ? options.maxBufferSize : 50 * 1024 * 1024;
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

    const { stdout, stderr } = await execPromise(command, { maxBuffer: maxBufferSize });
    return parseJmapHisto(stdout, stderr);
}

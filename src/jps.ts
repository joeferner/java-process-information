import { JpsParseResults, parseJps } from './jps-parse';
import { execPromise } from './exec';

export interface JpsOptions {
    suppressClassNames?: boolean;
    outputArguments?: boolean;
    outputFullPackageNames?: boolean;
    outputJvmArguments?: boolean;
    outputJvmArgumentsFromFlagFile?: boolean;
    flags?: string[];
    cmd?: string;
}

export async function jps(options?: JpsOptions): Promise<JpsParseResults> {
    options = {
        suppressClassNames: false,
        outputArguments: false,
        outputFullPackageNames: false,
        outputJvmArguments: false,
        outputJvmArgumentsFromFlagFile: false,
        flags: [],
        cmd: 'jps',
        ...(options || {}),
    };
    let command = options.cmd || '';
    if (options.suppressClassNames) {
        command += ' -q';
    }
    if (options.outputArguments) {
        command += ' -m';
    }
    if (options.outputFullPackageNames) {
        command += ' -l';
    }
    if (options.outputJvmArguments) {
        command += ' -v';
    }
    if (options.outputJvmArgumentsFromFlagFile) {
        command += ' -v';
    }
    for (const flag of options.flags || []) {
        command += ` "-J${flag}"`;
    }
    const { stdout, stderr } = await execPromise(command);
    return parseJps(stdout, stderr);
}

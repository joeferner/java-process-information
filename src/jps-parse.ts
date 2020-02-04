import { cleanStderr } from './clean-stderr';

export interface JpsParseResults {
    processes: JpsProcess[];
}

export interface JpsProcess {
    pid: number;
    name?: string;
    className?: string;
    args?: string[];
}

export function parseJps(output: string, stderr?: string): JpsParseResults {
    if (stderr) {
        stderr = cleanStderr(stderr);
        if (stderr.length > 0) {
            throw new Error(`Unhandled error: ${stderr}`);
        }
    }

    const lines = output.split('\n');
    const results: JpsParseResults = {
        processes: [],
    };
    for (let i = 0; i < lines.length;) {
        const line = lines[i];
        i++;

        const lineMatch = line.match(/^([0-9]+) (.+)$/);
        if (lineMatch) {
            const pid = parseInt(lineMatch[1], 10);
            const details = lineMatch[2];

            const detailsMatch = details.match(/^(.+?) (.+)$/);
            if (detailsMatch) {
                const className = detailsMatch[1];
                const name = getNameFromClassName(className);
                const args = detailsMatch[2].split(' ');
                results.processes.push({ pid, name, className, args });
            } else {
                const name = details;
                results.processes.push({ pid, name });
            }
            continue;
        }

        const pidOnlyMatch = line.match(/^([0-9]+)$/);
        if (pidOnlyMatch) {
            const pid = parseInt(pidOnlyMatch[1], 10);
            results.processes.push({ pid });
            continue;
        }

        if (line.trim().length === 0) {
            continue;
        }

        throw new Error(`Unhandled line: ${line} (line ${i})`);
    }
    return results;
}

function getNameFromClassName(className: string): string {
    const lastPeriod = className.lastIndexOf('.');
    if (lastPeriod >= 0) {
        return className.substring(lastPeriod + 1);
    }
    return className;
}

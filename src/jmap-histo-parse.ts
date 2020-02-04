import { cleanStderr } from './clean-stderr';

export interface JMapParseResults {
    objects: JMapObject[];
}

export interface JMapObject {
    instances: number;
    bytes: number;
    className: string;
}

export function parseJmapHisto(output: string, stderr?: string): JMapParseResults {
    if (stderr) {
        stderr = cleanStderr(stderr);
        if (stderr.length > 0) {
            throw new Error(`Unhandled error: ${stderr}`);
        }
    }

    const lines = output.split('\n');
    const results: JMapParseResults = {
        objects: [],
    };
    for (let i = 0; i < lines.length; ) {
        const line = lines[i];
        i++;

        const objLineMatch = line.match(/[\s]*([0-9]+):[\s]+([0-9]+)[\s]+([0-9]+)[\s]+(.*)/);
        if (objLineMatch) {
            results.objects.push({
                instances: parseInt(objLineMatch[2], 10),
                bytes: parseInt(objLineMatch[3], 10),
                className: objLineMatch[4],
            });
            continue;
        }

        if (line.startsWith('Total')) {
            continue;
        }

        if (line.match(/num.*#instances.*#bytes.*class name \(module\)/)) {
            continue;
        }

        if (line.startsWith('-----------------')) {
            continue;
        }

        if (line.trim().length === 0) {
            continue;
        }

        throw new Error(`Unhandled line: ${line} (line ${i})`);
    }
    return results;
}

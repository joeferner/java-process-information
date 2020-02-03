import fs from 'fs';
import path from 'path';
import { parseJmapHisto } from '../jmap-histo-parse';

test('jmap-histo-output-01.txt', () => {
    const jmap = fs.readFileSync(path.resolve(__dirname, 'jmap-histo-output-01.txt'), 'utf-8');
    const result = parseJmapHisto(jmap);

    expect(result.objects.length).toBe(3);
});

test('JAVA_TOOL_OPTIONS', () => {
    const stderr =
        'Picked up JAVA_TOOL_OPTIONS: -Dfile.encoding=UTF-8\n' +
        'Picked up _JAVA_OPTIONS: -Djava.net.preferIPv4Stack=true\n';
    const jmap = fs.readFileSync(path.resolve(__dirname, 'jmap-histo-output-01.txt'), 'utf-8');
    parseJmapHisto(jmap, stderr);
});

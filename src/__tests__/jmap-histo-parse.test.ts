import fs from 'fs';
import path from 'path';
import { parseJmapHisto } from '../jmap-histo-parse';

test('jmap-histo-output-01.txt', () => {
    const jmap = fs.readFileSync(path.resolve(__dirname, 'jmap-histo-output-01.txt'), 'utf-8');
    const result = parseJmapHisto(jmap);

    expect(result.objects.length).toBe(72);

    expect(result.objects[0].instances).toBe(1235423);
    expect(result.objects[0].bytes).toBe(211959088);
    expect(result.objects[0].className).toBe('[B (java.base@11.0.4)');

    expect(result.objects[1].instances).toBe(124504);
    expect(result.objects[1].bytes).toBe(118347576);
    expect(result.objects[1].className).toBe('[Ljava.util.concurrent.ConcurrentHashMap$Node; (java.base@11.0.4)');
});

test('JAVA_TOOL_OPTIONS', () => {
    const stderr =
        'Picked up JAVA_TOOL_OPTIONS: -Dfile.encoding=UTF-8\n' +
        'Picked up _JAVA_OPTIONS: -Djava.net.preferIPv4Stack=true\n';
    const jmap = fs.readFileSync(path.resolve(__dirname, 'jmap-histo-output-01.txt'), 'utf-8');
    parseJmapHisto(jmap, stderr);
});

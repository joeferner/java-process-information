import fs from 'fs';
import path from 'path';
import { parseJps } from '../jps-parse';

test('jps-output-01.txt', () => {
    const jps = fs.readFileSync(path.resolve(__dirname, 'jps-output-01.txt'), 'utf-8');
    const result = parseJps(jps);

    expect(result.processes.length).toBe(3);

    const process0 = result.processes[0];
    expect(process0.pid).toBe(7632);
    expect(process0.name).toBe('Jps');

    const process1 = result.processes[1];
    expect(process1.pid).toBe(1715);
    expect(process1.name).toBe('RemoteMavenServer36');

    const process2 = result.processes[2];
    expect(process2.pid).toBe(1572);
    expect(process2.name).toBe('Main');
});

test('jps-output-02.txt', () => {
    const jps = fs.readFileSync(path.resolve(__dirname, 'jps-output-02.txt'), 'utf-8');
    const result = parseJps(jps);

    expect(result.processes.length).toBe(3);

    const process0 = result.processes[0];
    expect(process0.pid).toBe(1888);
    expect(process0.name).toBe('Main');
    expect(process0.className).toBe('com.intellij.idea.Main');

    const process1 = result.processes[1];
    expect(process1.pid).toBe(2014);
    expect(process1.name).toBe('RemoteMavenServer36');
    expect(process1.className).toBe('org.jetbrains.idea.maven.server.RemoteMavenServer36');
    expect(process1.args).toStrictEqual([
        '-Djava.awt.headless=true',
        '-Dmaven.defaultProjectBuilder.disableGlobalModelCache=true',
        '-Xmx768m',
        '-Didea.maven.embedder.version=3.6.1',
        '-Dmaven.ext.class.path=/opt/intellij-idea-ultimate-edition/plugins/maven/lib/maven-event-listener.jar',
        '-Dfile.encoding=UTF-8',
    ]);

    const process2 = result.processes[2];
    expect(process2.pid).toBe(3071);
    expect(process2.name).toBe('Jps');
    expect(process2.className).toBe('jdk.jcmd/sun.tools.jps.Jps');
});

test('JAVA_TOOL_OPTIONS', () => {
    const stderr =
        'Picked up JAVA_TOOL_OPTIONS: -Dfile.encoding=UTF-8\n' +
        'Picked up _JAVA_OPTIONS: -Djava.net.preferIPv4Stack=true\n';
    const jps = fs.readFileSync(path.resolve(__dirname, 'jps-output-01.txt'), 'utf-8');
    parseJps(jps, stderr);
});

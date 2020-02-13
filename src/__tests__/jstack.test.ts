import fs from 'fs';
import path from 'path';
import { parseJStack, JStackThreadState } from '../jstack-parse';

test('parse', () => {
    const jstack = fs.readFileSync(path.resolve(__dirname, 'jstack-output-01.txt'), 'utf-8');
    const result = parseJStack(jstack);
    expect(result.dateTime?.getTime()).toBe(new Date(2020, 1 - 1, 25, 13, 50, 13).getTime());
    expect(result.jdk).toBe('OpenJDK 64-Bit Server VM (11.0.5+10 mixed mode)');
    expect(result.jniGlobalRefs).toBe(19);
    expect(result.jniWeakRefs).toBe(19);

    expect(result.threads.length).toBe(30);

    const thread = result.threads[0];
    expect(thread.name).toBe('Reference Handler');
    expect(thread.daemon).toBe(true);
    expect(thread.javaThreadId).toBe(2);
    expect(thread.osPriority).toBe(0);
    expect(thread.priority).toBe(10);
    expect(thread.cpuTimeMillis).toBe(1.97);
    expect(thread.elapsedTimeMillis).toBe(564397290);
    expect(thread.tid).toBe('0x00007f09302b5800');
    expect(thread.nid).toBe(62);
    expect(thread.stackMemoryRegion).toBe('0x00007f090058c000');
    expect(thread.info).toBe('waiting on condition');
    expect(thread.state).toBe(JStackThreadState.RUNNABLE);
});

test('parse alternate JNI references', () => {
    const result = parseJStack('JNI global references: 123');
    expect(result.jniGlobalRefs).toBe(123);
});

test('Operation not permitted', () => {
    try {
        parseJStack('', '123: Operation not permitted');
        fail('Should not get here');
    } catch (err) {
        expect(err.message).toBe('Operation not permitted');
    }
});

test('No such process', () => {
    try {
        parseJStack('', '123: No such process');
        fail('Should not get here');
    } catch (err) {
        expect(err.message).toBe('No such process');
    }
});

test('JAVA_TOOL_OPTIONS', () => {
    const stderr =
        'Picked up JAVA_TOOL_OPTIONS: -Dfile.encoding=UTF-8\n' +
        'Picked up _JAVA_OPTIONS: -Djava.net.preferIPv4Stack=true\n';
    const jstack = fs.readFileSync(path.resolve(__dirname, 'jstack-output-01.txt'), 'utf-8');
    parseJStack(jstack, stderr);
});

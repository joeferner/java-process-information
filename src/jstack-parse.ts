import { cleanStderr } from './clean-stderr';

export interface JStackParseResults {
    dateTime?: Date;
    jdk?: string;
    jniGlobalRefs?: number;
    jniWeakRefs?: number;
    threads: JStackThread[];
}

export enum JStackThreadState {
    NEW = 'NEW',
    RUNNABLE = 'RUNNABLE',
    SLEEPING = 'SLEEPING',
    IN_OBJECT_WAIT = 'IN_OBJECT_WAIT',
    IN_OBJECT_WAIT_TIMED = 'IN_OBJECT_WAIT_TIMED',
    PARKED = 'PARKED',
    PARKED_TIMED = 'PARKED_TIMED',
    BLOCKED_ON_MONITOR_ENTER = 'BLOCKED_ON_MONITOR_ENTER',
    TERMINATED = 'TERMINATED',
    TIMED_WAITING = 'TIMED_WAITING',
    WAITING = 'WAITING',
    UNKNOWN = 'UNKNOWN',
}

export interface JStackThread {
    name: string;
    daemon: boolean;
    javaThreadId?: number;
    osPriority?: number;
    priority?: number;
    cpuTimeMillis?: number;
    elapsedTimeMillis?: number;
    tid?: string;
    nid?: number;
    stackMemoryRegion?: string;
    info?: string;
    state?: JStackThreadState;
    stackItems: JStackStackItem[];
}

export interface JStackStackItem {
    line: string;
}

export function parseJStack(output: string, stderr?: string): JStackParseResults {
    if (stderr) {
        stderr = cleanStderr(stderr);
        if (stderr.indexOf('Operation not permitted') >= 0) {
            throw new Error('Operation not permitted');
        } else if (stderr.indexOf('No such process') >= 0) {
            throw new Error('No such process');
        } else if (stderr.length > 0) {
            throw new Error(`Unhandled error: ${stderr}`);
        }
    }

    const lines = output.split('\n');
    const results: JStackParseResults = {
        threads: [],
    };
    for (let i = 0; i < lines.length; ) {
        const line = lines[i];
        i++;

        const dateTimeMatch = line.match(/([0-9]+)-([0-9]+)-([0-9]+) ([0-9]+):([0-9]+):([0-9]+)/);
        if (dateTimeMatch) {
            const year = parseInt(dateTimeMatch[1], 10);
            const month = parseInt(dateTimeMatch[2], 10);
            const day = parseInt(dateTimeMatch[3], 10);
            const hour = parseInt(dateTimeMatch[4], 10);
            const minute = parseInt(dateTimeMatch[5], 10);
            const second = parseInt(dateTimeMatch[6], 10);
            results.dateTime = new Date(year, month - 1, day, hour, minute, second);
            continue;
        }

        const jdkMatch = line.match(/^Full thread dump (.*)$/);
        if (jdkMatch) {
            if (jdkMatch[1].endsWith(':')) {
                jdkMatch[1] = jdkMatch[1].substr(0, jdkMatch[1].length - 1);
            }
            results.jdk = jdkMatch[1];
            continue;
        }

        if (line.indexOf('Threads class SMR info') >= 0) {
            for (; i < lines.length; i++) {
                if (lines[i].trim().length === 0) {
                    break;
                }
            }
            continue;
        }

        const jniInfoMatch = line.match(/JNI global refs: ([0-9]+), weak refs: ([0-9]+)/);
        if (jniInfoMatch) {
            results.jniGlobalRefs = parseInt(jniInfoMatch[1], 10);
            results.jniWeakRefs = parseInt(jniInfoMatch[1], 10);
            continue;
        }

        const jniInfoAltMatch = line.match(/JNI global references: ([0-9]+)/);
        if (jniInfoAltMatch) {
            results.jniGlobalRefs = parseInt(jniInfoAltMatch[1], 10);
            continue;
        }

        const threadStartMatch = line.match(/^"(.*?)" (.*)$/);
        if (threadStartMatch) {
            const name = threadStartMatch[1];
            let info = threadStartMatch[2];

            const thread: JStackThread = {
                name,
                daemon: info.indexOf('daemon') >= 0,
                stackItems: [],
            };

            info = info.replace('daemon', '');

            const javaThreadIdMatch = info.match(/#([0-9]+)/);
            if (javaThreadIdMatch) {
                info = info.replace(javaThreadIdMatch[0], '');
                thread.javaThreadId = parseInt(javaThreadIdMatch[1], 10);
            }

            const osPriorityMatch = info.match(/os_prio=([0-9]+)/);
            if (osPriorityMatch) {
                info = info.replace(osPriorityMatch[0], '');
                thread.osPriority = parseInt(osPriorityMatch[1], 10);
            }

            const priorityMatch = info.match(/prio=([0-9]+)/);
            if (priorityMatch) {
                info = info.replace(priorityMatch[0], '');
                thread.priority = parseInt(priorityMatch[1], 10);
            }

            const cpuTimeMatch = info.match(/cpu=([0-9.]+[a-z]+)/);
            if (cpuTimeMatch) {
                info = info.replace(cpuTimeMatch[0], '');
                thread.cpuTimeMillis = parseTimeToMillis(cpuTimeMatch[1]);
            }

            const elapsedTimeMatch = info.match(/elapsed=([0-9.]+[a-z]+)/);
            if (elapsedTimeMatch) {
                info = info.replace(elapsedTimeMatch[0], '');
                thread.elapsedTimeMillis = parseTimeToMillis(elapsedTimeMatch[1]);
            }

            const tidMatch = info.match(/tid=0x([0-9a-f]+)/);
            if (tidMatch) {
                info = info.replace(tidMatch[0], '');
                thread.tid = `0x${tidMatch[1]}`;
            }

            const nidMatch = info.match(/nid=0x([0-9a-f]+)/);
            if (nidMatch) {
                info = info.replace(nidMatch[0], '');
                thread.nid = parseInt(nidMatch[1], 16);
            }

            const stackMemoryRegionMatch = info.match(/\[0x([0-9a-f]+)]/);
            if (stackMemoryRegionMatch) {
                info = info.replace(stackMemoryRegionMatch[0], '');
                thread.stackMemoryRegion = `0x${stackMemoryRegionMatch[1]}`;
            }

            thread.info = info.replace(/\s+/, ' ').trim();

            const stateLineMatch = lines[i].match(/java.lang.Thread.State: (.*)/);
            if (stateLineMatch) {
                i++;
                thread.state = parseThreadState(stateLineMatch[1].trim());
            }

            for (; i < lines.length; i++) {
                const stackItemLine = lines[i].trim();
                if (stackItemLine.length === 0) {
                    break;
                }
                thread.stackItems.push({
                    line: stackItemLine,
                });
            }

            results.threads.push(thread);
            continue;
        }

        if (line.trim().length === 0) {
            continue;
        }

        throw new Error(`Unhandled line: ${line} (line ${i})`);
    }
    return results;
}

function parseTimeToMillis(time: string): number {
    if (time.endsWith('ms')) {
        return parseFloat(time.substr(0, time.length - 2));
    }
    if (time.endsWith('s')) {
        return parseFloat(time.substr(0, time.length - 1)) * 1000;
    }
    throw new Error(`Could not parse time: ${time}`);
}

function parseThreadState(str: string): JStackThreadState {
    if (str === 'NEW') {
        return JStackThreadState.NEW;
    }
    if (str === 'RUNNABLE') {
        return JStackThreadState.RUNNABLE;
    }
    if (str === 'TERMINATED') {
        return JStackThreadState.TERMINATED;
    }
    if (str === 'UNKNOWN') {
        return JStackThreadState.UNKNOWN;
    }
    if (str.startsWith('BLOCKED')) {
        return JStackThreadState.BLOCKED_ON_MONITOR_ENTER;
    }
    if (str.startsWith('TIMED_WAITING')) {
        if (str.indexOf('parking') >= 0) {
            return JStackThreadState.PARKED_TIMED;
        }
        if (str.indexOf('sleeping') >= 0) {
            return JStackThreadState.SLEEPING;
        }
        if (str.indexOf('on object monitor') >= 0) {
            return JStackThreadState.IN_OBJECT_WAIT_TIMED;
        }
        return JStackThreadState.TIMED_WAITING;
    }
    if (str.startsWith('WAITING')) {
        if (str.indexOf('on object monitor') >= 0) {
            return JStackThreadState.IN_OBJECT_WAIT;
        }
        if (str.indexOf('parking') >= 0) {
            return JStackThreadState.PARKED;
        }
        return JStackThreadState.WAITING;
    }
    throw new Error(`Could not parse state: ${str}`);
}

export function cleanStderr(stderr: string): string {
    return stderr.replace(/^Picked up.*\r?\n?/gm, '').trim();
}
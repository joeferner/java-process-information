/* tslint:disable:no-console */
import fs from 'fs';
import { parseJmapHisto } from './jmap-histo-parse';

const args = process.argv.slice(2);

if (args.length > 1) {
    console.error('Parse requires zero or one argument');
    process.exit(-1);
} else {
    const str = args.length === 0 ? fs.readFileSync(0, 'utf-8') : fs.readFileSync(args[0], 'utf-8');
    try {
        const results = parseJmapHisto(str);
        console.log(JSON.stringify(results, null, 2));
    } catch (err) {
        console.error(err.message);
        process.exit(-1);
    }
}

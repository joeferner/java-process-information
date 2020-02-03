## Install

```bash
npm install java-process-information
```

## CLI

```bash
jmap -histo 123 | jmap-histo-parse
```

## API

#### JMap

```javascript
import { parseJmapHisto } from 'jmap-parse';

const results = parseJmapHisto(jmapStdout, jmapStderr);
```

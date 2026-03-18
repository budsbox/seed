# @budsbox/parse-mime

A standards-compliant MIME type parser and serializer for JavaScript and TypeScript.

Built on a [Peggy](https://peggyjs.org/)-generated PEG grammar, `@budsbox/parse-mime` provides both **strict (semantic)** parsing per IETF RFCs (primarily [RFC 9110 HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110)) and a **lenient (sniffing)** mode following the [WHATWG MIME Sniffing Standard](https://mimesniff.spec.whatwg.org/). The parser produces richly typed results — including essence, type, subtype, facet, suffix, and parameters — making it easy to inspect and reconstruct MIME types programmatically.

**Key features:**

-   🔬 **Dual-mode parsing** — strict [RFC 9110](https://datatracker.ietf.org/doc/html/rfc9110) / [RFC 6838](https://datatracker.ietf.org/doc/html/rfc6838) mode and lenient WHATWG sniffing mode
-   🧩 **Structured output** — type, subtype, facet (`vnd.`), suffix (`+xml`), and parameters as a `Map`
-   🔁 **Round-trip serialization** — parse a MIME string and serialize it back
-   ⚙️ **Flexible options** — trimming, restricted names, charset case handling, and duplicate parameter strategies (`keep-first`, `keep-last`, `list`)
-   🛡️ **Fully typed** — generic return types driven by the chosen start rule and options
-   💯 **Thoroughly tested** — 100% code coverage, including all the MIME Sniffing test data of [web-platform-tests](https://github.com/web-platform-tests/wpt/tree/master/mimesniff)

## Installation

```shell
# yarn
yarn add @budsbox/parse-mime

# or npm
npm install @budsbox/parse-mime
```

## Quick Start

### Parsing a MIME type

```typescript
import { parse } from '@budsbox/parse-mime';

const result = parse('text/html; charset=utf-8');

result.essence; // 'text/html'
result.type; // 'text'
result.subtype; // 'html'
result.parameters; // Map { 'charset' => 'utf-8' }
```

Structured subtypes are decomposed automatically:

```typescript
const res = parse('application/vnd.company.product+json');

res.facet; // 'vnd.'
res.suffix; // '+json'
```

### Sniffing mode

Use `sniff()` to parse potentially malformed input — e.g. from user agents or legacy systems:

```typescript
import { sniff } from '@budsbox/parse-mime';

const result = sniff('  TEXT/HTML ; charset=utf-8  ;  ');

result.essence; // 'text/html'
result.parameters.get('charset'); // 'utf-8'
```

In sniffing mode, leading/trailing whitespace, trailing semicolons, and unquoted values with spaces are handled gracefully.

### Handling duplicate parameters

```typescript
import { parse } from '@budsbox/parse-mime';

// Keep first (default)
parse('x/y; a=1; a=2').parameters;
// Map { 'a' => '1' }

// Keep last
parse('x/y; a=1; a=2', { multiParameter: 'keep-last' }).parameters;
// Map { 'a' => '2' }

// Collect all
parse('x/y; a=1; a=2', { multiParameter: 'list' }).parameters;
// Map { 'a' => ['1', '2'] }
```

### Serialization

```typescript
import {
    parse,
    serializeMimeType,
    serializeParameters,
} from '@budsbox/parse-mime';

// Round-trip
const parsed = parse('Text/HTML; Charset=UTF-8');
serializeMimeType(parsed); // 'text/html;charset=utf-8'

// Build from scratch
serializeMimeType({
    type: 'application',
    subtype: 'json',
    parameters: { charset: 'utf-8' },
}); // 'application/json;charset=utf-8'

// Serialize parameters only
serializeParameters(
    new Map([
        ['charset', 'utf-8'],
        ['filename', 'my file.txt'],
    ]),
); // ';charset=utf-8;filename="my file.txt"'
```

Values that aren't valid HTTP tokens are automatically quoted during serialization.

## API Reference

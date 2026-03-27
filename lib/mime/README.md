# @budsbox/lib-mime

A comprehensive TypeScript library for parsing, manipulating, querying, and classifying MIME types. It provides a structured, immutable representation of MIME types with full support for parameters, canonicalization, alias resolution, and content-type detection — all with precise TypeScript typings.

Built on top of a [Peggy](https://peggyjs.org/)-based parser [@budsbox/parse-mime](../../parse/mime/README.md) and the community-maintained [`mime-db`](https://github.com/jshttp/mime-db) database, the library is split into two entry points so you can keep your bundle lean when you only need core parsing and manipulation.

### Features

- **Parse & serialize** MIME type strings into strongly-typed immutable records and back
- **Get, set, remove** individual parameters with automatic normalization
- **Canonicalize** MIME types using a rich alias map (covers IANA, Apache, nginx, and community sources)
- **Query metadata** — file extensions (with reverse lookup), charset, compressibility, source database
- **40+ guard functions** — `isJson`, `isImage`, `isArchive`, `isCompressible`, `isTextData`, and many more
- **MIME Sniffing Standard** conformance for content-type group detection

## Installation

```shell
# yarn
yarn add @budsbox/lib-mime mime-db

# npm
npm install @budsbox/lib-mime mime-db
```

> `mime-db` is a **peer dependency** and it is only imported by the `@budsbox/lib-mime/meta` entry point.
> If you only use the root entry point, you don't need it at runtime.

## Quick Start

The library exposes **two modules**:

| Module                   | Purpose                                             | Imports `mime-db`? |
| ------------------------ | --------------------------------------------------- | ------------------ |
| `@budsbox/lib-mime`      | Core parsing, serialization, parameter manipulation | No                 |
| `@budsbox/lib-mime/meta` | Metadata queries, canonicalization, guards          | Yes                |

### Core — parsing & manipulation

```typescript
import {
    parse,
    normalize,
    serialize,
    getParameter,
    setParameter,
    removeParameter,
    update,
} from '@budsbox/lib-mime';

// Parse a MIME type string into a structured record
const parsed = parse('text/html; charset=UTF-8');
parsed.essence; // => 'text/html'
parsed.type; // '=> text'
parsed.subtype; // => 'html'
parsed.parameters.get('charset'); // => 'utf-8' (lowercased by default)

// Parses and serializes MIME type back
normalize('Text/HTML ; Charset = UTF-8');
// => 'text/html;charset=utf-8'

// Parameter helpers
getParameter('application/json; charset=utf-8', 'charset'); // => 'utf-8'
setParameter('image/png', 'quality', '85'); // => 'image/png;quality=85'
removeParameter('text/plain; charset=utf-8', 'charset'); // => 'text/plain'

// Update type, subtype, or essence
update('application/javascript', 'type', 'text'); // => 'text/javascript'

// Serialize a record back to a string
serialize(parse('video/mp4')); // => 'video/mp4'
```

Input/output shape is preserved automatically — pass a string and get a string back; pass a record and get a record back.

### Meta — queries & guards

```typescript
import {
    canonicalize,
    getMeta,
    getCharset,
    getMimeByExt,
    isJson,
    isImage,
    isArchive,
    isCompressible,
    isVendorTree,
    isWellKnown,
} from '@budsbox/lib-mime/meta';

// Canonicalize aliases to their preferred form
canonicalize('application/javascript'); // => 'text/javascript'
canonicalize('text/xml'); // => 'application/xml'

// Look up metadata
getMeta('application/json');
// => { extensions: Set { 'json', 'map' }, source: 'iana', charset: 'UTF-8', compressible: true }

getCharset('text/html'); // => 'utf-8'
getMimeByExt('package.json'); // => 'application/json'

// Content-type guards
isJson('application/vnd.api+json'); // => true  (suffix +json)
isImage('image/webp'); // => true
isArchive('application/x-tar'); // => true
isCompressible('text/html'); // => true
isVendorTree('application/vnd.ms-excel'); // => true
isWellKnown('application/octet-stream'); // => true
```

## API Reference

Full API documentation is available at **[budsbox.gitlab.io/fe/seed/lib-mime](https://budsbox.gitlab.io/fe/seed/lib-mime)** _(TypeDoc)_.

## License

[MIT](./LICENSE)

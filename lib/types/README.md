## @budsbox/lib-types

This package contains a large number of utilities for working efficiently with types in TypeScript. It aims to _complement_, not replace, `type-fest`—except for a few specific cases like {@link IsEmptyObject} or {@link TupleN}, whose implementations in `type-fest` (for one reason or another) didn’t work for me.

It also includes types that are used in almost all packages in the monorepo (mostly types from `Core` and `General`), such as {@link Nil}. These are considered the canonical choices for use in the relevant places (specifically, `Nil` is used instead of `null | undefined`).

I split this package into categories for easier navigation.

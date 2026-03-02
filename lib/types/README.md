## @budsbox/lib-types

This package contains a large number of utilities for working efficiently with types in TypeScript. It aims to _complement_, not replace, {@link https://github.com/sindresorhus/type-fest type-fest}—except for a few specific cases like {@link .!IsEmptyObject IsEmptyObject} or {@link .!TupleN TupleN}, whose implementations in `type-fest` for one reason or another didn’t work for me.

It also includes types that are used in almost all packages in the monorepo (mostly types from `Core` and `General` categories), such as {@link .!Nil Nil}. These are considered the canonical choices for use in the relevant places of this monorepo (specifically, `Nil` is used instead of `null | undefined`).

This package is split into categories for easier navigation.

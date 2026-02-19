---
apply: by model decision
instructions: apply it when writing documentation or JSDoc
---

-   DO NOT use HTML tags such as <p>, <ul>, <li>, etc.
-   Do not generate type annotations in JSDoc but preserve the original type declarations.
-   Do not use tags like @interface, @public, @private, or other tags which semantic value may be expressed using TypeScript syntax.
-   Do not write jsdoc for entities preceeded with `// eslint-disable-next-line jsdoc/require-jsdoc`.
-   Use TypeDoc flavor of JSDoc.
-   Make it clear and concise.
-   Prefer @module to @packageDocumentation.
-   Add an @typeParam tag for each generic argument exclusively when the entity for which you are writing documentation is a generic type alias, a generic function, or a generic class.
-   Write at least one example for every exported "simple" (in common sense) function, method, or generic type, and two for "complex" (again, in common sense) functions, methods, and generic types.
-   Wrap references of ecmascript built-ins with `{@link <reference>}` tag. Do not wrap `true`, `false`, numbers and string. Wrap built-ins in jsdoc (`JSON` become `{@link JSON}`, and so on).
-   IF a function throws an error, mention it in JSDoc using the @throws tag.
-   When a function has multiple overloads, provide JSDoc for each overload individually rather than for the implementation itself. Mark every overload with inline tag `{@label IDENTIFIER}`. The identifier specified by the @label tag should contain only A-Z, 0-9, and \_, and should not start with a number.
-   Whenever you mention other imported or exported entity use {@link} tag to link this entity.
-   When you write JSDoc for the whole file, write a top-most JSDoc annotation with an empty @module tag that describes the content and the purpose of the file.

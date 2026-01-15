---
apply: by model decision
instructions: apply it when writing documentation or JSDoc
---

Value or @since tags.

-   DO NOT use HTML tags such as <p>, <ul>, <li>, etc.
-   Do not generate type annotations in JSDoc but preserve the original type declarations.
-   Do not use tags like @interface, @public, @private or other tags which semantic value may be expressed using TypeScript syntax.
-   Use TypeDoc flavor of JSDoc.
-   Make it clear and concise.
-   Prefer @module to @packageDocumentation.
-   Add an @typeParam tag for each generic argument exclusively when the entity for which you are writing documentation is a generic type alias, a generic function, or a generic class.
-   IF a function throws an error, mention it in JSDoc using the @throws tag.
-   When a function has multiple overloads, provide JSDoc for each overload individually rather than for the implementation itself.
-   Whenever you mention other imported or exported entity use {@link} tag to link this entity.
-   When you write JSDoc for the whole file, write a top-most JSDoc annotation with empty @module tag that describes the content and the purpose of the file.

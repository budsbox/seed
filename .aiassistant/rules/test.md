---
apply: by model decision
instructions: Appy it when you write regular (non-type) tests
---

Use vitest.
Use `toStrictEqual` instead of `toEqual` for objects/records/sets/maps and so on, and use `toBe` for primitives.
Use `test(` instead of `it(`.
Use `describe.concurrent` where applicable.
Cover negative cases (exceptions, null-cases, omitted arguments and so on).
For tests with incorrect argument types use `as never` instead of `as any` or `@ts-expect-error`.
Test functions, constructors and methods with invalid arguments using `expect(...).toThrowError(new TypeError(<message>))`
(TypeError is just an example, it may be some other Error constructor).
Explicitly define a return type of the functions you create.
Do not write type tests.
To verify if a function has been invoked, use `vi.fn` together with `expect(fn).toHaveBeenCalled()` or `expect(fn).not.toHaveBeenCalled()`.

---
apply: by model decision
instructions: Appy it when you write tests
---

Use vitest.
Use `toStrictEqual` instead of `toEqual` for objects/records/sets/maps and so on, and use `toBe` for primitives.
Use `test(` instead of `it(`.
Use `describe.concurrent` where applicable.
Cover negative cases (exceptions, null-cases, omitted arguments and so on).
Test functions, constructors and methods with invalid arguments, expect TypeError to be thrown.

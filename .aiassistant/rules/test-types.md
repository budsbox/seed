---
apply: by model decision
instructions: apply it when you write type tests
---

Use vitest with `expectTypeOf` from vitest for type testing.
Use `test(` instead of `it(`.
Group tests by function using `describe()` blocks.
Do NOT use `describe.concurrent` for type tests (type tests run at compile time).
Use `toEqualTypeOf` for exact type equality checks.
Use `toMatchObjectType` for structural object type checks when exact equality is not required.
Use `.branded.toEqualTypeOf()` when testing union types that fail exact equality due to TypeScript's structural typing.
Test type narrowing behavior by checking both the narrowed type and the else branch type.
When testing union type narrowing, use `as` type assertions (e.g., `const value = 'test' as string | number`) to prevent TypeScript from auto-narrowing the type.
Never rely on TypeScript's automatic type narrowing from literal values when testing union types.
Test parameter types using `.parameter(index).toEqualTypeOf<ExpectedType>()`.
Test return types using `.returns.toEqualTypeOf<ExpectedType>()`.
For type guards and assertion functions, test narrowing from `unknown`, from union types, and from nullable types.
Test edge cases like readonly arrays, tuple types, literal types, and const assertions.
For functions with overloads, test each overload's behavior separately.
Test generic type parameters when applicable.
Verify that functions preserve type information (e.g., readonly modifiers, tuple types, literal types).

import type {
  ComponentPropsWithRef,
  ComponentType,
  ExoticComponent,
  ForwardRefExoticComponent,
  NamedExoticComponent,
} from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Defines a record mapping string keys to specific React component types.
 *
 * @typeParam TProps - The type of props accepted by the components. Defaults to `any` if unspecified.
 * @remarks
 * @remarks The record values can include:
 * - `ComponentType`: A React component that may function as a standalone or class-based component.
 * - `ExoticComponent`: A component with "exotic" behavior, typically requiring `React.memo`.
 * - `ForwardRefExoticComponent`: A forward-ref component, allowing consumers to access the wrapped component's ref.
 * - `NamedExoticComponent`: An exotic component with an assigned display name for debugging purposes.
 */
export type ViewsRecord<TProps = any> = Record<
  string,
  | ComponentType<TProps>
  | ExoticComponent<TProps>
  | ForwardRefExoticComponent<TProps>
  | NamedExoticComponent<TProps>
>;

/**
 * A utility type `WithView` that transforms a set of view components (`TViews`) into a union of
 * React component props, allowing for the type-safe representation of components with a `view` prop.
 * The `view` prop acts as a discriminator for which a specific view component is being represented.
 *
 * @typeParam TViews - A record type that maps view names to their corresponding components.
 * @typeParam TDefaultViewName - The key in the `TViews` record that represents the default view.
 * @typeParam TModelProp - A string key (default: 'model') that specifies a prop to be omitted from each view's props.
 * @remarks
 * - For the view corresponding to `TDefaultViewName`, the `view` prop is optional.
 * - For all other views, the `view` prop is required.
 * - All view props are based on the props of the associated component in `TViews`, excluding any prop keyed by `TModelProp`.
 */
export type WithView<
  TViews extends ViewsRecord,
  TDefaultViewName extends keyof TViews,
  TModelProp extends string = 'model',
> = {
  [K in keyof TViews]: (K extends TDefaultViewName ? Partial<Record<'view', K>>
  : Record<'view', K>) &
    Omit<ComponentPropsWithRef<TViews[K]>, TModelProp>;
}[keyof TViews];

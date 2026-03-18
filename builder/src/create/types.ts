import type { Options } from 'execa';
import type {
  Arrayable,
  LiteralUnion,
  OmitIndexSignature,
  PackageJson,
} from 'type-fest';

import type { Maybe, Undef } from '@budsbox/lib-types';

import type { archetypeExtendControlSymbol } from './const.js';

/**
 * Represents a type alias for defining specific archetype names.
 */
export type ArchetypeName =
  | 'app'
  | 'base'
  | 'browser'
  | 'browser-lib'
  | 'iso-lib'
  | 'lib'
  | 'node'
  | 'node-lib'
  | 'parser'
  | 'peggy'
  | 'react'
  | 'react-app'
  | 'react-component'
  | 'react-component-large'
  | 'react-lib';

/**
 * Represents a control symbol used for archetype extension.
 */
export type ArchetypeExtendControlSymbol = typeof archetypeExtendControlSymbol;

type CommandOptions = Omit<Options, 'cwd' | 'shell' | 'stdio'>;

/**
 * Represents a command that can be executed. A command can be either a structured object meant for external commands
 * specifying a workspace and the command to execute, or a simple string representing a command.
 *
 * In the case of an object, the `workspace` refers to the specific workspace context in which the command should run,
 * and `exec` defines the actual command to execute.
 *
 * Types:
 * - Object: Represents an external command with metadata, including the workspace.
 * - String: Represents a raw command to run inside the created workspace.
 */
export type Command =
  | string // for local commands
  | {
      /**
       * A workspace name without an optional scope, specifying the context for execution.
       *
       * @defaultValue the new workspace ident
       */
      readonly workspace?: string;

      /**
       * The execution command to be run in the given workspace.
       */
      readonly exec: string;

      /**
       * Represents optional configuration settings that can be provided to customize behavior.
       *
       * @remarks
       * The `options` property is optional and can include various settings based on the `Options` interface.
       * @typeParam Options - An interface or type that defines the structure of the available options.
       */
      options?: CommandOptions;
    };

/**
 * Represents a fully resolved command including its execution details and workspace information.
 */
export interface ResolvedCommand {
  /**
   * The current working directory of the command — the root of the workspace.
   */
  readonly cwd: string;

  /**
   * The execution command to be run in the given workspace.
   */
  readonly exec: string;

  /**
   * Fully resolved workspace name, including scope if applicable.
   */
  readonly workspace: string;

  /**
   * Represents the configuration options for a command.
   *
   * This variable contains settings that define the behavior, parameters,
   * and operational context of a specific command.
   *
   */
  options?: Undef<CommandOptions>;
}

/**
 * Represents a collection of archetype files where the key is the file name and the value is the file content.
 */
export type ArchetypeFiles = Readonly<Record<string, Maybe<string>>>;

/**
 * Represents a partial package manifest, excluding all the dependencies.
 * This type is based on the `PackageJson type`, but the index signature is removed
 * because TypeScript fails to infer the correct final type if it's present.
 * I don't restore it lately because it's unnecessary.
 * If you need it, you can extend the `NonStandardEntryPoints` interface from 'type-fest'.
 * I also restrict the `exports` property to a record type for simplicity.
 */
export type ArchetypeManifest = Omit<
  OmitIndexSignature<PackageJson>,
  'dependencies' | 'devDependencies' | 'exports' | 'peerDependencies'
> & { exports?: Extract<PackageJson['exports'], Record<string, unknown>> };

/**
 * Represents the configuration settings for an archetype, which is a blueprint or template
 * used to create or extend workspaces, manage dependencies, and define custom operations.
 *
 * @typeParam TName - Extends `ArchetypeName` and denotes the specific archetype identifiers
 * used to extend or reference archetypes in the configuration.
 */
export interface Archetype<TName extends ArchetypeName = ArchetypeName> {
  /**
   * The parent directory path where all workspaces of this archetype will be created.
   * This path is used as the base location for scaffolding new project instances
   * and organizing workspace structures.
   * Configurable with the `--at` flag.
   */
  readonly at?: string;

  /**
   * A list of commands to run.
   */
  readonly commands?: Array<
    LiteralUnion<Command, ArchetypeExtendControlSymbol>
  >;

  /**
   * A list of dependencies to install.
   */
  readonly dependencies?: ReadonlyArray<
    LiteralUnion<string, ArchetypeExtendControlSymbol>
  >;

  /**
   * A list of devDependencies to install.
   */
  readonly devDependencies?: ReadonlyArray<
    LiteralUnion<string, ArchetypeExtendControlSymbol>
  >;

  /**
   * A list of archetypes to extend from.
   */
  readonly extends?: Readonly<Arrayable<Exclude<ArchetypeName, TName>>>;

  /**
   * Map of files to create in the archetype workspace.
   */
  readonly files?: ArchetypeFiles;

  /**
   * Set to `true` to prevent the creation of this archetype instances (marks it as "extend-only")
   */
  readonly internal?: boolean;

  /**
   * Represents a partial package manifest, excluding the dependencies,
   * devDependencies, and peerDependencies properties from the standard
   * PackageJson type.
   *
   * This property allows for specifying relevant fields of a package.json
   * configuration, excluding dependency-related keys.
   *
   */
  manifest?: ArchetypeManifest;

  /**
   * A list of peerDependencies to install.
   */
  readonly peerDependencies?: ReadonlyArray<
    LiteralUnion<string, ArchetypeExtendControlSymbol>
  >;
}

/**
 * Represents a type of fully resolved configuration for a specific archetype.
 *
 * @typeParam TName - Extends `ArchetypeName` and denotes the specific archetype identifiers
 * used to extend or reference archetypes in the configuration.
 */
export type ArchetypeResolved<TName extends ArchetypeName> = Omit<
  Required<Archetype<TName>>,
  'extends'
> & {};

/**
 * Represents a mapping of Archetype names to their corresponding Archetype objects.
 *
 * This type is used to define a collection where each key is an `ArchetypeName` and
 * its value is an `Archetype` associated with that name. The `ArchetypeMap` allows
 * for a structured organization of archetypes, enabling efficient retrieval and management.
 */
export type ArchetypeMap = {
  readonly [TName in ArchetypeName]: Archetype<TName>;
};

/**
 * Represents a file that will be created or overwritten during the creation of a workspace.
 */
export interface PlannedFile {
  /**
   * A string representation of the file content
   */
  readonly content: string;

  /**
   * A flag indicating whether the file will be overwritten
   */
  readonly isOverwrite: boolean;

  /**
   * An absolute path to the file
   */
  readonly path: string;
}

/**
 * Represents a plan for creating a new workspace.
 */
export interface Plan {
  /**
   * Archetype name
   */
  readonly archetype: ArchetypeName;

  /**
   * A resolved value of the `at` option
   */
  readonly at: string;

  /**
   * A list of commands to run.
   */
  commands: readonly ResolvedCommand[];

  /**
   * A path to the new workspace
   */
  readonly cwd: string;

  /**
   * A list of files that will be created or overwritten during the creation of the workspace.
   */
  readonly files: readonly PlannedFile[];

  /**
   * A fully resolved workspace name, including scope if applicable.
   */
  readonly ident: string;

  /**
   * A name of the new workspace
   */
  readonly name: string;

  /**
   * A flag indicating whether the directory for the new workspace will be created
   */
  readonly willCreateCwd: boolean;
}

/**
 * Represents an object containing resolved JSON data and its corresponding path.
 *
 * @typeParam T - The type of the JSON data.
 */
export interface ResolvedJson<T> {
  /**
   * The path to the JSON file.
   */
  path: string;
  /**
   * The parsed JSON data.
   */
  json: T;
}

/**
 * Configuration options for the file lookup.
 */
export interface LookupFileOptions {
  /**
   * The directory to start the search from. Defaults to the current working directory.
   */
  startDir?: string;
  /**
   * The name of the file to search for.
   */
  filename: string;
  /**
   * The directory at which to stop the search. Defaults to the root directory ('/').
   */
  stopDir?: string;
  /**
   * A `Map` object used to cache the lookup results.
   */
  cache?: Map<string, string>;
}

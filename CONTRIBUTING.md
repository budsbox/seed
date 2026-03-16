# Contributing to BudsBox monorepo

Thank you for contributing!

I've prepared a short guide so that the process of making your contribution is as simple and clear as possible. Please check it out before you contribute!

## Contribute code

Contributing code requires the inclusion of relevant tests for the code being added or changed. Contributions without accompanying tests will be held off until a test is added unless the maintainers consider the specific tests to be either impossible or way too much of a burden for such a contribution.

**How to contribute:**

Pull requests are the easiest way to contribute changes to git repos at GitHub. They are the preferred contribution method, as they offer a convenient way of commenting and amending the proposed changes.

-   Please check that no one else has already created a pull request with these or similar changes
-   Use a "feature branch" for your changes. That separates the changes in the pull request from your other changes and makes it easy to edit/amend commits in the pull request
-   **Run `pre-checkin` script to format, lint, build and test changes**
-   Make sure your changes are well formatted and that all tests are passing
-   If your pull request is connected to an open issue, please, leave a link to this issue in the `Related issue:` section
-   If you later need to add new commits to the pull request, you can simply commit the changes to the local branch and then push them. The pull request gets automatically updated.

## Initial setup

1. The project supports only UNIX-compatible environments, so when working on Windows you need to use [WSL](https://learn.microsoft.com/en-us/windows/wsl/install).
2. Install [nvm](https://github.com/nvm-sh/nvm) for Node.JS version management.
3. Run the following commands (this takes a few minutes):
    ```shell
    nvm use
    corepack enable
    yarn
    yarn setup
    ```

### VSCode configuration

For the project to work correctly in VSCode, please install the recommended extensions. VSCode should automatically prompt you to install them when you first open the project; if that doesn't happen, please [refer to the instructions](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace#_workspace-recommended-extensions) for manual installation.

## Deprecated Workspaces

DO NOT use and/or add them as dependency when creating any new workspace.

-   `@budsbox/build` — superseded by `@budsbox/builder` (in progress)
-   `@budsbox/linting` — superseded by `@budsbox/eslint` and it's plugins
-   `@budsbox/iso-utils` — superseded by `@budsbox/lib-es`
-   `@budsbox/node-utils` — superseded by `@budsbox/lib-node`

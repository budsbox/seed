# Buds Sandbox

Just to fill a space:

[Zen of Python](https://peps.python.org/pep-0020/#the-zen-of-python)

## To start development

First,

```shell
nvm use && yarn
```

After that, if you use **Webstorm**, you can use ready-to-go configuration "start",
or else

```shell
yarn watch-scss-types
```

and in a different process

```shell
yarn dev
```

## Port

```
localhost:5024 #default
```

If you want to change it just create `.env` file with `PORT=<number>`

# Vite template: React + TypeScript

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh

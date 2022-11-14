## Overview

This guide will show you how to initialize the [Glue42 Web](../../../../reference/core/latest/glue42%20web/index.html) library in a simple JavaScript app.

## Referencing Glue42 Web

Install the [`@glue42/web`](https://www.npmjs.com/package/@glue42/web) package from NPM and reference the library file directly, or reference the Glue42 Web library in your web apps with a link to UNPKG.

- From NPM:

Install the `@glue42/web` package in the root directory of your project:

```cmd
npm install @glue42/web
```

Reference the library in your web app:

```html
<script src="./node_modules/@glue42/web/dist/web.umd.js">
```

- From UNPKG:

Reference the library in your web app:

```html
<script src="https://unpkg.com/@glue42/web@latest/dist/web.umd.js"></script>
```

Referencing the Glue42 Web library script will attach a `GlueWeb()` factory function to the `window` object.

## Initialization

Initialize the Glue42 Web library by invoking the exposed `GlueWeb()` factory function. It accepts an *optional* [`Config`](../../../../reference/core/latest/glue42%20web/index.html#Config) object in which you can specify settings regarding the Glue42 APIs.

Below is an example of initializing the Glue42 Web library with the default settings:

```javascript
import GlueWeb from "@glue42/web";

// Use the object returned from the factory function
// to access the Glue42 APIs.
const glue = await GlueWeb();
```

Initializing the Glue42 Web library with custom settings:

```javascript
import GlueWorkspaces from "@glue42/workspaces-api";
import GlueWeb from "@glue42/web";

const initializeGlue42 = async () => {

    // Initializing the Workspaces library.
    const initOptions = {
        libraries: [GlueWorkspaces]
    };

    // Use the object returned from the factory function
    // to access the Glue42 APIs.
    const glue = await GlueWeb(initOptions);

    // Here Glue42 Web is initialized and you can access all Glue42 APIs.
};

initializeGlue42().catch(console.error);
```
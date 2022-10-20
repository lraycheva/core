## Overview

The [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) package is a [Plugin](../../capabilities/plugins/index.html) for [**Glue42 Core**](https://glue42.com/core/). It is free to install from the public NPM registry, but requires a valid license to operate. The [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) Plugin is passed to and enabled in the [Main app](../core-concepts/web-platform/overview/index.html) via its [initialization configuration](../core-concepts/web-platform/setup/index.html#configuration). It is defined in the dedicated `corePlus` property of the configuration object, unlike other standard Plugins, which are defined in the `plugins` property. This ensures that [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) is initialized after any other Plugin.

*For information on purchasing the [**Glue42 Core+**](https://glue42.com/core-plus/) Plugin or requesting a trial license, [contact us](https://glue42.com/contacts/) at `info@glue42.com`.*

## Installation

To use the [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) package in your [**Glue42 Core+**](https://glue42.com/core-plus/) project, execute the following command:

```cmd
npm install @glue42/core-plus
```

## Setup

To enable the [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) Plugin, you must provide a valid license key using the `licenseKey` property of the `corePlus` configuration object.

The following example demonstrates how to enable the [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) Plugin and configure the [Global Layouts](../../capabilities/windows/layouts/setup/index.html) and [connecting to a Glue42 Server](../../capabilities/connectivity-to-glue42-server/index.html) functionalities it provides:

```javascript
import GlueWebPlatform from "@glue42/web-platform";
import GlueWorkspaces from "@glue42/workspaces-api";
import Glue42CorePlus from "@glue42/core-plus";

const config = {
    glue: {
        libraries: [GlueWorkspaces]
    },
    workspaces: {
        src: "http://localhost:3000"
    },
    corePlus: {
        // Passing the factory function exposed by the Glue42 Core+ Plugin.
        start: Glue42CorePlus,
        config: {
            // Providing a valid license key.
            licenseKey: "my-license-key",
            // Configuration for Global Layouts.
            layouts: {
                enabled: true,
                critical: true
            },
            // Configuration for connecting to a Glue42 Server.
            server: {
                url: "https://server-demos.glue42.com:4081/api",
                auth: {
                    basic: {
                        username: "username",
                        password: "password"
                    }
                },
                fetchIntervalMS: 10000,
                tokenRefreshIntervalMS: 15000,
                critical: true
            }
        },
        critical: true
    }
};

const { glue } = await GlueWebPlatform(config);
```

The `corePlus` object has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `start` | `(glue, config, platform) => Promise<void>` | **Required**. Function that will receive as arguments a fully initialized `glue` object, the `config` object specified in the definition and a `platform` object which can be used to handle system messages and logging. |
| `config` | `object` | Configuration that will be passed to the [**Glue42 Core+**](https://glue42.com/core-plus/) Plugin. |
| `critical` | `boolean` | If `true`, the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library will wait for the [**Glue42 Core+**](https://glue42.com/core-plus/) Plugin to be fully operational before completing its initialization. Defaults to `false`. |

The `config` object has the following properties, all of which are optional:

| Property | Type | Description |
|----------|------|-------------|
| `licenseKey` | `string` | Valid license key for enabling the [**Glue42 Core+**](https://glue42.com/core-plus/) Plugin. |
| `layouts` | `object` | Configuration for [Global Layouts](../../capabilities/windows/layouts/setup/index.html). |
| `server` | `object` | Configuration for [connecting to a Glue42 Server](../../capabilities/connectivity-to-glue42-server/index.html). |
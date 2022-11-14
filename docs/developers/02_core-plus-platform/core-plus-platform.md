## Overview

The [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) package is free to install from the public NPM registry, but requires a valid license. The library operates similarly to the [Web Platform](../core-concepts/web-platform/overview/index.html) library and is meant to be used in the Main app of a [**Glue42 Core+**](https://glue42.com/core-plus/) project. This app is responsible for configuring the entire Glue42 environment and acts as a central hub for all [Web Client](../core-concepts/web-client/overview/index.html) apps in your [**Glue42 Core**](https://glue42.com/core/) project. All Glue42 operations are routed through this Main app, meaning that this is the place where you can get centralized logging, information about all operations and details about the general state of your project. The configuration for all Glue42 libraries (e.g., App Management, Layouts, Workspaces, Plugins, Notifications) is handled here.

The Main app also provides tracking and control over non-Glue42 apps opened through it. The level of control is limited, but all basic operations are available - open, close, receiving events, listing, adding and manipulating via [Workspaces](../../capabilities/windows/workspaces/overview/index.html).

*For information on purchasing the [**Glue42 Core+**](https://glue42.com/core-plus/) platform or requesting a trial license, [contact us](https://glue42.com/contacts/) at `info@glue42.com`.*

## Initialization

To use the [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) package in your [**Glue42 Core+**](https://glue42.com/core-plus/) project, execute the following command:

```cmd
npm install @glue42/core-plus
```

Import the package in your Main app and initialize the [**Glue42 Core+**](https://glue42.com/core-plus/) library using the `Glue42CorePlus()` factory function:

```javascript
import Glue42CorePlus from "@glue42/core-plus";

const config = {
    licenseKey: "my-license-key"
};

// Use the `glue` property of the object returned
// by the factory function to access the Glue42 APIs.
const { glue } = await GlueWebPlatform(config);
```

The factory function will initialize and configure everything needed for a fully functioning [**Glue42 Core+**](https://glue42.com/core-plus/) project.

## Configuration

To enable the [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) platform, you must provide a valid license key using the `licenseKey` property of the configuration object passed to the `Glue42CorePlus()` factory function.

The following example demonstrates how to enable the [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) platform, enable [Workspaces](../../capabilities/windows/workspaces/overview/index.html), and configure the [Global Layouts](../../capabilities/windows/layouts/setup/index.html) and [connecting to a Glue42 Server](../../capabilities/connectivity-to-glue42-server/index.html):

```javascript
import Glue42CorePlus from "@glue42/core-plus";
import GlueWorkspaces from "@glue42/workspaces-api";

const config = {
    // Providing a valid license key.
    licenseKey: "my-license-key",
    glue: {
        // Enabling the Workspaces API.
        libraries: [GlueWorkspaces]
    },
    workspaces: {
        // Specifying the location of the Workspaces App.
        src: "https://my-workspaces-app.com"
    },
    // Configuration for Global Layouts.
    layouts: {
        enabled: true
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
};

const { glue } = await Glue42CorePlus(config);
```

The configuration object passed to the `Glue42CorePlus()` factory function extends the configuration object for the [Web Platform](../core-concepts/web-platform/setup/index.html#configuration) factory function, but has the following additional properties:

| Property | Type | Description |
|----------|------|-------------|
| `licenseKey` | `string` | Valid license key for enabling the [**Glue42 Core+**](https://glue42.com/core-plus/) platform. |
| `layouts` | `object` | Configuration for [Global Layouts](../../capabilities/windows/layouts/setup/index.html). |
| `server` | `object` | Configuration for [connecting to a Glue42 Server](../../capabilities/connectivity-to-glue42-server/index.html). |

## Seed Project

If you want to get acquainted and experiment with a basic project built with the [**Glue42 Core+**](https://glue42.com/core-plus/) platform, skipping the required setup and configurations, you can use the [Glue42 Core+ Seed Project](https://github.com/Glue42/core-plus-seed) in GitHub. All you need to activate the project is your valid license key.

The project provides a fully configured multi-app - a [Workspaces App](../../capabilities/windows/workspaces/workspaces-app/index.html) acting as a [**Glue42 Core+**](https://glue42.com/core-plus/) Main app, with an open Workspace containing several apps, including enterprise-level [Interop Viewer](https://docs.glue42.com/developers/dev-tools/index.html#interop_viewer) and [Context Viewer](https://docs.glue42.com/developers/dev-tools/index.html#context_viewer) apps.
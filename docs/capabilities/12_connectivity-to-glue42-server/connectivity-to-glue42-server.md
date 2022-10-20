## Overview

A [**Glue42 Core+**](https://glue42.com/core-plus/) project can connect to a Glue42 Server and use its functionalities.

[Glue42 Server](https://docs.glue42.com/glue42-concepts/glue42-server/index.html) is a server-side app that provides data to Glue42 (apps, Layouts, preferences) and allows monitoring and interacting with users running Glue42.

It also includes an Admin UI that helps managing the data stored in the Glue42 Server easier.

<glue42 name="diagram" image="../../images/server/server-architecture.png">

*For more details about the Glue42 Server, see the [Glue42 Server](https://docs.glue42.com/glue42-concepts/glue42-server/index.html) section of the [**Glue42 Enterprise**](https://glue42.com/enterprise/) documentation.*

Currently, the [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) Plugin allows:

- opening a session and authenticating with a Glue42 Server - both basic and token-based authentication mechanisms are supported. You can also provide custom headers to be included in every request;

- fetching [app definitions](../application-management/index.html#app_definitions) and [Layouts](../windows/layouts/setup/index.html) and importing them into the current [**Glue42 Core+**](https://glue42.com/core-plus/) environment;

## Setup

*Note that this feature is available only under a paid license for [**Glue42 Core+**](https://glue42.com/core-plus/). For information on purchasing the [**Glue42 Core+**](https://glue42.com/core-plus/) Plugin or requesting a trial license, [contact us](https://glue42.com/contacts/) at `info@glue42.com`. For more details on how to enable the [**Glue42 Core+**](https://glue42.com/core-plus/) Plugin, see the [Developers > Glue42 Core+ Plugin](../../developers/core-plus-plugin/index.html) section.*

Use the `server` property of the `config` object in the [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) Plugin configuration to specify settings for the connection to the Glue42 Server. The following example demonstrates configuring the connection to a Glue42 Server using basic authentication:

```javascript
import GlueWebPlatform from "@glue42/web-platform";
import Glue42CorePlus from "@glue42/core-plus";

const config = {
    corePlus: {
        start: Glue42CorePlus,
        config: {
            licenseKey: "my-license-key",
            server: {
                // URL pointing to a Glue42 Server.
                url: "https://server-demos.glue42.com:4081/api",
                // Basic authentication.
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
        }
    }
};

const { glue } = await GlueWebPlatform(config);
```

The `server` object has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `url` | `string` | **Required.** URL pointing to a Glue42 Server. |
| `auth` | `object` | **Required.** User authentication configuration. |
| `headers` | `object` | Object containing key/value pairs of headers to be sent with every request.  |
| `fetchIntervalMS` | `number` | Interval in milliseconds at which a new snapshot of app definitions and Layouts will be fetched from the Glue42 Server. Defaults to 60000. |
| `tokenRefreshIntervalMS` | `number` | Interval in milliseconds at which the session token will be refreshed. Defaults to 3600000. |
| `critical` | `boolean` | If `true`, the [`@glue42/core-plus`](https://www.npmjs.com/package/@glue42/core-plus) Plugin will wait for this module to be fully operational before completing its initialization. Defaults to `false`. |

The `auth` object has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `basic` | `object` | Object with required `username` and `password` properties for providing basic authentication. |
| `username` | `string` | Username for token-based authentication. |
| `token` | `object` | Object with an optional `bearer` property holding an authentication token. |
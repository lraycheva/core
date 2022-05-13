## Overview

The [Main app](../../developers/core-concepts/web-platform/overview/index.html) can be configured to constantly check for the presence of a locally installed [**Glue42 Enterprise**](https://glue42.com/enterprise/). If such an instance is discovered, the Main app and all of its [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps will attempt to switch their Glue42 connection to [**Glue42 Enterprise**](https://glue42.com/enterprise/). If this operation is successful, the [**Glue42 Core**](https://glue42.com/core/) environment will be able to fully interoperate with all [**Glue42 Enterprise**](https://glue42.com/enterprise/) clients.

This enables [**Glue42 Core**](https://glue42.com/core/) projects to seamlessly integrate with [**Glue42 Enterprise**](https://glue42.com/enterprise/) without disrupting any of the running [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps.

## Behavior

As soon as the [Main app](../../developers/core-concepts/web-platform/overview/index.html) discovers a running instance of [**Glue42 Enterprise**](https://glue42.com/enterprise/) and manages to connect to it, all current [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps follow suit. The connection switch is executed without the apps reloading or flickering and is completely invisible to the end user. However, changing the connection of a [**Glue42 Core**](https://glue42.com/core/) environment has numerous effects in all aspects of the Glue42 functionalities, explained in the following sections.

### Shared Contexts & Channels

Switching between a [**Glue42 Core**](https://glue42.com/core/) and a [**Glue42 Enterprise**](https://glue42.com/enterprise/) connection is handled seamlessly for the [Shared Contexts](../../capabilities/data-sharing-between-apps/shared-contexts/index.html) library. If the [Main app](../../developers/core-concepts/web-platform/overview/index.html) is configured to look for a [**Glue42 Enterprise**](https://glue42.com/enterprise/) connection, it will monitor all shared contexts and will be aware of their latest state. Once a connection switch happens, the Main app will be the last one to reconnect, ensuring that the latest state of all shared contexts is restored. All shared context [subscriptions](../../capabilities/data-sharing-between-apps/shared-contexts/index.html#subscribing_for_context_updates) will be preserved and everything is executed without any visual interruption.

The Glue42 [Channels](../../capabilities/data-sharing-between-apps/channels/index.html) are based on [Shared Contexts](../../capabilities/data-sharing-between-apps/shared-contexts/index.html). This provides full integration when connecting to [**Glue42 Enterprise**](https://glue42.com/enterprise/). Both a [**Glue42 Core**](https://glue42.com/core/) app and a [**Glue42 Enterprise**](https://glue42.com/enterprise/) app listening for changes to the same Glue42 Channel will be notified at the same time when the Channel data has been updated.

### Interop

Upon a connection change, the [Interop](../../capabilities/data-sharing-between-apps/interop/index.html) library will re-initiate and re-announce its current state. This means that all [**Glue42 Core**](https://glue42.com/core/) clients, including the [Main app](../../developers/core-concepts/web-platform/overview/index.html), will preserve their respective `peerId` and `instance` ID. All registered Interop [methods](../../capabilities/data-sharing-between-apps/interop/index.html#method_registration), [streams](../../capabilities/data-sharing-between-apps/interop/index.html#publishing_stream_data) and [subscriptions](../../capabilities/data-sharing-between-apps/interop/index.html#consuming_stream_data) will be preserved and carried over to the new connection.

### Applications, Windows & Workspaces

The functionality of the [Application Management](../../capabilities/application-management/index.html) and [Window Management](../../capabilities/windows/window-management/index.html) libraries won't change in any way when a [**Glue42 Core**](https://glue42.com/core/) environment connects to a [**Glue42 Enterprise**](https://glue42.com/enterprise/) instance. This means that the [`list()`](../../reference/core/latest/windows/index.html#API-list) method of the Window Management API will always return a collection consisting only of the currently opened [**Glue42 Core**](https://glue42.com/core/) windows, regardless of the connection state. The [`open()`](../../reference/core/latest/windows/index.html#API-open) method of the Window Management API and the [`start()`](../../reference/core/latest/appmanager/index.html#Application-start) method of an app instance will always open a [**Glue42 Core**](https://glue42.com/core/) window or start a [**Glue42 Core**](https://glue42.com/core/) app respectively when called from a [**Glue42 Core**](https://glue42.com/core/) app.

The same is applicable to the [Workspaces](../../capabilities/windows/workspaces/overview/index.html) library. Calling any of the [Workspaces API](../../reference/core/latest/workspaces/index.html#API) methods from a [**Glue42 Core**](https://glue42.com/core/) app will always open, fetch data or manipulate a [**Glue42 Core**](https://glue42.com/core/) Workspace, regardless of whether or not the [**Glue42 Core**](https://glue42.com/core/) environment is connected to [**Glue42 Enterprise**](https://glue42.com/enterprise/).

### Notifications

There aren't any changes in the operation of the [Notifications](../../capabilities/notifications/setup/index.html) library when connected to a [**Glue42 Enterprise**](https://glue42.com/enterprise/) instance. All [raised notifications](../../capabilities/notifications/notifications-api/index.html#raising_notifications) will be [**Glue42 Core**](https://glue42.com/core/) notifications, meaning they will be raised by the browser. However, keep in mind that if you set an [Interop method](../../capabilities/data-sharing-between-apps/interop/index.html#method_registration) as a handler for a [notification click](../../capabilities/notifications/notifications-api/index.html#notification_click-interop_click_handler) or an [action button](../../capabilities/notifications/notifications-api/index.html#notification_actions) of a [**Glue42 Core**](https://glue42.com/core/) notification, this method may also have been registered by a [**Glue42 Enterprise**](https://glue42.com/enterprise/) app. Clicking on the notification or its action buttons will invoke all registered Interop methods with the same name, regardless of whether they have been registered by [**Glue42 Core**](https://glue42.com/core/) or by [**Glue42 Enterprise**](https://glue42.com/enterprise/) apps. So, in a way, acting on a [**Glue42 Core**](https://glue42.com/core/) notification can have effects in [**Glue42 Enterprise**](https://glue42.com/enterprise/).

### Rejected Connections

The following describes the cases when a connection attempt to [**Glue42 Enterprise**](https://glue42.com/enterprise/) may fail entirely or partially:

- When the [Main app](../../developers/core-concepts/web-platform/overview/index.html) has started a [**Glue42 Core**](https://glue42.com/core/) app that uses an old version of the [`@glue42/web`](https://www.npmjs.com/package/@glue42/web) library. In this situation, the [Web Client](../../developers/core-concepts/web-client/overview/index.html) app won't be able to handle the connection switch instructions of the Main app. As a result, the Main app will either ignore this app and proceed with the connection switch or will cancel the connection switch attempt. This is determined by the `forceIncompleteSwitch` setting when configuring the connection settings in the Main app (see the [Configuration](#configuration) section).

- When the [Main app](../../developers/core-concepts/web-platform/overview/index.html) is rejected by [**Glue42 Enterprise**](https://glue42.com/enterprise/) based on origin filtration or a custom authentication mechanism. In this situation, the [**Glue42 Core**](https://glue42.com/core/) environment won't attempt to transfer the [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps and will cancel the reconnection attempt. However, the cycle for discovering [**Glue42 Enterprise**](https://glue42.com/enterprise/) instances will continue, meaning that the Main app will periodically attempt a connection.

- When the connection request of the [Main app](../../developers/core-concepts/web-platform/overview/index.html) is accepted by [**Glue42 Enterprise**](https://glue42.com/enterprise/), but the connection request of a [Web Client](../../developers/core-concepts/web-client/overview/index.html) app is rejected. This may happen due to origin filtration when the Main app and the Web Client app have different origins or as a result of some other custom [**Glue42 Enterprise**](https://glue42.com/enterprise/) authenticator. In this situation, the Main app will either ignore this app and proceed with the connection switch or will cancel the connection switch attempt. This is determined by the `forceIncompleteSwitch` setting when configuring the connection settings in the Main app (see the [Configuration](#configuration) section).

### Default Connection

If the [**Glue42 Enterprise**](https://glue42.com/enterprise/) instance to which the [**Glue42 Core**](https://glue42.com/core/) environment is connected disappears, the [**Glue42 Core**](https://glue42.com/core/) environment will resume its default state and all [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps will fall back to the default [**Glue42 Core**](https://glue42.com/core/) connection to their respective Main app.

## Configuration

Enabling and configuring the discovery of [**Glue42 Enterprise**](https://glue42.com/enterprise/) is executed entirely in the [Main app](../../developers/core-concepts/web-platform/overview/index.html) during the [initialization](../../developers/core-concepts/web-platform/setup/index.html#initialization) of the [`@glue42/web-platform`](https://www.npmjs.com/package/@glue42/web-platform) library. Use the `connection` property of the configuration object to specify settings for the connection to [**Glue42 Enterprise**](https://glue42.com/enterprise/):

```javascript
import GlueWebPlatform from "@glue42/web-platform";

const config = {
    connection: {
        preferred: {
            url: "ws://localhost:8385",
            auth:{
                username: "user",
                password: "password"
            },
            forceIncompleteSwitch: true, // optional, by default is false
            discoveryIntervalMS: 60000 // optional, by default is 15000
        }
    }
};

const { glue } = await GlueWebPlatform(config);
```

The `preferred` property instructs the Main app that in addition to its own default connection, there is an additional one, whose availability is unknown, but is preferred if available. The `preferred` object has the following properties, of which only `url` is required:

| Property | Type | Description |
|----------|------|-------------|
| `url` | `string` | **Required.** A valid URL string pointing to the Glue42 Gateway to which to connect. |
| `auth` | `object` | Defines the authentication data that will be used when trying to connect to the [**Glue42 Enterprise**](https://glue42.com/enterprise/) instance. If this property is not provided, [**Glue42 Core**](https://glue42.com/core/) will attempt a connection with a dedicated [**Glue42 Core**](https://glue42.com/core/) authenticator. |
| `forceIncompleteSwitch` | `boolean` | If `true`, the [Main app](../../developers/core-concepts/web-platform/overview/index.html) will proceed and connect to [**Glue42 Enterprise**](https://glue42.com/enterprise/) when some or all of its clients have been rejected, due to using outdated [`@glue42/web`](https://www.npmjs.com/package/@glue42/web) packages or origin filtration. Default is `false`. |
| `discoveryIntervalMS` | `number` | The interval in milliseconds at which the Main app will try to find a local [**Glue42 Enterprise**](https://glue42.com/enterprise/) instance. Default is `15000`. |

*Note that for a [**Glue42 Core**](https://glue42.com/core/) environment to be able to discover and connect to a [**Glue42 Enterprise**](https://glue42.com/enterprise/) instance, the [**Glue42 Enterprise**](https://glue42.com/enterprise/) Gateway must use a known port whose URL you must supply to the `url` property of the `preferred` object. Currently, a [**Glue42 Core**](https://glue42.com/core/) environment isn't able to discover a [**Glue42 Enterprise**](https://glue42.com/enterprise/) instance configured to use a [dynamic port for the Glue42 Gateway](https://docs.glue42.com/developers/configuration/system/index.html#dynamic_gateway_port).*
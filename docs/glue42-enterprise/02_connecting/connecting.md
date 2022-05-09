## Overview

The Main application can be configured so that it can constantly check for the presence of a locally installed Glue42 Enterprise. If such an instance is discovered, the Main application and all of it's Web Clients will attempt to switch their Glue connection and connect to Glue42 Enterprise. If this operation is successful, this Glue42 Core environment will be able to interop fully with all Enterprise clients.

This functionality enables Glue42 Core to seamlessly integrate with Glue42 Enterprise, without disrupting any of the running clients. 

## Behavior

As soon as the Main application discovers a running instance of Glue42 Enterprise and manages to connect to it, then all current Web Clients also follow suit. This connection switch happens without the applications reloading or flickering, it is completely invisible to the end user. However, the connection change of an already running Glue42 Core environment has numerous effects in all aspects of it's Glue42 functionality.

### Interop

Upon a connection change, the interop API will re-initiate and re-announce it's current state. This means that all Glue42 Core clients, including the Main application, will preserve their peerIds and instance ids. Furthermore, all registered interop methods, streams and subscriptions will be preserved and carried over to the new connection.

### Contexts

The transition back and forth between the Enterprise connection and the Glue42 Core connection is again seamless for the shared contexts. If the Main application is configured to look for a Glue42 Enterprise, then that application monitors all shared contexts and is aware of their latest state. Once a connection switch happens, the Main application is the last one to reconnect, which ensures that the latest state of the shared contexts is restored. All context subscriptions are preserved and all of this happens without any visual indication.

### Applications, Windows and Workspaces

The AppManager and Windows libraries do not change their functionality in any way when Glue42 Core is connected to a Glue42 Enterprise instance. This means that `glue.windows.list()` returns always the collection of currently opened Glue42 Core windows regardless of the state of the connection. What's more, `glue.windows.open` or `glue.appManager.application("sample").start` will always open a Glue42 Core window/application when called from a Glue42 Core application. 

The same is applicable to the Workspaces library. Calling any of the Workspaces API methods from a Glue42 Core application will always open, fetch data or manipulate a Glue42 Core workspace, regardless of whether or no the Glue42 Core environment is connected to Glue42 Enterprise or not.

### Notifications

The Notifications library sees no changes in it's operation when connected to a Glue42 Enterprise instance. All raised notifications will be Glue42 Core notifications, meaning they will be raised by the Browser. However, if a click interop is set and the user clicks on the notification toast. The method which will be invoked, could be registered by a Glue42 Enterprise application, so in a way acting on a Glue42 Core notification can have effects in Glue42 Enterprise.

### Channels

The Channels library is build and operates on top of Shared Contexts. Because of that there is full integration when connected to Glue42 Enterprise. A Glue42 Core application and a Glue42 Enterprise application, which both listens to changes to the red channel will be notified at the same time when new data becomes available to that channel. 

### Rejected Connections

There are a few cases when the connection attempts to Enterprise can fail or partially fail:

- When the Main application has started a Glue42 Core client with an old version of `@glue42/web`. In this situation the client will not be able to understand the connection switch instructions of the Main application. As a result the Main application will either ignore this client and proceed with the connection switch or will cancel the connection switch attempt. This is determined by the `forceIncompleteSwitch` setting.
- When the Main application is rejected from Glue42 Enterprise based on origin filtration or a custom authentication mechanism. In this situation, the Glue42 Core environment will not attempt to transfer the live clients and will cancel the reconnection attempt. However, the cycle for the Glue42 Enterprise instance will continue, meaning that periodically the Main application will attempt again.
- When the Maim application's connection request is accepted by Glue42 Enterprise, but the connection request of a Glue42 Core Client is rejected. This can happen due to origin filtration when the Main application and the Glue42 Core client have different origins or as result of some other custom Glue42 Enterprise authenticator. In this situation the Main application will either ignore this client and proceed with the connection switch or will cancel the connection switch attempt. This is determined by the `forceIncompleteSwitch` setting.

### Falling Back to Default

As soon as Glue42 Enterprise disappears, the Glue42 Core environment will resume it's default state and all of the clients will fall back to the default Glue42 Core connection of their respective Main application.

## Configuration

Enabling and configuring the discovery of Glue42 Enterprise is done entirely in the Main application during the initialization of the `@glue42/web-platform` package.

```javascript
import GlueWebPlatform from "@glue42/web-platform";

const config = {
    connection: {
        preferred: {
            url: "ws://localhost:8385", // required
            auth:{ // optional
                username: "some-user",
                password: "some-password"
            },
            forceIncompleteSwitch: true, // optional, by default is false
            discoveryIntervalMS: 60000 // optional, by default is 15000
        }
    }
};

const { glue } = await GlueWebPlatform(config);
```

The `preferred` property instructs the Main application that in addition to it's own default connection, there is an additional one, whose availability is unknown, but is preferred if available.
The `url` property is the only required one, when defining a preferred connection. This should be a valid URL string
The `auth` property is optional and defined the authentication data, which will be used when trying to connect to the Glue42 Enterprise instance. If this property is not provided, then Glue42 Core will attempt to connect to Enterprise with a dedicated Core authenticator.
The `forceIncompleteSwitch` property indicates whether or not the Main application should proceed and connect to Glue42 Enterprise even though some or all of it's clients cannot do it, due to having outdated `@glue42/web` package or rejected origins.
The `discoveryIntervalMS` property defines at what interval should the Main application try to find a local Glue42 Enterprise instance.
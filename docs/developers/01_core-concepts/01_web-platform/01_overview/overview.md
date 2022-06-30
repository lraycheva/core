## Overview

A Web Platform app (or "Main app") in the context of [**Glue42 Core**](https://glue42.com/core/) is a web app that uses the [`@glue42/web-platform`](https://www.npmjs.com/package/@glue42/web-platform) package. This app is responsible for configuring the entire Glue42 environment and acts as a central hub for all [Web Client](../../web-client/overview/index.html) apps in your [**Glue42 Core**](https://glue42.com/core/) project. All Glue42 operations are routed through this Main app, meaning that this is the place where you can get centralized logging, information about all operations and details about the general state of your project. The configuration for all Glue42 libraries (e.g., App Management, Layouts, Workspaces, Plugins, Notifications) is handled here.

The Main app also provides tracking and control over non-Glue42 apps opened through it. The level of control is limited, but all basic operations are available - open, close, receiving events, listing, adding and manipulating via [Workspaces](../../../../capabilities/windows/workspaces/overview/index.html).

## Characteristics and Limitations

Keep in mind the following important characteristics and limitations of the Main app:

- It is required for a [**Glue42 Core**](https://glue42.com/core/) project to have a Web Platform app (Main app), because it handles the entire Glue42 environment which connects all [Web Client](../../web-client/overview/index.html) apps. In order for a [Web Client](../../web-client/overview/index.html) app to be connected to the Glue42 environment, it must be opened by the Web Platform app or by another [Web Client](../../web-client/overview/index.html) already connected to the Glue42 environment.

- The Main app must be the only entry point of the project for the end users to ensure that the Web Platform app is running before any [Web Client](../../web-client/overview/index.html) app has been opened.

- If the Main app is closed, all [Web Client](../../web-client/overview/index.html) apps will lose their connection to Glue42 and therefore - all Glue42 capabilities. Opening the Main app again won't reestablish the connection, because this will effectively be an entirely new window with a new session and new context. However, if the Main app is refreshed, the existing [Web Client](../../web-client/overview/index.html) apps will detect that and will reconnect as soon as the Main app is back online.

- Due to browser limitations, the Web Platform app window can't be manipulated through the [Window Management](../../../../capabilities/windows/window-management/index.html) or [App Management](../../../../capabilities/application-management/index.html) APIs (closed, moved, etc.). The Main app is designed to be opened manually by the end users - if it hasn't been opened by a script, it can't be manipulated by a script.

- It is possible for the user to open more than one instance of the Main app. However, there will be *no connection* between the windows opened by the different Main app instances or between the Main app instances themselves, unless the subsequent Main apps are opened by another Main app. If a Main app is started by another Main app, then it falls back to being a regular [Web Client](../../web-client/overview/index.html) app and it will be connected to the Main app that has started it and to all other Web Client apps opened by the same Main app.
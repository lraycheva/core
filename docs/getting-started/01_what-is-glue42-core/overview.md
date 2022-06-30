## Overview

[**Glue42 Core**](https://glue42.com/core/) is a toolkit that enables integration of web apps. This means that multiple standalone web apps can share data between each other, expose functionality, open and manipulate windows. For example, combining Progressive Web Apps with [**Glue42 Core**](https://glue42.com/core/) not only leverages the advantages of PWAs (native-like feel, working offline, enhanced performance, etc.), but incorporates an interoperability layer in your web app ecosystem as well.

In industries and businesses depending on tens or hundreds of different apps for processing information (e.g., financial market data, client data) interoperability between apps has become an urgent necessity. Enabling apps to expose functionality, share data between each other and control other windows allows you to create meaningful window arrangements and define coherent workflows for the user. [**Glue42 Core**](https://glue42.com/core/) solves user-oriented problems, like errors from copy/pasting between apps, wasting time in finding and launching the right app, constant switching between many already running apps or making the best use of the precious screen real estate. This dramatically increases task completion times and user satisfaction. On a larger scale, enhancing employee productivity leads to reduced costs and higher customer satisfaction.

## High Level Structure

A [**Glue42 Core**](https://glue42.com/core/) project consists of a [Main app](../../developers/core-concepts/web-platform/overview/index.html) which uses the Glue42 [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library and multiple [Web Client](../../developers/core-concepts/web-client/overview/index.html) apps that use the [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library. The Main app acts as a hub through which the user can access all other apps part of the [**Glue42 Core**](https://glue42.com/core/) project while the [Web Platform](https://www.npmjs.com/package/@glue42/web-platform) library provides the communication connection between all client apps. The [Glue42 Web](../../reference/core/latest/glue42%20web/index.html) library provides Glue42 functionality to the client apps through sets of Glue42 APIs.

*For more details, see the [Capabilities](../../capabilities/application-management/index.html) section.*

## Requirements

The only requirement for users of your [**Glue42 Core**](https://glue42.com/core/) project is a modern browser. No additional software is required.

Developing a [**Glue42 Core**](https://glue42.com/core/) project requires:
- general JavaScript knowledge;
- general web development knowledge;

If all this intrigues you, visit the [Quick Start](../quick-start/index.html) and [Capabilities](../../capabilities/application-management/index.html) to start exploring [**Glue42 Core**](https://glue42.com/core/).

See also the [What is Glue42 Core+?](../what-is-glue42-core-plus/index.html) section to explore the rich list of features offered under license for [**Glue42 Core+**](https://glue42.com/core-plus/) projects.
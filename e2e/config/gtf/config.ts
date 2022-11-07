export const channelsConfig = {
    definitions: [
        {
            name: 'Red',
            meta: {
                color: 'red',
                fdc3: {
                    id: 'fdc3.channel.1',
                    displayMetadata: {
                        name: 'Channel 1',
                        glyph: '1',
                    },
                },
            },
            data: {}
        },
        {
            name: 'Green',
            meta: {
                color: 'green',
                fdc3: {
                    id: 'fdc3.channel.4',
                    displayMetadata: {
                        name: 'Channel 4',
                        glyph: '4',
                    },
                },
            },
            data: {}
        },
        {
            name: 'Blue',
            meta: {
                color: "blue",
                fdc3: {
                    id: 'fdc3.channel.6',
                    displayMetadata: {
                        name: 'Channel 6',
                        glyph: '4',
                    },
                },
            },
            data: {}
        },
        {
            name: 'Yellow',
            meta: {
                color: '#FFE733',
                fdc3: {
                    id: 'fdc3.channel.3',
                    displayMetadata: {
                        name: 'Channel 3',
                        glyph: '3',
                    },
                },
            },
            data: {}
        },
        {
            name: 'Orange',
            meta: {
                color: '#fa5a28',
                fdc3: {
                    id: 'fdc3.channel.2',
                    displayMetadata: {
                        name: 'Channel 2',
                        glyph: '2',
                    },
                },
            },
            data: {}
        },
        {
            name: 'Purple',
            meta: {
                color: '#c873ff',
                fdc3: {
                    id: 'fdc3.channel.8',
                    displayMetadata: {
                        name: 'Channel 8',
                        glyph: '8',
                    },
                },
            },
            data: {}
        },
        {
            name: 'Magenta',
            meta: {
                color: '#cc338b',
                fdc3: {
                    id: 'fdc3.channel.7',
                    displayMetadata: {
                        name: 'Channel 7',
                        glyph: '7',
                    },
                },
            },
            data: {}
        },
        {
            name: 'Cyan',
            meta: {
                color: '#80f3ff',
                fdc3: {
                    id: 'fdc3.channel.5',
                    displayMetadata: {
                        name: 'Channel 5',
                        glyph: '5',
                    },
                },
            },
            data: {}
        },
    ],
};

export const localApplicationsConfig = [
    {
        name: "noGlueApp",
        type: "window",
        details: {
            url: "http://localhost:4242/noGlueApp/index.html"
        }
    },
    {
        name: "dummyApp",
        type: "window",
        details: {
            url: "http://localhost:4242/dummyApp/index.html"
        }
    },
    {
        name: "coreSupport",
        type: "window",
        details: {
            url: "http://localhost:4242/coreSupport/index.html"
        },
        intents: [
            {
                name: "core-intent",
                displayName: "core-intent-displayName",
                contexts: [
                    "test-context"
                ],
                resultType: "test-result-type"
            }
        ]
    },
    {
        name: "Test",
        type: "window",
        details: {
            url: "https://glue42.com"
        }
    },
    {
        name: "AppWithDetails-local",
        type: "window",
        title: "AppWithDetails-title",
        version: "AppWithDetails-version",
        icon: "AppWithDetails-icon",
        caption: "AppWithDetails-caption",
        details: {
            url: "https://glue42.com/",
            context: {
                b: 98
            },
            width: 400,
            height: 400,
            top: 100,
            left: 100
        },
        customProperties: {
            a: 97
        },
        intents: [
            {
                name: "AppWithDetails-local-intent",
                displayName: "AppWithDetails-local-intent-displayName",
                contexts: [
                    "test-context"
                ],
                resultType: "test-result-type"
            }
        ]
    },
    {
        name: "FDC3App-top-level-url",
        appId: "FDC3App-top-level-url",
        manifestType: "Test-top-level-url",
        manifest: "{\"url\":\"https://glue42.com/\"}",
        intents: [
            {
                name: "FDC3App-top-level-url-intent",
                displayName: "FDC3App-top-level-url-intent-displayName",
                contexts: [
                    "test-context"
                ]
            }
        ]
    },
    {
        name: "FDC3App-url-inside-of-top-level-details",
        appId: "FDC3App-url-inside-of-top-level-details",
        manifestType: "Url-inside-of-top-level-details",
        manifest: "{\"details\":{\"url\":\"https://tick42.com/\"}}"
    }
];

// TODO: Test supplier and remote applications modes.
export const remoteStoreConfig = {
    url: "http://localhost:9998/v1/apps/search",
    pollingInterval: 3000
};

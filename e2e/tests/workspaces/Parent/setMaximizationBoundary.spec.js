describe("setMaximizationBoundary() Should ", () => {
    before(() => coreReady);

    afterEach(async () => {
        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });

    [true, false].forEach((v) => {
        it(`change the value of the property to ${v} when the targeted item is a row and the previous value was ${!v}`, async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        children: [{
                            type: "row",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ],
                            config: {
                                maximizationBoundary: !v
                            }
                        },
                        {
                            type: "row",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ],
                            config: {
                                maximizationBoundary: !v
                            }
                        }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);
            const rowUnderTest = workspace.getAllRows()[0];

            await rowUnderTest.setMaximizationBoundary({ enabled: v });

            expect(rowUnderTest.maximizationBoundary).to.eql(v);

        });

        it(`change the value of the property to ${v} when the targeted item is a column and the previous value was ${!v}`, async () => {
            const config = {
                children: [
                    {
                        type: "row",
                        children: [{
                            type: "column",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ],
                            config: {
                                maximizationBoundary: !v
                            }
                        },
                        {
                            type: "column",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ],
                            config: {
                                maximizationBoundary: !v
                            }
                        }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);
            const colUnderTest = workspace.getAllColumns()[0];

            await colUnderTest.setMaximizationBoundary({ enabled: v });

            expect(colUnderTest.maximizationBoundary).to.eql(v);
        });

        it(`do nothing when the value of the property is ${v}, the new value is the same and the targeted item is a column`, async () => {
            const config = {
                children: [
                    {
                        type: "row",
                        children: [{
                            type: "column",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ],
                            config: {
                                maximizationBoundary: v
                            }
                        },
                        {
                            type: "column",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ],
                            config: {
                                maximizationBoundary: v
                            }
                        }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);
            const colUnderTest = workspace.getAllColumns()[0];

            await colUnderTest.setMaximizationBoundary({ enabled: v });

            expect(colUnderTest.maximizationBoundary).to.eql(v);
        });

        it(`do nothing when the value of the property is ${v}, the new value is the same and the targeted item is a row`, async () => {
            const config = {
                children: [
                    {
                        type: "column",
                        children: [{
                            type: "row",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ],
                            config: {
                                maximizationBoundary: v
                            }
                        },
                        {
                            type: "row",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ],
                            config: {
                                maximizationBoundary: v
                            }
                        }
                        ]
                    }
                ]
            };

            const workspace = await glue.workspaces.createWorkspace(config);
            const rowUnderTest = workspace.getAllRows()[0];

            await rowUnderTest.setMaximizationBoundary({ enabled: v });

            expect(rowUnderTest.maximizationBoundary).to.eql(v);
        });
    });

    it(`restrict the size of the maximized group to the size of the row with set flag`, async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [{
                        type: "row",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ]
                    },
                    {
                        type: "row",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ]
                    }
                    ]
                }
            ]
        };

        const workspace = await glue.workspaces.createWorkspace(config);
        const rowUnderTest = workspace.getAllRows()[0];
        const rowHeight = rowUnderTest.height;
        const rowWidth = rowUnderTest.width;

        const groupUnderTest = rowUnderTest.children[0];

        await rowUnderTest.setMaximizationBoundary({ enabled: true });
        await groupUnderTest.maximize();

        expect(groupUnderTest.height).to.eql(rowHeight);
        expect(groupUnderTest.width).to.eql(rowWidth);
    });

    it(`restrict the size of the maximized group to the size of the column with set flag`, async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [{
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ]
                    }
                    ]
                }
            ]
        };

        const workspace = await glue.workspaces.createWorkspace(config);
        const columnUnderTest = workspace.getAllColumns()[0];
        const targetHeight = columnUnderTest.height;
        const targetWidth = columnUnderTest.width;
        const groupUnderTest = columnUnderTest.children[0];

        await columnUnderTest.setMaximizationBoundary({ enabled: true });
        await groupUnderTest.maximize();

        expect(groupUnderTest.height).to.eql(targetHeight);
        expect(groupUnderTest.width).to.eql(targetWidth);
    });

    it(`be able to successfully maximize the child group when set to true and the target container is a row`, async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [{
                        type: "row",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ]
                    },
                    {
                        type: "row",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ]
                    }
                    ]
                }
            ]
        };

        const workspace = await glue.workspaces.createWorkspace(config);
        const rowUnderTest = workspace.getAllRows()[0];

        const groupUnderTest = rowUnderTest.children[0];

        await rowUnderTest.setMaximizationBoundary({ enabled: true });
        await groupUnderTest.maximize();

        expect(groupUnderTest.isMaximized).to.eql(true);
    });

    it(`be able to successfully maximize the child group when set to true  and the target container is a column`, async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [{
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ]
                    }
                    ]
                }
            ]
        };

        const workspace = await glue.workspaces.createWorkspace(config);
        const columnUnderTest = workspace.getAllColumns()[0];
        const groupUnderTest = columnUnderTest.children[0];

        await columnUnderTest.setMaximizationBoundary({ enabled: true });
        await groupUnderTest.maximize();

        expect(groupUnderTest.isMaximized).to.eql(true);
    });

    it(`maximize the child group to the size of the workspace when invoked with false and the target container is a row`, async () => {
        const config = {
            children: [
                {
                    type: "column",
                    children: [{
                        type: "row",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ],
                        config: {
                            maximizationBoundary: true
                        }
                    },
                    {
                        type: "row",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ],
                        config: {
                            maximizationBoundary: true
                        }
                    }
                    ]
                }
            ]
        };

        const workspace = await glue.workspaces.createWorkspace(config);
        const rowUnderTest = workspace.getAllRows()[0];
        const targetHeight = workspace.getAllColumns()[0].height;
        const targetWidth = workspace.getAllColumns()[0].width;

        const groupUnderTest = rowUnderTest.children[0];

        await rowUnderTest.setMaximizationBoundary({ enabled: false });
        await groupUnderTest.maximize();

        expect(groupUnderTest.height).to.eql(targetHeight);
        expect(groupUnderTest.width).to.eql(targetWidth);
    });

    it(`restrict the size of the maximized group to the size of the column with set flag and the target container is a column`, async () => {
        const config = {
            children: [
                {
                    type: "row",
                    children: [{
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ],
                        config: {
                            maximizationBoundary: true
                        }
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [{
                                    type: "window",
                                    appName: "noGlueApp"
                                }]
                            }
                        ],
                        config: {
                            maximizationBoundary: true
                        }
                    }
                    ]
                }
            ]
        };

        const workspace = await glue.workspaces.createWorkspace(config);
        const columnUnderTest = workspace.getAllColumns()[0];
        const targetHeight = workspace.getAllRows()[0].height;
        const targetWidth = workspace.getAllRows()[0].width;
        const groupUnderTest = columnUnderTest.children[0];

        await columnUnderTest.setMaximizationBoundary({ enabled: false });
        await groupUnderTest.maximize();

        expect(groupUnderTest.height).to.eql(targetHeight);
        expect(groupUnderTest.width).to.eql(targetWidth);
    });

    [42, "42", {}, [], null, undefined].forEach((invalidInput) => {
        it(`throw an error when the input is ${typeof invalidInput} and the target container is a row`, (done) => {
            const config = {
                children: [
                    {
                        type: "column",
                        children: [{
                            type: "row",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ]
                        },
                        {
                            type: "row",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ]
                        }
                        ]
                    }
                ]
            };

            glue.workspaces.createWorkspace(config).then((workspace) => {
                const rowUnderTest = workspace.getAllRows()[0];

                return rowUnderTest.setMaximizationBoundary({ enabled: value });
            }).then(() => {
                done("Should not resolve")
            }).catch(() => {
                done();
            });

        });

        it(`throw an error when the input is ${typeof invalidInput} and the target container is a column`, (done) => {
            const config = {
                children: [
                    {
                        type: "row",
                        children: [{
                            type: "column",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ]
                        },
                        {
                            type: "column",
                            children: [
                                {
                                    type: "group",
                                    children: [{
                                        type: "window",
                                        appName: "noGlueApp"
                                    }]
                                }
                            ]
                        }
                        ]
                    }
                ]
            };

            glue.workspaces.createWorkspace(config).then((workspace) => {
                const columnUnderTest = workspace.getAllColumns()[0];

                return columnUnderTest.setMaximizationBoundary({ enabled: value });
            }).then(() => {
                done("Should not resolve");
            }).catch(() => {
                done();
            });
        });
    });
});
const fetchWorkspaceLayoutDefinitions = async (url) => {
    const layoutDefinitionsResponse = await fetch(url);
    const layoutDefinitions = await layoutDefinitionsResponse.json();

    return layoutDefinitions;
};

const setupLayouts = async (glue, { url }) => {
    try {
        const layoutDefinitions = await fetchWorkspaceLayoutDefinitions(url);

        await glue.layouts.import(layoutDefinitions);
    } catch (error) {
        console.error(error.message);
    };
};
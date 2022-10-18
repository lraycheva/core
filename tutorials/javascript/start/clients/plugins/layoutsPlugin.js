const fetchWorkspaceLayoutDefinitions = async (url) => {
    const layoutDefinitionsResponse = await fetch(url);
    const layoutDefinitions = await layoutDefinitionsResponse.json();

    return layoutDefinitions;
};

const setupLayouts = async (glue, { url }) => {
    // TODO Chapter 9.2
};
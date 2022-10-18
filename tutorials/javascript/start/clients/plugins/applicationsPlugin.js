const fetchAppDefinitions = async (url) => {
    const appDefinitionsResponse = await fetch(url);
    const appDefinitions = await appDefinitionsResponse.json();

    return appDefinitions;
};

const setupApplications = async (glue, { url }) => {
    // TODO Chapter 8.2
};
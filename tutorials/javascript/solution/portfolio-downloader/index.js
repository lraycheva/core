const intentHandler = (context) => {
    if (!context) {
        return;
    };

    setupTitle(context.data.clientName);

    const dataToWrite = JSON.stringify({
        date: new Date(Date.now()).toLocaleString("en-US"),
        portfolio: context.data.portfolio
    }, null, 4);
    const blob = new Blob([dataToWrite], { type: "application/json" });
    const download = document.getElementById("download");
    const href = URL.createObjectURL(blob);

    download.href = href;
    download.click();
    URL.revokeObjectURL(href);
};

const setupTitle = (clientName) => {
    const title = document.getElementById("portfolioName");
    title.innerText = `Downloading the portfolio of ${clientName}...`;
};

const toggleGlueAvailable = () => {
    const span = document.getElementById("glueSpan");

    span.classList.remove("label-warning");
    span.classList.add("label-success");
    span.textContent = "Glue42 is available";
};

async function start() {
    const glue = await GlueWeb();
    window.glue = glue;

    toggleGlueAvailable();

    glue.intents.addIntentListener("ExportPortfolio", intentHandler);
};

start().catch(console.error);
export const defaultTestGatewayUserName = "CoreE2E";

export const defaultTestGatewayPassword = "coree2e";

export const puppetHttpBridgeUrl = "http://localhost:9997/command";

export const puppetAppIndexHtml = "http://localhost:4242/puppet/index.html";

export const defaultGatewayPort = 4224;

export const defaultCoreConfig = {
    gateway: {
        protocolVersion: 3,
        ws: `ws://localhost:${defaultGatewayPort}/gw`
    },
    auth: {
        username: defaultTestGatewayUserName,
        password: defaultTestGatewayPassword
    }
};

export const defaultWebConfig = {};
const fdc3ChannelProps = ["id", "type", "broadcast", "addContextListener", "getCurrentContext"];

export const isChannel = (data) => {
    return fdc3ChannelProps.every(prop => Object.keys(data).includes(prop));
}

export const extractChannelMetadata = (channel) => {
    return {
        isChannel: true,
        id: channel.id,
        type: channel.type,
    }
}
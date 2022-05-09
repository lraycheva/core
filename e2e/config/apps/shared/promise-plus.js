export var PromisePlus = function (executor, timeoutMilliseconds, timeoutMessage) {
    return new Promise(function (resolve, reject) {
        var timeout = setTimeout(function () {
            var message = timeoutMessage || "Promise timeout hit: " + timeoutMilliseconds;
            reject(message);
        }, timeoutMilliseconds);
        var providedPromise = new Promise(executor);
        providedPromise
            .then(function (result) {
            clearTimeout(timeout);
            resolve(result);
        })
            .catch(function (error) {
            clearTimeout(timeout);
            reject(error);
        });
    });
};
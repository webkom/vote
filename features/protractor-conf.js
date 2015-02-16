exports.config = {
    capabilities: {
        browserName: process.env.BROWSER || 'chrome'
    },
    baseUrl: 'http://localhost:3000',
    specs: ['*.feature'],
    framework: 'cucumber'
};

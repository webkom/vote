chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {
        bounds: {
            width: window.screen.availWidth,
            height: window.screen.availHeight
        }
    });
});

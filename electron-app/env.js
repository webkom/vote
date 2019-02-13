const wv = document.querySelector('webview');
const { WEBVIEW_URL } = process.env;
if (WEBVIEW_URL) {
  wv.setAttribute('src', WEBVIEW_URL);
}

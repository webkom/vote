const wv = document.querySelector('webview');
const { URL } = process.env;
if (URL) {
  wv.setAttribute('src', URL);
}

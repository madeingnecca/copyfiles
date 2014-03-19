(function() {
  var selection = window.getSelection();
  var range;
  var selectedFragment;
  var container;

  // Non-empty selection.
  if (!selection.isCollapsed && selection.rangeCount > 0) {
    range = selection.getRangeAt(0);
    selectedFragment = range.cloneContents();
    container = document.createElement('div');
    container.appendChild(selectedFragment);
  }
  else {
    // No selection, get all page.
    container = document.documentElement;
  }

  var els = container.getElementsByTagName('img');
  var i, url;
  var assets = [];
  var urlRoot = document.location.protocol + '//' + document.location.hostname;
  var pathComponents = document.location.pathname.split('/');
  pathComponents.shift();
  pathComponents.pop();
  var baseUrl = urlRoot + '/' + pathComponents.join('/');
  var hasProtocol;

  for (i = 0; i < els.length; i++) {
    url = els[i].getAttribute('src');
    // Filter out not interesting srcs.
    if (url && url !== '#') {
      // Prepend baseUrl to urls without protocol.
      hasProtocol = /^[^:]+:/.test(url);
      if (!hasProtocol) {
        if (url.charAt(0) == '/') {
          url = urlRoot + url;
        }
        else {
          url = baseUrl + '/' + url;
        }
      }

      assets.push(url);
    }
  }

  var dummyLink;
  for (i = 0; i < assets.length; i++) {
    dummyLink = document.createElement('a');
    dummyLink.setAttribute('download', '');
    dummyLink.setAttribute('href', assets[i]);
    dummyLink.click();
  }
}());

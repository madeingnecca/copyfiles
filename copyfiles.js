(function() {
  function objectKeys(obj) {
    var keys = [], k;
    for (k in obj) {
      if (obj.hasOwnProperty(k)) {
        keys.push(k);
      }
    }

    return keys;
  }

  function collectNodes(nodeList) {
    var nodes = [], i;
    for (i = 0; i < nodeList.length; i++) {
      nodes.push(nodeList[i]);
    }

    return nodes;
  }

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

  var isDownloadable = function(url) {
    if (!url || url.charAt(0) == '#') {
      return false;
    }

    var filename = url.split('/').pop();
    var HAS_EXTENSION = /\.(.*?)$/i;
    var NOT_A_FILE = /\.(htm|html)$/i;
    return HAS_EXTENSION.test(filename) && !NOT_A_FILE.test(filename);
  };

  // List of downloadable resources.
  var tags = {
    a: ['href'],
    img: ['src'],
    video: ['src'],
    audio: ['src'],
    source: ['src'],
    object: ['src']
  };

  var selector = objectKeys(tags).join(',');

  var els = container.querySelectorAll(selector);
  els = collectNodes(els);

  var assets = {};
  var urlRoot = document.location.protocol + '//' + document.location.hostname;
  var pathComponents = document.location.pathname.split('/');
  pathComponents.shift();
  pathComponents.pop();
  var baseUrl = urlRoot + '/' + pathComponents.join('/');

  els.forEach(function(el) {
    var tagName = el.tagName.toLowerCase();
    if (tagName in tags) {
      var attrs = tags[tagName];
      attrs.forEach(function(attr) {
        var url = el.getAttribute(attr);
        var hasProtocol;
        if (isDownloadable(url)) {
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

          // Avoid duplicates.
          assets[url] = url;
        }
      });
    }
  });

  objectKeys(assets).forEach(function(url) {
    var dummyLink = document.createElement('a');
    dummyLink.setAttribute('download', '');
    dummyLink.setAttribute('href', url);
    dummyLink.click();
  });
}());

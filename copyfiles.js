(function() {
  // Utility function to collect keys of an object.
  function objectKeys(obj) {
    var keys = [], k;
    for (k in obj) {
      if (obj.hasOwnProperty(k)) {
        keys.push(k);
      }
    }

    return keys;
  }

  // Utility function to create a list of dom nodes
  // in a DOMNodeList object.
  function collectNodes(nodeList) {
    var nodes = [], i;
    for (i = 0; i < nodeList.length; i++) {
      nodes.push(nodeList[i]);
    }

    return nodes;
  }

  // Create a DOMNode with the entire page or with the selected fragment.
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

  // Collection of files found in page/selection.
  var files = {};

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
  // This list can be changed to suit custom needs.
  var tags = {
    a: ['href'],
    img: ['src'],
    video: ['src'],
    audio: ['src'],
    source: ['src'],
    object: ['src']
  };

  // List of css properties containing files.
  var css = {
    'background-image': {
      extract: /^url\((.*?)\)$/i
    }
  };

  // Find elements with "downloadable attributes" inside the container.
  var selector = objectKeys(tags).join(',');

  var els = container.querySelectorAll(selector);
  els = collectNodes(els);

  var urlRoot = document.location.protocol + '//' + document.location.hostname;
  var pathComponents = document.location.pathname.split('/');
  pathComponents.shift();
  pathComponents.pop();
  var baseUrl = urlRoot + '/' + pathComponents.join('/');

  els.forEach(function(el) {
    var tagName = el.tagName.toLowerCase();
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

        files[url] = url;
      }
    });
  });

  // Second step. Find files inside css in every single node inside the container.
  var allNodes = container.querySelectorAll('*');
  allNodes = collectNodes(allNodes);

  allNodes.forEach(function(el) {
    var computedStyle = window.getComputedStyle(el);
    objectKeys(css).forEach(function(property) {
      var value = computedStyle.getPropertyValue(property);
      var extract, extracted, url;
      if (value && value != 'none') {
        extract = css[property].extract;
        extracted = value.match(extract);
        if (extracted && extracted.length) {
          url = extracted[1];
          files[url] = url;
        }
      }
    });
  });

  // To force download of a file, create a dummy link with "download" attribute.
  // Chrome should ask for multi-download permission, but it's ok.
  objectKeys(files).forEach(function(url) {
    var dummyLink = document.createElement('a');
    dummyLink.setAttribute('download', '');
    dummyLink.setAttribute('href', url);
    dummyLink.click();
  });
}());

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

    // Configuration.
    //
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

    // Checks if the url points to an interesting file.
    // This function can be changed to suit custom needs.
    var isDownloadable = function(url) {
      if (!url || url.charAt(0) == '#') {
        return false;
      }

      var filename = url.split('/').pop();
      var HAS_EXTENSION = /\.(.*?)$/i;
      var NOT_A_FILE = /\.(htm|html)$/i;
      return HAS_EXTENSION.test(filename) && !NOT_A_FILE.test(filename);
    };

    // All DOM Nodes found in the page/selection.
    var nodes;

    // Collection of files to download.
    var files = {};

    var selection = window.getSelection();
    var range;
    var selectedFragment;
    var container;
    var tempNodes;

    // In case of selection fetch only DOM Nodes inside the Range.
    if (!selection.isCollapsed && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      container = range.commonAncestorContainer;
      tempNodes = container.querySelectorAll('*');
      tempNodes = collectNodes(tempNodes);

      nodes = [];
      tempNodes.forEach(function(node) {
        if (range.intersectsNode(node)) {
          nodes.push(node);
        }
      });
    }
    else {
      // Otherwise get all DOM Nodes of the page.
      // This is required to read css data.
      container = document.documentElement;
      nodes = container.querySelectorAll('*');
      nodes = collectNodes(nodes);
    }

    var urlRoot = document.location.protocol + '//' + document.location.hostname;
    var pathComponents = document.location.pathname.split('/');
    pathComponents.shift();
    pathComponents.pop();
    var baseUrl = urlRoot + '/' + pathComponents.join('/');

    nodes.forEach(function(node) {
      var tagName = node.tagName.toLowerCase();
      var attrs = tags[tagName] || [];

      attrs.forEach(function(attr) {
        var url = node.getAttribute(attr);
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

      var computedStyle = window.getComputedStyle(node);
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

(function() {
  "use strict";

  // init highlight CSS
  var ruleExistenceDict = {};
  var sheet = (function() {
    var style = document.createElement("style");
    style.appendChild(document.createTextNode("")); // WebKit hack @@
    document.head.appendChild(style);
    return style.sheet;
  })();

  // highlight word in DOM (textnode only)
  var highlightWordInTextNodeOnly = function(word, bgColorCode) {
    // skip empty word
    if (word == null || word.length === 0) return;

    // DOM tree walker
    var wordRegex = new RegExp(word, "gi");
    var treeWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          var result = NodeFilter.FILTER_SKIP;
          if (wordRegex.test(node.nodeValue)) result = NodeFilter.FILTER_ACCEPT;
          return result;
        }
      },
      false
    );

    // get textnode
    var skipTagName = {
      NOSCRIPT: true,
      SCRIPT: true,
      STYLE: true
    };
    var nodeList = [];
    while (treeWalker.nextNode()) {
      if (!skipTagName[treeWalker.currentNode.parentNode.tagName]) {
        nodeList.push(treeWalker.currentNode);
      }
    }

    // highlight all filtered textnode
    nodeList.forEach(function(n) {
      var rangeList = [];

      // find sub-string ranges
      var startingIndex = 0;
      do {
        // console.log(word, startingIndex, n.parentNode, n.textContent);
        startingIndex = n.textContent.indexOf(word, startingIndex + 1);
        if (startingIndex !== -1) {
          var wordRange = document.createRange();
          wordRange.setStart(n, startingIndex);
          wordRange.setEnd(n, startingIndex + word.length);
          rangeList.push(wordRange);
        }
      } while (startingIndex !== -1);

      // highlight all ranges
      rangeList.forEach(function(r) {
        highlightRange(r, bgColorCode);
      });
    });
  };
  // highlight word in DOM (keyword can be across multi tag)
  var highlightWordAcrossNode = function(word, bgColorCode) {
    // reset cursor
    window.getSelection().removeAllRanges();

    // find keyword ranges
    var rangeList = [];
    if (window.find(word, false, false, false, false, false, false)) {
      do {
        rangeList.push(window.getSelection().getRangeAt(0));
        // don't modify the range here, cursor in find() will be corrupted
      } while (window.find(word, false, false, false, false, false, false));
      // reset scroll position, window.find() will select the last word...
      window.scrollTo(0, 0);
    } else {
    }

    // highlight all ranges
    rangeList.forEach(function(r) {
      highlightRange(r, bgColorCode);
    });
  };
  // highlight the keyword by surround it by `i`
  var highlightRange = function(range, bgColorCode) {
    // create wrapping i
    var iNode = document.createElement("i");
    var selectorName = (iNode.className = "chrome-extension-highlight-".concat(
      bgColorCode
    ));
    iNode.classList.add("chrome-extension-highlight");

    // add highlight class style in CSS
    if (!ruleExistenceDict[bgColorCode]) {
      sheet.insertRule(
        [
          ".",
          selectorName,
          " { background: #",
          bgColorCode,
          " !important; }"
        ].join(""),
        0
      );
      ruleExistenceDict[bgColorCode] = true;
    }

    // range.surroundContents(iNode) will throw exception if word across multi tag
    iNode.appendChild(range.extractContents());
    range.insertNode(iNode);
  };
  // highlight all keywords by its colour
  var highlightAllWords = function(wordGroupsDict) {
    var highlightWordFunction;
    if (window.find) {
      highlightWordFunction = highlightWordAcrossNode;
    } else {
      highlightWordFunction = highlightWordInTextNodeOnly;
    }
    // for each group, highlight all its words
    Object.keys(wordGroupsDict).forEach(function(groupName) {
      if (wordGroupsDict[groupName].isOn) {
        wordGroupsDict[groupName].words.forEach(function(word) {
          highlightWordFunction(word, groupName);
        });
      }
    });
  };

  // on word list change
  chrome.runtime.onMessage.addListener(function(
    messageBody,
    sender,
    sendResponse
  ) {
    // remove all highlight first
    [].slice
      .call(document.getElementsByClassName("chrome-extension-highlight"))
      .forEach(function(e) {
        var parentNode = e.parentNode;
        while (e.firstChild) parentNode.insertBefore(e.firstChild, e);
        parentNode.removeChild(e);
      });

    highlightAllWords(messageBody);
    if (sendResponse) sendResponse({ content: "highlight done!" });
  });
})();

import './css/content.css';

import WordStock from './helper/WordStock';

(function() {
  console.log('content.js: happened??   ');
  console.log(WordStock.getDescription('가감'));

  console.log('chrome.runtime');
  console.log(chrome.runtime);
  const stringDocument = new XMLSerializer().serializeToString(document);
  console.log('stringDocument');
  console.log(stringDocument);
})();
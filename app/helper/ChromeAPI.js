class ChromeAPI {
  static addLifecycle(event, callback) {
    chrome.runtime[event].addListener(callback);
  }


}

export default ChromeAPI;
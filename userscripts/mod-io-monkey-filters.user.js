// ==UserScript==
// @name        Test monkeypatch
// @namespace   Violentmonkey Scripts
// @grant       none
// @version     1.0
// @author      -
// @match       https://mod.io/g/*
// @inject-into content
// @run-at      document-start
// @description 8/22/2024, 7:55:11 PM
// ==/UserScript==

(function () {
  console.log("executing monkeypatch");

  console.log("unsafeWindow", unsafeWindow);
  console.log(JSON.stringify(unsafeWindow));

  // These 4 are all the same, at least with '@grant none' and '@inject-into content'
  // console.log('unsafeWindow.window', unsafeWindow.window);
  // console.log('window', window);
  // console.log('window.wrappedJSObject', window.wrappedJSObject);
  // console.log('unsafeWindow.wrappedJSObject', unsafeWindow.wrappedJSObject);

  // unsafeWindow.eval(`console.log('eval: unsafeWindow')`);
  // window.eval(`console.log('eval: window')`);
  // window.wrappedJSObject.eval(`console.log('eval: window.wrappedJSObject')`);
  // unsafeWindow.wrappedJSObject.eval(`console.log('eval: unsafeWindow.wrappedJSObject')`);

  window.monkeypatch = 1;

  const functionToEval = /*js*/ `
    //console.log('window', window);
    //window['__VUE__'] = false;

    const origOpen = window.XMLHttpRequest.prototype.open;
    const origSend = window.XMLHttpRequest.prototype.send;
    //const origOnloadend = window.XMLHttpRequest.prototype.onloadend;

    //window.monkeypatch = 2;
    //console.log('inEval', window.monkeypatch);

    window.XMLHttpRequest.prototype.open = ${function monkeyOpen() {
      try {
        console.log("monkeyOpen", arguments);

        const [method, url, async] = arguments;

        console.log(this);

        // Here it's undefined
        //console.log('onloadend', this.onloadend);

        origOpen.apply(this, [method, url, async]);
        //originOpen(arguments);
      } catch (e) {
        console.error(e);
      }
    }};

    window.XMLHttpRequest.prototype.send = ${function monkeySend() {
      try {
        console.log("monkeySend", arguments);

        const [body] = arguments;

        console.log(this);
        console.log("onloadend", this.onloadend);

        const origOnloadend = this.onloadend;

        this.onloadend = function monkeyOnloadend(e) {
          console.log("monkeyOnloadend", e);
          origOnloadend.apply(this, e);
        };

        origSend.apply(this, [body]);
      } catch (e) {
        console.error(e);
      }
    }};
  `;
  console.log("functionToEval", functionToEval);

  window.wrappedJSObject.eval(functionToEval);

  //console.log('outEval', window.monkeypatch);

  // unsafeWindow.XMLHttpRequest = function(...args) {
  //   console.log('intercepted xml http req');

  //   let response = originalXmlHttpReq(args);

  //   console.log(response);

  //   return response;
  // }
})();

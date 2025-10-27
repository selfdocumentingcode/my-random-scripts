// ==UserScript==
// @name         Less annoying Discord
// @namespace    selfdocumentingcode
// @version      0.2
// @description  Turns off reply ping by default, adds reply ping toggle hotkey, hides gift nitro button.
// @author       selfdocumentingcode@github
// @match        https://discord.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/selfdocumentingcode/my-random-scripts/refs/heads/main/userscripts/discord-less-annoying.user.js
// @supportURL   https://github.com/selfdocumentingcode/my-random-scripts
// @homepageURL  https://github.com/selfdocumentingcode/my-random-scripts
// ==/UserScript==

(function () {
  "use strict";

  /** Turn off reply ping */
  let channelTextAreaEl;
  let pingToggleEl;

  const pingToggleHotkeyListener = (e) => {
    if (e.ctrlKey && e.key === "r") {
      e.preventDefault();
      pingToggleEl && pingToggleEl.click();
    }
  };

  const pingReplyObserver = new MutationObserver(() => {
    pingToggleEl = channelTextAreaEl.querySelector("div[role=switch]");

    if (pingToggleEl) {
      if (pingToggleEl.getAttribute("aria-checked") === "true") {
        pingToggleEl.click();
      }

      channelTextAreaEl.addEventListener("keydown", pingToggleHotkeyListener);
    } else {
      channelTextAreaEl.removeEventListener("keydown", pingToggleHotkeyListener);
    }
  });

  setInterval(() => {
    const channelTextAreaElLocal = document.querySelector("div[class^=channelTextArea]");
    if (channelTextAreaElLocal && channelTextAreaElLocal !== channelTextAreaEl) {
      channelTextAreaEl = channelTextAreaElLocal;

      pingReplyObserver.disconnect();
      pingReplyObserver.observe(channelTextAreaEl, {
        childList: true,
        subtree: true,
      });
    }
  }, 1000);

  /** Hide gift button */
  const styleElement = document.createElement("style");
  styleElement.textContent = 'button[aria-label="Send a gift"] { display: none }';

  document.head.appendChild(styleElement);
})();

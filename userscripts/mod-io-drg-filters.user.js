// ==UserScript==
// @name        mod.io drg filters
// @namespace   selfdocumentingcode
// @description Adds more filters to mod.io/g/drg
// @version     0.1
// @match       https://mod.io/g/drg*
// @author      selfdocumentingcode
// @icon        https://www.google.com/s2/favicons?sz=64&domain=mod.io
// @license     MIT
// @noframes
// @grant       none
// ==/UserScript==
("use strict");

console.log("executing mod.io drg filters");

const titleFilters = ["blue archive"];

async function main() {
  var anyModItem = await waitForElement("a[href*='/g/drg/m/'");

  if (!anyModItem) {
    console.error("no mod.io item found");
    return;
  }

  var modListEl = anyModItem.parentElement.parentElement;

  // console.log(modListEl);

  onElementChange(modListEl, filterElements);

  // filterElements(modListEl);

  console.log(anyModItem);
}

try {
  main();
} catch (error) {
  window.alert("mod.io drg filters script error: " + error.message);
}

function onElementChange(element, callback) {
  callback(element);

  const observer = new MutationObserver((mutations) => {
    console.log("element changed");
    callback(element);
  });
  observer.observe(element, { childList: true, subtree: true });

  return observer;
}

function filterElements(modListEl) {
  console.log("filtering elements");

  var modElements = Array.from(modListEl.children).filter((modItem) => modItem.className.includes("tw-group"));

  // console.log(modElements);

  for (var i = 0; i < modElements.length; i++) {
    var modItem = modElements[i];

    // console.log(modItem);

    var title = modItem.querySelector("a > div:nth-child(2) > span").textContent;

    if (titleFilters.some((filter) => title.toLowerCase().includes(filter))) {
      modItem.style.display = "none";
    }
  }
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}

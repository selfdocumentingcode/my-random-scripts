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

console.log("executing mod.io drg filters 2");

const titleFilters = ["blue archive"];

// UI
const filterMenuSelector = "div.filter-menu";

const elementPrefix = "mfi";
const extraFiltersBtnId = `${elementPrefix}-open-dialog-btn`;
const extraFiltersDialogId = `${elementPrefix}-dialog`;
const filterTextId = `${elementPrefix}-filter-text`;

const extraFiltersBtnHtml = `
<div class="tw-flex tw-justify-start tw-px-5 tw-pt-4">
  <button
    id="${extraFiltersBtnId}"
    type="button"
    class="tw-grow tw-bg-primary tw-border-primary tw-border-2 tw-p-2 tw-global--border-radius tw-text-primary-text tw-text-md tw-font-bold"
  >
    Extra filters
  </button>
</div>
`;

// Note: Structure and tw styles are copied from the Report dialog
function dialogTemplate(string, titleExp, bodyExp) {
  return `
<dialog id="${extraFiltersDialogId}">
  <div class="tw-fixed tw-z-40 tw-inset-0 tw-overflow-y-auto tw-dark">
    <div class="tw-flex tw-h-full tw-justify-center tw-min-screenheight tw-text-center tw-text-theme tw-items-center">
      <!-- backdrop -->
      <div class="tw-fixed tw-inset-0 tw-transition-opacity">
        <div class="tw-absolute tw-inset-0 tw-opacity-70 tw-bg-black"></div>
      </div>
      <!-- dialog content -->
      <div class="tw-w-full tw-align-bottom tw-text-left tw-shadow-xl tw-transform tw-transition-all sm:tw-align-middle tw-outline-none tw-border-primary tw-bg-theme tw-inline-block tw-max-w-3xl tw-border-2 tw-flex tw-flex-col tw-mx-4 sm:tw-mx-0 sm:tw-my-12 tw-global--border-radius tw-max-h-80vh">
        <!-- dialog header -->
        <div class="tw-w-full tw-shadow-inner tw-z-3 tw-px-8 sm:tw-px-10 tw-py-6 tw-pl-8 tw-pr-12 tw-bg-theme-3 tw-global--border-radius-t tw-flex tw-items-center">
          <div class="tw-w-full">
            <div class="tw-flex tw-flex-row tw-justify-between lg:tw-space-x-4 tw-space-y-4 lg:tw-space-y-0">
              <div class="tw-w-full tw-flex tw-flex-col tw-justify-center">
                <h2 class="tw-flex tw-leading-tight tw-justify-start tw-text-left tw-font-normal tw-text-h4">${titleExp}</h2>
              </div>
            </div>
        </div>
        <!-- close button -->
        <button class="tw-absolute tw--top-9 tw-right-0 tw-flex tw-items-center tw-justify-center tw-overflow-hidden tw-button-transition tw-outline-none tw-shrink-0 tw-space-x-2 tw-font-bold hover:tw-text-primary focus:tw-text-primary tw-text-sm tw-cursor-pointer tw-input--height-small tw-input--width-small tw-absolute tw--top-9 tw-right-0" tabindex="0"><svg class="svg-inline--fa fa-times fa-fw fa-xl tw-fill-current" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path class="" fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg><span class="sr-only">Close modal</span></button></div>
        <!-- dialog body -->
        ${bodyExp}
      </div>
    </div>
  </div>
  </dialog>
`;
}

const extraFiltersDialogTitle = "Extra filters";
const extraFiltersDialogBodyHtml = `
<form method="dialog">
  <label for="${filterTextId}">Text filters</label>
  <textarea id="${filterTextId}" class="tw-w-full tw-h-32"></textarea>
</form>
`;

const extraFiltersDialogHtml = dialogTemplate`
${extraFiltersDialogTitle}
${extraFiltersDialogBodyHtml}
`;

async function initUI() {
  // Insert dialog html in body
  document.body.insertAdjacentHTML("beforeend", extraFiltersDialogHtml);

  const filterMenuEl = await waitForElement(filterMenuSelector);
  console.log(filterMenuEl);

  const filterMenuInnerEl = filterMenuEl.children[0];
  console.log(filterMenuInnerEl);

  filterMenuInnerEl.insertAdjacentHTML("afterbegin", extraFiltersBtnHtml);

  const extraFiltersBtn = document.getElementById(extraFiltersBtnId);
  console.log(extraFiltersBtn);

  // Debug dialog
  setTimeout(() => {
    document.getElementById(extraFiltersDialogId).showModal();
  }, 100);

  extraFiltersBtn.addEventListener("click", () => {
    document.getElementById(extraFiltersDialogId).showModal();
  });
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

async function main() {
  await initUI();

  return;
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

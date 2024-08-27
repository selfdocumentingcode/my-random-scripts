// ==UserScript==
// @name        mod.io extra filters
// @namespace   selfdocumentingcode
// @description Adds more filters to mod.io mod list pages
// @version     0.1
// @match       https://mod.io/g/*
// @author      selfdocumentingcode
// @icon        https://www.google.com/s2/favicons?sz=64&domain=mod.io
// @license     MIT
// @noframes
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==
("use strict");

console.log("Executing mod.io extra filters");

// UI
const filterMenuSelector = "div.filter-menu";

const elementIdPrefix = "mief";
const openDialogBtnId = `${elementIdPrefix}-open-dialog-btn`;
const dialogId = `${elementIdPrefix}-dialog`;
const closeDialogBtnId = `${elementIdPrefix}-close-dialog-btn`;
const saveFiltersBtnId = `${elementIdPrefix}-save-filters-btn`;
const cancelDialogBtnId = `${elementIdPrefix}-cancel-dialog-btn`;
const filterByNameId = `${elementIdPrefix}-filter-by-name`;
const filterByTextId = `${elementIdPrefix}-filter-by-text`;
const ignoreModBtnClassName = `${elementIdPrefix}-ignore-mod-btn`;

const openDialogBtnHtml = /*html*/ `
  <div class="tw-flex tw-justify-start tw-px-5 tw-pt-4">
    <button
      id="${openDialogBtnId}"
      type="button"
      class="tw-grow tw-bg-primary tw-border-primary tw-border-2 tw-p-2 tw-global--border-radius tw-text-primary-text tw-text-md tw-font-bold"
    >
      Extra filters
    </button>
  </div>
`;

const dialogTitleTxt = "Extra filters";
const dialogBodyHtml = /*html*/ `
  <form method="dialog">
    <div class="tw-flex tw-flex-col tw-space-y-4">
      ${textareaTemplate(filterByNameId, "Filter by mod name (full match)")}
      ${textareaTemplate(filterByTextId, "Filter by mod title or description (partial match)")}
    </div>
  </form>
`;

const dialogHtml = dialogTemplate({
  title: dialogTitleTxt,
  body: dialogBodyHtml,
  dialogId,
  openDialogBtnId,
});

const filterConfig = {
  filterByNameList: [],
  filterByTextList: [],
};
const filterByNameListKey = "filterByNameList";
const filterByTextListKey = "filterByTextList";

// Stores a reference to the mod list element.
let modListElement;

async function main() {
  // Load filter configuration from storage
  filterConfig.filterByNameList = GM_getValue(filterByNameListKey, []);
  filterConfig.filterByTextList = GM_getValue(filterByTextListKey, []);

  await initDialogUi();

  // There is no easy way to get the element that contains the mod items, so we
  // instead listen for any mod item to become visible and then grab its grandparent
  let anyModItem = await waitForElement("a[href*='/g/'][href*='/m/']", -1); // wait indefinitely

  modListElement = anyModItem.parentElement.parentElement;

  onElementChange(modListElement, () => {
    filterElements();
    addIgnoreButtons();
  });
}

async function initDialogUi() {
  // Insert dialog html in body
  document.body.insertAdjacentHTML("beforeend", dialogHtml);

  const filterMenuEl = await waitForElement(filterMenuSelector);

  const filterMenuInnerEl = filterMenuEl.children[0];

  filterMenuInnerEl.insertAdjacentHTML("afterbegin", openDialogBtnHtml);

  // Hook up event listeners
  const extraFiltersBtn = document.getElementById(openDialogBtnId);

  extraFiltersBtn.addEventListener("click", () => {
    openDialog();
  });

  const saveFiltersBtn = document.getElementById(saveFiltersBtnId);
  saveFiltersBtn.addEventListener("click", () => {
    saveFilters();
  });

  const cancelDialogBtn = document.getElementById(cancelDialogBtnId);
  cancelDialogBtn.addEventListener("click", () => {
    closeDialog();
  });

  const closeDialogBtn = document.getElementById(closeDialogBtnId);
  closeDialogBtn.addEventListener("click", () => {
    closeDialog();
  });

  // Debug dialog
  // setTimeout(() => {
  //   openDialog();
  // }, 100);
}

function openDialog() {
  // build string values by joining each list
  const { filterByNameList, filterByTextList } = filterConfig;
  const filterByName = filterByNameList.join("\n");
  const filterByText = filterByTextList.join("\n");

  // populate filter textareas
  document.getElementById(filterByNameId).value = filterByName;
  document.getElementById(filterByTextId).value = filterByText;

  document.getElementById(dialogId).showModal();
}

function closeDialog() {
  document.getElementById(dialogId).close();
}

function saveFilters() {
  const filterByNameList = document
    .getElementById(filterByNameId)
    .value.split("\n")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);

  const filterByTextList = document
    .getElementById(filterByTextId)
    .value.split("\n")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  console.log({ filterByNameList, filterByTextList });

  filterConfig.filterByNameList = filterByNameList;
  filterConfig.filterByTextList = filterByTextList;

  GM_setValue(filterByNameListKey, filterConfig.filterByNameList);
  GM_setValue(filterByTextListKey, filterConfig.filterByTextList);

  closeDialog();

  resetFilteredElements();
  filterElements();
}

function onElementChange(element, callback) {
  callback(element);

  const observer = new MutationObserver((mutations) => {
    callback(element);
  });
  observer.observe(element, { childList: true, subtree: true });

  return observer;
}

function filterElements() {
  let modElements = Array.from(modListElement.children).filter((modItem) => modItem.className.includes("tw-group"));

  const filterByNameList = filterConfig.filterByNameList.map((x) => x.toLowerCase());
  const filterByTextList = filterConfig.filterByTextList.map((x) => x.toLowerCase());

  for (let i = 0; i < modElements.length; i++) {
    let modItem = modElements[i];

    let modLink = modItem.querySelector("a:first-child").href;
    let modName = modLink.substring(modLink.lastIndexOf("/") + 1).toLowerCase();

    if (filterByNameList.some((filter) => modName === filter)) {
      modItem.style.display = "none";
      continue;
    }

    let title = modItem.querySelector("a > div:nth-child(2) > span").textContent.toLowerCase();

    if (filterByTextList.some((filter) => title.includes(filter))) {
      modItem.style.display = "none";
    }
  }
}

function resetFilteredElements() {
  let modElements = Array.from(modListElement.children).filter((modItem) => modItem.className.includes("tw-group"));
  for (let i = 0; i < modElements.length; i++) {
    let modItem = modElements[i];
    modItem.style.display = "";
  }
}

function addIgnoreButtons() {
  let visibleModELements = Array.from(modListElement.children).filter(
    (modItem) => modItem.className.includes("tw-group") && modItem.style.display !== "none"
  );

  for (let i = 0; i < visibleModELements.length; i++) {
    let modItem = visibleModELements[i];

    let hasIgnoreBtn = modItem.querySelector(`button.${ignoreModBtnClassName}`);
    if (hasIgnoreBtn) {
      continue;
    }

    let modLink = modItem.querySelector("a:first-child").href;
    let modName = modLink.substring(modLink.lastIndexOf("/") + 1).toLowerCase();

    let ignoreModBtn = document.createElement("button");
    ignoreModBtn.type = "button";
    ignoreModBtn.className =
      ignoreModBtnClassName +
      " tw-absolute tw-top-0 tw-right-0" +
      " tw-dark tw-bg-theme-1 tw-text-theme tw-border-theme-1 tw-p-1" +
      " tw-button-transition tw-outline-none hover:tw-text-danger focus:tw-text-danger";
    ignoreModBtn.style.borderBottomLeftRadius = "25%";
    ignoreModBtn.innerHTML = /*html*/ `
      ${closeIconSvgTemplate()}
      <span class="sr-only">Close modal</span>
      `;
    ignoreModBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();

      modItem.style.display = "none";

      filterConfig.filterByNameList.push(modName);
      GM_setValue(filterByNameListKey, filterConfig.filterByNameList);
    });
    modItem.appendChild(ignoreModBtn);
  }
}

/**
 * Waits for an element to be present in the DOM.
 *
 * @param {string} selector - The CSS selector of the element to wait for.
 * @param {number} [timeout=10000] - The maximum time in milliseconds to wait for the element.
 *  A negative value means no timeout.
 * @return {Promise<Element>} A promise that resolves with the element when it is present in the DOM,
 *  and rejects if the timeout is exceeded
 */
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

    if (timeout > 0) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }, timeout);
    }
  });
}

try {
  main();
} catch (error) {
  window.alert("mod.io extra filters script error: " + error.message);
}

/******************************************************************************************************
 * UI Templates
 * Based on existing elements on mod.io/r/extra
 * The extra filters dialog template's structure and tailwind class soup are copied from the Report dialog
 *****************************************************************************************************/

function dialogTemplate(props) {
  const { title, body, dialogId, openDialogBtnId } = props;

  return /*html*/ `
    <dialog id="${dialogId}">
      <div class="tw-fixed tw-z-40 tw-inset-0 tw-overflow-y-auto tw-dark">
        <div
          class="tw-flex tw-h-full tw-justify-center tw-min-screenheight tw-text-center tw-text-theme tw-items-center"
        >
          <!-- backdrop -->
          <div class="tw-fixed tw-inset-0 tw-transition-opacity">
            <div class="tw-absolute tw-inset-0 tw-opacity-70 tw-bg-black"></div>
          </div>
          <!-- dialog content -->
          <div
            class="tw-w-full tw-align-bottom tw-text-left tw-shadow-xl tw-transform tw-transition-all sm:tw-align-middle tw-outline-none tw-border-primary tw-bg-theme tw-inline-block tw-max-w-3xl tw-border-2 tw-flex tw-flex-col tw-mx-4 sm:tw-mx-0 sm:tw-my-12 tw-global--border-radius tw-max-h-80vh"
          >
            <!-- dialog header -->
            <div
              class="tw-w-full tw-shadow-inner tw-z-3 tw-px-8 sm:tw-px-10 tw-py-6 tw-pl-8 tw-pr-12 tw-bg-theme-3 tw-global--border-radius-t tw-flex tw-items-center"
            >
              <div class="tw-w-full">
                <div class="tw-flex tw-flex-row tw-justify-between lg:tw-space-x-4 tw-space-y-4 lg:tw-space-y-0">
                  <div class="tw-w-full tw-flex tw-flex-col tw-justify-center">
                    <h2 class="tw-flex tw-leading-tight tw-justify-start tw-text-left tw-font-normal tw-text-h4">
                      ${title}
                    </h2>
                  </div>
                </div>
              </div>
              <!-- close button -->
              <button
                id="${closeDialogBtnId}"
                class="tw-absolute tw--top-9 tw-right-0 tw-flex tw-items-center tw-justify-center tw-overflow-hidden tw-button-transition tw-outline-none tw-shrink-0 tw-space-x-2 tw-font-bold hover:tw-text-primary focus:tw-text-primary tw-text-sm tw-cursor-pointer tw-input--height-small tw-input--width-small"
                tabindex="0"
              >
              ${closeIconSvgTemplate()}
                <span class="sr-only">Close modal</span>
              </button>
            </div>
            <!-- dialog body scrollable wrapper -->
            <div class="tw-mx-auto tw-py-6 tw-px-8 sm:tw-px-10 tw-overflow-auto tw-util-scrollbar tw-w-full">
              <!-- dialog body content -->
              <div class="tw-w-full tw-global--border-radius tw-relative tw-rounded-tr-none tw-border-transparent">
                ${body}
              </div>
              <!-- dialog footer -->
              <footer class="tw-border-theme-1 tw-py-6 tw-pb-0">
                <div class="tw-w-full tw-flex tw-justify-between tw-items-center">
                  <div class="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-w-full tw-gap-3">
                    <button
                      id="${cancelDialogBtnId}"
                      type="button"
                      class="tw-flex tw-items-center tw-justify-center tw-overflow-hidden tw-button-transition tw-outline-none tw-shrink-0 tw-space-x-2 tw-font-bold tw-text-md tw-leading-normal tw-global--border-radius tw-cursor-pointer tw-input--height-large tw-w-full sm:tw-w-36 tw-bg-theme-1 tw-text-theme tw-border-theme-1 hover:tw-bg-theme-2 focus:tw-bg-theme-1 hover:tw-border-theme-2 focus:tw-border-theme-2 tw-border-2"
                      tabindex="0"
                    >
                      <span class="tw-transform tw-transition-transform tw-translate-x-0"> Cancel </span>
                    </button>
                    <button
                      id="${saveFiltersBtnId}"
                      type="button"
                      class="tw-flex tw-items-center tw-justify-center tw-overflow-hidden tw-button-transition tw-outline-none tw-shrink-0 tw-space-x-2 tw-font-bold tw-text-md tw-leading-normal tw-global--border-radius tw-cursor-pointer tw-input--height-large tw-w-full sm:tw-w-36 tw-bg-primary tw-text-primary-text tw-border-primary hover:tw-bg-primary-hover focus:tw-bg-primary-hover hover:tw-border-primary-hover focus:tw-border-primary-hover tw-border-2"
                      tabindex="0"
                    >
                      <span class="tw-transform tw-transition-transform tw-translate-x-0"> Save </span>
                    </button>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  `;
}

function textareaTemplate(elementId, labelText) {
  return /*html*/ `
    <div class="tw-text-theme tw-relative tw-block tw-w-full">
      <div class="tw-flex tw-label-gap">
        <label class="tw-flex tw-flex-wrap sm:tw-items-center tw-w-full tw-justify-between" for="${elementId}">
          <span class="tw-text-md tw-opacity-70"> ${labelText} </span>
        </label>
      </div>
      <textarea
        id="${elementId}"
        placeholder="1 per line"
        cols="30"
        rows="10"
        tabindex="0"
        class="tw-flex tw-input--p tw-resize-y tw-min-h-18 tw-global--border-radius tw-transition-colors tw-ease-in-out tw-bg-input-group-hover tw-input--text-size tw-leading-normal tw-outline-none tw-appearance-none tw-w-full tw-input--focus"
        value=""
      ></textarea>
    </div>
  `;
}

function closeIconSvgTemplate() {
  return /*svg*/ `
  <svg
    class="svg-inline--fa fa-times fa-fw fa-xl tw-fill-current"
    aria-hidden="true"
    focusable="false"
    data-prefix="fas"
    data-icon="times"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 352 512"
  >
    <path
      class=""
      fill="currentColor"
      d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
    ></path>
  </svg>
  `;
}

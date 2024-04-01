// ==UserScript==
// @name         StoryGraph Extra Menus
// @namespace    selfdocumentingcode
// @version      0.1
// @description  Adds extra menus to StoryGraph pages
// @author       selfdocumentingcode@github
// @match        https://app.thestorygraph.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thestorygraph.com
// @license      MIT
// @noframes
// @grant        GM_addStyle
// ==/UserScript==
('use strict');

console.log('StoryGraph Extra Menus script running');

const turboLoadEvent = 'turbo:load';

// Default classes for desktop menu links
const selectedLinkClassDesktop =
  'inline-flex items-center px-1 pt-1 border-b-4 text-xs xl:text-sm font-body' +
  'border-cyan-700 dark:border-cyan-500 text-cyan-700 dark:text-cyan-500 font-semibold';
const regularLinkClassDesktop =
  'inline-flex items-center px-1 pt-1 border-b-4 text-xs xl:text-sm font-body ' +
  'border-transparent text-darkestGrey dark:text-grey hover:border-cyan-700 dark:hover:border-cyan-500';

// Adjust margin for desktop menu links to make space for new links
const adjustMarginStyleDesktop = 'calc(32px*(1 - var(--tw-space-x-reverse)))!important';
const adjustMarginClassDesktop = 'adjust-margin';
const extraStyle = `@media (min-width:1280px) { .${adjustMarginClassDesktop} { margin-left: ${adjustMarginStyleDesktop}; } }`;

// Make following links hidden on narrow screens (like Home link)
const existingLinksClassAdjustments = [
  { linkText: 'Community', classToRemove: 'inline-flex', classesToAdd: ['hidden', 'xl:inline-flex'] },
  { linkText: 'Giveaways', classToRemove: 'inline-flex', classesToAdd: ['hidden', 'xl:inline-flex'] },
];

function main() {
  GM_addStyle(extraStyle);

  const locationHref = window.location.href;
  const locationPath = `${window.location.pathname}${window.location.search}`;

  let navbar = document.getElementById('navbar');
  let menuDivDesktop = navbar.querySelector('div > div > div').children[1];
  let linkElementsDesktop = menuDivDesktop.querySelectorAll('a');

  // Grab the profile name from the profile link in the mobile menu
  const menuDivMobile = navbar.querySelector('#mobile-menu');
  const profileLinkEl = menuDivMobile.querySelector("a[href*='/profile']");
  const profileLinkValue = !!profileLinkEl?.href?.length ? profileLinkEl.href.split('/').pop() : null;

  const newLinks = [
    { text: 'Reading', href: `/currently-reading/${profileLinkValue}` },
    { text: 'Read', href: `/books-read/${profileLinkValue}` },
    { text: 'To-Read', href: `/to-read/${profileLinkValue}` },
  ];

  function handleLoadCompleted() {
    navbar = document.getElementById('navbar');
    menuDivDesktop = navbar.querySelector('div > div > div').children[1];
    linkElementsDesktop = menuDivDesktop.querySelectorAll('a');

    updateLinks();
  }

  function updateLinks() {
    console.log('Adding links to menu');

    const locationHref = window.location.href;
    const locationPath = `${window.location.pathname}${window.location.search}`;

    // Add links to desktop menu
    newLinks.forEach((link) => {
      const existingLink = Array.from(linkElementsDesktop).find((el) => el.textContent === link.text);

      if (existingLink) return;

      const newLink = document.createElement('a');
      newLink.href = link.href;
      newLink.textContent = link.text;

      const linkSelected = link.href === locationPath;
      newLink.className = linkSelected ? selectedLinkClassDesktop : regularLinkClassDesktop;
      newLink.classList.add(adjustMarginClassDesktop);

      menuDivDesktop.appendChild(newLink);
    });

    // Adjust margin for existing links
    linkElementsDesktop.forEach((link) => {
      if (link.classList.contains(adjustMarginClassDesktop)) return;

      link.classList.add(adjustMarginClassDesktop);
    });

    // Adjust visibility for some existing links
    existingLinksClassAdjustments.forEach((adjustment) => {
      const existingLink = Array.from(linkElementsDesktop).find((el) => el.textContent === adjustment.linkText);

      if (existingLink) {
        if (!existingLink.classList.contains(adjustment.classToRemove)) return;

        existingLink.classList.remove(adjustment.classToRemove);
        adjustment.classesToAdd.forEach((cls) => existingLink.classList.add(cls));
      }
    });
  }

  updateLinks();

  window.addEventListener(turboLoadEvent, handleLoadCompleted);
}

try {
  main();
} catch (error) {
  window.alert('StoryGraph Extra Menus script error: ' + error.message);
}

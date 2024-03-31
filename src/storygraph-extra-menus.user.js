// ==UserScript==
// @name         StoryGraph Extra Menus
// @namespace    selfdocumentingcode
// @version      0.1
// @description  Adds extra menus to StoryGraph pages
// @author       selfdocumentingcode@github
// @match        https://app.thestorygraph.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thestorygraph.com
// @grant        none
// @license      MIT
// @noframes
// ==/UserScript==

// TODO Use a simple nodejs express server to serve the script
// TODO Rebuild menu on url change
// TODO fix selected/unselected link query selectors

"use strict";
function main() {

  console.log("StoryGraph Extra Menus script running")

  const locationHost = window.location.host;
  const locationPath = `${window.location.pathname}${window.location.search}`;

  const navbar = document.getElementById("navbar");
  console.log("navbar", navbar);
  const menuDivDesktop = navbar.querySelector("div > div > div").children[1];
  console.log("menuDivDesktop", menuDivDesktop);
  const menuDivMobile = navbar.querySelector("#mobile-menu");
  const linkContainerMobile = menuDivMobile.querySelector("div");
  console.log("menuDivMobile", menuDivMobile);

  const profileLinkEl = menuDivMobile.querySelector("a[href*='/profile']");
  console.log("profileLinkEl", profileLinkEl);
  const profileLinkValue = !!profileLinkEl?.href?.length ? profileLinkEl.href.split("/").pop() : null;
  console.log("profileLinkValue", profileLinkValue);

  // Build list of links to add
  const links = [
    { text: "Reading", href: `/currently-reading/${profileLinkValue}` },
    { text: "Read", href: `/books-read/${profileLinkValue}` },
    { text: "To Read", href: `/to-read/${profileLinkValue}` },
  ];

  // Find the class names of selected and unselected desktop menu links
  const selectedLinkDesktop = menuDivDesktop.querySelector(`a[href*="${locationPath}"]:not(.hidden)`);
  const unselectedLinkDesktop = menuDivDesktop.querySelector(`a:not([href*="${locationPath}]):not(.hidden)`);

  const selectedLinkDesktopClass = selectedLinkDesktop && selectedLinkDesktop.className;
  const unselectedLinkDesktopClass = unselectedLinkDesktop && unselectedLinkDesktop.className;

  // Find the class names of selected and unselected mobile menu links
  const selectedLinkMobile = menuDivMobile.querySelector(`a[href*="${locationPath}"]`);
  const unselectedLinkMobile = menuDivMobile.querySelector(`a:not([href*="${locationPath}"])`);

  const selectedLinkMobileClass = selectedLinkMobile && selectedLinkMobile.className;
  const unselectedLinkMobileClass = unselectedLinkMobile && unselectedLinkMobile.className;

  // Add links to desktop menu
  links.forEach(link => {
    const newLink = document.createElement("a");
    newLink.href = link.href;
    newLink.textContent = link.text;

    const linkSelected = link.href === locationPath;
    newLink.className = linkSelected ? selectedLinkDesktopClass : unselectedLinkDesktopClass;

    menuDivDesktop.appendChild(newLink);
  });

  // Add links to mobile menu
  links.forEach(link => {
    const newLink = document.createElement("a");
    newLink.href = link.href;
    newLink.textContent = link.text;

    const linkSelected = link.href === locationPath;
    newLink.className = linkSelected ? selectedLinkMobileClass : unselectedLinkMobileClass;

    menuDivMobile.appendChild(newLink);
  });

}

try {
  main();
} catch (error) {
  window.alert("StoryGraph Extra Menus script error: " + error.message);
}

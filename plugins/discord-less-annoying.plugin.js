/**
 * @name LessAnnoyingDiscord
 * @version 0.0.1
 * @description Better Discord Plugin: Turns off reply ping by default, adds reply ping toggle hotkey, hides gift nitro button.
 * @author selfdocumentingcode@github
 * @authorLink https://github.com/selfdocumentingcode
 * @source https://gist.github.com/selfdocumentingcode/0601fd147fc1ff0cf8987f2de4f635b1
 * @updateUrl https://gist.github.com/selfdocumentingcode/0601fd147fc1ff0cf8987f2de4f635b1/raw/71cdbe2c760243533c8829eea6cb53edf5a1d2e9/less_annoying_discord.plugin.js
 */

module.exports = class LessAnnoyingDiscord {
    #channelTextAreaEl;
    #pingToggleEl;

    #pingReplyObserver = new MutationObserver(() => {
        if (!this.#channelTextAreaEl) return;

        this.#pingToggleEl = this.#channelTextAreaEl.querySelector('div[role=switch]');

        if (!this.#pingToggleEl) return;

        if (this.#pingToggleEl.getAttribute('aria-checked') === 'true') {
            this.#pingToggleEl.click();
        }
    });

    start() {
        this.#initHideGiftButton();
        this.#initTurnOffReplyPing();
    }
    stop() {
        this.#pingReplyObserver.disconnect();
        if (this.#channelTextAreaEl) {
            this.#channelTextAreaEl.removeEventListener('keydown', this.#pingToggleHotkeyListener.bind(this));
        }
    }

    onSwitch() {
        this.#initTurnOffReplyPing();
    }

    #pingToggleHotkeyListener(e) {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            this.#pingToggleEl && this.#pingToggleEl.click();
        }
    }

    #initTurnOffReplyPing() {
        const channelTextAreaElLocal = document.querySelector('div[class^=channelTextArea]');

        if (!channelTextAreaElLocal || channelTextAreaElLocal === this.#channelTextAreaEl) return;

        this.#channelTextAreaEl = channelTextAreaElLocal;

        this.#pingReplyObserver.disconnect();
        this.#pingReplyObserver.observe(this.#channelTextAreaEl, {
            childList: true,
            subtree: true,
        });

        this.#channelTextAreaEl.removeEventListener('keydown', this.#pingToggleHotkeyListener.bind(this));
        this.#channelTextAreaEl.addEventListener('keydown', this.#pingToggleHotkeyListener.bind(this));
    }

    #initHideGiftButton() {
        const cssString = 'button[aria-label="Send a gift"] { display: none }';

        window.BdApi.injectCSS('hideGiftButton', cssString);
    }
};

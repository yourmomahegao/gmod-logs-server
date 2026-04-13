class Loading {
  static LoadingHtml() {
    $("body").prepend(`<div class="loading-screen-container hidden">
          <div class="loading-screen-sub-container">
            <input type="text" id="loading-iteraction-blocker" />
            <!-- <svg class="loading-screen-icon" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <style>
                .spinner_nOfF {
                  animation: spinner_qtyZ 2s cubic-bezier(0.36, 0.6, 0.31, 1) infinite;
                }
                .spinner_fVhf {
                  animation-delay: -0.5s;
                }
                .spinner_piVe {
                  animation-delay: -1s;
                }
                .spinner_MSNs {
                  animation-delay: -1.5s;
                }
                @keyframes spinner_qtyZ {
                  0% {
                    r: 0;
                  }
                  25% {
                    r: 2px;
                    cx: 4px;
                  }
                  50% {
                    r: 2px;
                    cx: 12px;
                  }
                  75% {
                    r: 2px;
                    cx: 20px;
                  }
                  100% {
                    r: 0;
                    cx: 20px;
                  }
                }
              </style>
              <circle class="spinner_nOfF" cx="4" cy="12" r="3" />
              <circle class="spinner_nOfF spinner_fVhf" cx="4" cy="12" r="2" />
              <circle class="spinner_nOfF spinner_piVe" cx="4" cy="12" r="2" />
              <circle class="spinner_nOfF spinner_MSNs" cx="4" cy="12" r="2" />
            </svg> -->

            <div class="loading-text">Загрузка...</div>
            <div class="loading-screen-progress">
              <div class="loading-screen-progress-element"></div>
            </div>
          </div>
        </div>`);

    Loading.HtmlCreated = true;
  }

  static LoadingCss() {
    $("head").append(`<style id="loading-screen-styles">
      @keyframes auto-loading {
        0% {
          margin-right: auto;
          margin-left: 0;
          width: 0%;
        }
        50% {
          width: 100%;
        }
        100% {
          margin-left: auto;
          margin-right: 0;
          width: 0;
        }
      }
      .loading-screen-container {
        position: fixed;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background: var(--background-absolute-alpha);
        backdrop-filter: blur(5px);
        z-index: 999999;
      }
      .loading-screen-container.hidden {
        display: none;
      }
      .loading-screen-container.auto .loading-screen-sub-container .loading-screen-progress .loading-screen-progress-element {
        animation: auto-loading 1.5s cubic-bezier(0.65, 0.04, 0.16, 0.98) infinite;
      }
      .loading-screen-container #loading-iteraction-blocker {
        width: 0;
        height: 0;
        opacity: 0;
      }
      .loading-screen-container .loading-screen-sub-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 14px;
      }
      .loading-screen-container .loading-screen-sub-container .loading-screen-icon {
        height: 48px;
        fill: var(--main);
        stroke: var(--main);
      }
      .loading-screen-container .loading-screen-sub-container .loading-text {
        color: var(--text);
        font-size: 12px;
        font-weight: 600;
      }
      .loading-screen-container .loading-screen-sub-container .loading-screen-progress {
        width: 14%;
        height: 6px;
        border-radius: 999px;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        flex-direction: row;
        background: var(--background-full-alpha);
        overflow: hidden;
      }
      .loading-screen-container .loading-screen-sub-container .loading-screen-progress .loading-screen-progress-element {
        width: 0;
        height: 100%;
        border-radius: 999px;
        background: var(--main);
        transition: width 0.5s cubic-bezier(0.52, 0.04, 0.34, 0.96);
      }</style>`);

    Loading.CssCreated = true;
  }

  static HtmlCreated = false;
  static CssCreated = false;
  static IsAuto = false;
  static DefaultText = "Загрузка...";

  static $LoadingScreen = null;
  static $LoadingScreenProgressElement = null;

  static SetProgress(amount, message = null) {
    if (amount > 100) amount = 100;
    if (amount < 0) amount = 0;

    if (Loading.IsAuto) {
      Loading.$LoadingScreenProgressElement.css("width", "");
    }

    if (!Loading.IsAuto) {
      Loading.$LoadingScreenProgressElement.css("width", `${amount}%`);
    }
  }

  static Check() {
    if (!Loading.HtmlCreated) {
      Loading.LoadingHtml();
    }

    if (!Loading.CssCreated) {
      Loading.LoadingCss();
    }

    Loading.$LoadingScreen = $(".loading-screen-container");
    Loading.$LoadingScreenProgressElement = $(".loading-screen-container .loading-screen-sub-container .loading-screen-progress .loading-screen-progress-element");
  }

  static SetText(text = Loading.DefaultText) {
    Loading.$LoadingScreen.find(".loading-text").text(text);
  }

  static SetAuto(auto = true) {
    Loading.IsAuto = auto;
    if (auto) Loading.$LoadingScreen.addClass("auto");
    if (!auto) Loading.$LoadingScreen.removeClass("auto");
  }

  static async Show(auto = true) {
    Loading.Check();
    Loading.SetAuto(auto);
    Loading.SetProgress(0);
    Loading.SetText(Loading.DefaultText);
    Loading.$LoadingScreen.removeClass("hidden");
  }

  static Hide() {
    Loading.Check();
    Loading.SetProgress(0);
    Loading.SetText(Loading.DefaultText);
    Loading.$LoadingScreen.addClass("hidden");
  }
}

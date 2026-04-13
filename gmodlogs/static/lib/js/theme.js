function ApplyTheme(theme) {
  // Resettng :root datas
  if (theme == "dark") {
    // Setting new theme
    localStorage.setItem("THEME", "dark");

    document.documentElement.style.setProperty("--green", "rgb(29, 255, 71)");
    document.documentElement.style.setProperty("--green-dark", "rgb(25, 199, 57)");
    document.documentElement.style.setProperty("--green-alpha", "rgba(29, 255, 71, 0.3)");
    document.documentElement.style.setProperty("--green-full-alpha", "rgba(29, 255, 71, 0.1)");

    document.documentElement.style.setProperty("--bg", "rgb(30, 30, 30)");
    document.documentElement.style.setProperty("--bg-light", "rgb(35, 35, 35)");
    document.documentElement.style.setProperty("--bg-lighter", "rgb(40, 40, 40)");
    document.documentElement.style.setProperty("--bg-lightest", "rgb(45, 45, 45)");
    document.documentElement.style.setProperty("--bg-dark", "rgb(25, 25, 25)");
    document.documentElement.style.setProperty("--bg-inverted", "rgb(235, 235, 235)");
    document.documentElement.style.setProperty("--bg-light-inverted", "rgb(245, 245, 245)");
    document.documentElement.style.setProperty("--bg-lighter-inverted", "rgb(250, 250, 250)");
    document.documentElement.style.setProperty("--bg-lightest-inverted", "rgb(255, 255, 255)");
    document.documentElement.style.setProperty("--bg-dark-inverted", "rgb(215, 215, 215)");
    document.documentElement.style.setProperty("--text", "rgb(245, 245, 245)");
    document.documentElement.style.setProperty("--text-inverted", "rgb(15, 15, 15)");
    document.documentElement.style.setProperty("--text-light", "rgb(255, 255, 255)");
    document.documentElement.style.setProperty("--text-dark", "rgb(230, 230, 230)");
    document.documentElement.style.setProperty("--text-darker", "rgb(210, 210, 210)");
    document.documentElement.style.setProperty("--text-darkest", "rgb(190, 190, 190)");
    document.documentElement.style.setProperty("--shadow", "rgba(255, 255, 255, 0.02) 0px 6px 24px 0px, rgba(255, 255, 255, 0.08) 0px 0px 0px 1px");
    document.documentElement.style.setProperty("--shadow-light", "rgba(255, 255, 255, 0.02) 0px 6px 24px 0px, rgba(255, 255, 255, 0.08) 0px 0px 0px 1px");
    document.documentElement.style.setProperty("--shadow-fancy", "inset 0 1px 2px rgba(255, 255, 255, 0.02), 0 2px 4px rgba(0, 0, 0, 0.05)");

    $.each($("link"), function (_, value) {
      const $element = $(value);
      let href = $element.attr("href");

      if (href.includes("prism-light.css")) {
        href = href.replace("prism-light.css", "prism.css");
        $element.attr("href", href);
        return false;
      }
    });

    $(".title-bar-option#theme").addClass("dark-mode");
    $(".title-bar-option#theme").removeClass("light-mode");
  } else {
    localStorage.setItem("THEME", "light");

    document.documentElement.style.setProperty("--green", "rgb(26, 213, 60)");
    document.documentElement.style.setProperty("--green-dark", "rgb(19, 152, 44)");
    document.documentElement.style.setProperty("--green-alpha", "rgba(26, 213, 60, 0.3)");
    document.documentElement.style.setProperty("--green-full-alpha", "rgba(26, 213, 60, 0.1)");

    document.documentElement.style.setProperty("--bg", "rgb(235, 235, 235)");
    document.documentElement.style.setProperty("--bg-light", "rgb(245, 245, 245)");
    document.documentElement.style.setProperty("--bg-lighter", "rgb(250, 250, 250)");
    document.documentElement.style.setProperty("--bg-lightest", "rgb(255, 255, 255)");
    document.documentElement.style.setProperty("--bg-dark", "rgb(215, 215, 215)");
    document.documentElement.style.setProperty("--bg-inverted", "rgb(30, 30, 30)");
    document.documentElement.style.setProperty("--bg-light-inverted", "rgb(35, 35, 35)");
    document.documentElement.style.setProperty("--bg-lighter-inverted", "rgb(40, 40, 40)");
    document.documentElement.style.setProperty("--bg-lightest-inverted", "rgb(45, 45, 45)");
    document.documentElement.style.setProperty("--bg-dark-inverted", "rgb(25, 25, 25)");
    document.documentElement.style.setProperty("--text", "rgb(35, 35, 35)");
    document.documentElement.style.setProperty("--text-inverted", "rgb(245, 245, 245)");
    document.documentElement.style.setProperty("--text-light", "rgb(30, 30, 30)");
    document.documentElement.style.setProperty("--text-dark", "rgb(50, 50, 50)");
    document.documentElement.style.setProperty("--text-darker", "rgb(80, 80, 80)");
    document.documentElement.style.setProperty("--text-darkest", "rgb(100, 100, 100)");
    document.documentElement.style.setProperty("--shadow", "rgba(0, 0, 0, 0.02) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px");
    document.documentElement.style.setProperty("--shadow-light", "rgba(0, 0, 0, 0.02) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px");
    document.documentElement.style.setProperty("--shadow-fancy", "inset 0 1px 2px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(255, 255, 255, 0.05)");

    $.each($("link"), function (_, value) {
      const $element = $(value);
      let href = $element.attr("href");

      if (href.includes("prism.css")) {
        href = href.replace("prism.css", "prism-light.css");
        $element.attr("href", href);
        return false;
      }
    });

    $(".title-bar-option#theme").removeClass("dark-mode");
    $(".title-bar-option#theme").addClass("light-mode");
  }
}

$(function () {
  // Loading current theme
  let currentTheme = localStorage.getItem("THEME");
  if (currentTheme == null) {
    currentTheme = "dark";
  }
  ApplyTheme(currentTheme);

  // Adding theme handler
  let themeButton = $(`.title-bar .title-bar-option[id="theme"]`);
  themeButton.on("click", function () {
    // Getting new theme
    let oldTheme = localStorage.getItem("THEME");
    let newTheme = null;

    if (oldTheme == null || oldTheme == "light") {
      newTheme = "dark";
    } else {
      newTheme = "light";
    }
    
    ApplyTheme(newTheme);
  });
});
function setCookie(name, value, days, path = "/") {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=" + path;
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }

  try {
    return sessionStorage.getItem(name);
  } catch (e) {}

  return null;
}

function removeCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function clearCookies() {
  document.cookie.split(";").forEach((cookie) => (document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`)));
}

function getAllCookies() {
  var cookies = [];
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    var parts = c.split("=");
    if (parts.length === 2) {
      cookies.push({
        name: parts[0],
        value: parts[1],
      });
    }
  }
  return cookies;
}

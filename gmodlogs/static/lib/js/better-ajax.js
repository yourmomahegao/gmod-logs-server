class BetterAjax {
  constructor(url = "", data = {}, method = "POST", headers = {}, dataType = "json") {
    this.url = url;
    this.data = data;
    this.method = method;
    this.headers = headers;
    this.dataType = dataType;
  }

  /**
   *Runs async query
   *
   * @memberof BetterAjax
   */
  async Run() {
    const self = this;
    const currentDate = Date.now();
    this.headers["X-CSRFToken"] = getCookie("csrftoken");
    this.headers["mode"] = "same-origin";

    let promise = new Promise(function (resolve, reject) {
      $.ajax({
        type: self.method,
        url: self.url,
        data: self.data,
        headers: self.headers,
        dataType: self.dataType,
        success: function (response) {
          resolve([true, response]);
        },
        error: function (response) {
          resolve([false, response]);
        },
      });
    });

    return promise;
  }
}

/* -------------------------------------

$(async function () {
    const betterAjax = new BetterAjax("/api/database/get_customers/", {});
    const [ajaxStatus, response] = await betterAjax.Run();
});

------------------------------------- */

class Logs {
  constructor() {
    this.$LogsContainer = $(".logs-container");
    this.$LogsTableContainer = this.$LogsContainer.find(".logs-table-container");
    this.$LogsTable = this.$LogsContainer.find(".logs-table");
    this.$LogsTableTbody = this.$LogsTable.find("tbody");
    this.$LogsSearchBar = this.$LogsContainer.find(".logs-search-bar");
    this.$LogsFilters = this.$LogsContainer.find(".logs-filters");
    this.$SearchInput = this.$LogsContainer.find(".search-input");
    this.$LogsFiltersDataFindBy = this.$LogsFilters.find(".logs-filters-data.find-by");
    this.$LogsFiltersDataActions = this.$LogsFilters.find(".logs-filters-data.actions");
    this.$LogsFiltersDataTypes = this.$LogsFilters.find(".logs-filters-data.types");
    this.$LogsFiltersDataDatetimes = this.$LogsFilters.find(".logs-filters-data.datetimes");

    // Variables
    this.IsLoading = false;
    this.Offset = 0;
    this.Limit = 20;

    // Handlers
    this.$SearchInput.on("focus", { self: this }, this.#Handler__SearchInputFocus);
    $(document).on("mousedown.logsfilters", { self: this }, this.#Handler__DocumentMousedown);
    this.$SearchInput.on("keyup", { self: this }, this.#Handler__SearchInputKeyup);
    this.$LogsTableContainer.on("scroll", { self: this }, this.#Handler__LogsTableContainerScroll);
    this.$LogsTable.on("mousedown", "tbody tr td.nickname", { self: this }, this.#Handler__LogsTableNicknameClick);
  }

  Reset() {
    this.IsLoading = false;
    this.Offset = 0;
  }

  async Preload() {
    const types = await this.GetLogsTypes();
    this.CreateFilterTypes(types);

    const actions = await this.GetLogsActions();
    this.CreateFilterActions(actions);

    const filters = this.GetFilters(this.Offset, this.Limit);
    const logs = await this.GetLogs(filters);
    this.Reset();
    this.ClearLogs();
    this.AppendLogs(logs);
  }

  async GetLogsTypes() {
    const betterAjax = new BetterAjax(`api/v1/get_logs_types/`, {}, "POST");
    const [ajaxStatus, response] = await betterAjax.Run();

    if (ajaxStatus == false) {
      new Notification("Не удалось получить типы логов", Notification.Type.ERROR, 3000).Show();
      return null;
    }

    if (response.status == false) {
      new Notification(response.message, Notification.Type.ERROR, 3000).Show();
      return null;
    }

    if (ajaxStatus == true && response.status == true) {
      return response.data;
    }

    return null;
  }

  async GetLogsActions() {
    const betterAjax = new BetterAjax(`api/v1/get_logs_actions/`, {}, "POST");
    const [ajaxStatus, response] = await betterAjax.Run();

    if (ajaxStatus == false) {
      new Notification("Не удалось получить действия логов", Notification.Type.ERROR, 3000).Show();
      return null;
    }

    if (response.status == false) {
      new Notification(response.message, Notification.Type.ERROR, 3000).Show();
      return null;
    }

    if (ajaxStatus == true && response.status == true) {
      return response.data;
    }

    return null;
  }

  static FormatDateRussian(dateString) {
    const date = new Date(dateString);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const day = date.getDate();
    const month = date.getMonth(); // 0–11
    const year = date.getFullYear();

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${String(year).padStart(2, '0')}`;
  }

  async GetLogs(filters) {
    const betterAjax = new BetterAjax(
      `api/v1/get_logs/`,
      {
        query: filters.query,
        find_by: JSON.stringify(filters.find_by),
        actions: JSON.stringify(filters.actions),
        types: JSON.stringify(filters.types),
        datetimes: JSON.stringify(filters.datetimes),
        offset: filters.offset,
        limit: filters.limit,
      },
      "POST",
    );
    const [ajaxStatus, response] = await betterAjax.Run();

    if (ajaxStatus == false) {
      new Notification("Не удалось получить логи", Notification.Type.ERROR, 3000).Show();
      return null;
    }

    if (response.status == false) {
      new Notification(response.message, Notification.Type.ERROR, 3000).Show();
      return null;
    }

    if (ajaxStatus == true && response.status == true) {
      for (const rowId in response.data) {
        response.data[rowId].insertion_datetime = Logs.FormatDateRussian(ApplyClientTimezone(response.data[rowId].insertion_datetime));
      }

      return response.data;
    }

    return null;
  }

  ClearLogs() {
    this.$LogsTableTbody.empty();
  }

  AppendLogs(logs) {
    if (!logs) return;

    for (const log of logs) {
      const $newLog = $(`<tr data-id="${log.id}">
                          <td class="steam-id">${log.steam_id}</td>
                          <td class="nickname" data-profile-link="http://steamcommunity.com/profiles/${log.steam_id64}">
                            <div class="nickname-data">
                              <span>${log.nickname}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg>
                            </div>
                          </td>
                          <td class="type-name" data-id="${log.type_id}"><span>${log.type_name}</span></td>
                          <td class="action-name">${log.action_name}</td>
                          <td class="data">${log.data}</td>
                          <td class="insertion-datetime">${log.insertion_datetime}</td>
                        </tr>`);

      this.$LogsTableTbody.append($newLog);
    }
  }

  GetQuery() {
    return this.$SearchInput.val();
  }

  GetFindByFilters() {
    const $findBies = this.$LogsFiltersDataFindBy.find("input[type='checkbox']:checked").closest(".logs-filter-checkbox");
    const findBiesIds = [];

    for (const _findBy of $findBies) {
      const $findBy = $(_findBy);
      findBiesIds.push($findBy.attr("data-field"));
    }

    return findBiesIds;
  }

  GetActionsFilters() {
    const $actions = this.$LogsFiltersDataActions.find("input[type='checkbox']:checked").closest(".logs-filter-checkbox");
    const actionsIds = [];

    for (const _action of $actions) {
      const $action = $(_action);
      actionsIds.push(parseInt($action.attr("data-id")) || null);
    }

    return actionsIds;
  }

  GetTypesFilters() {
    const $types = this.$LogsFiltersDataTypes.find("input[type='checkbox']:checked").closest(".logs-filter-checkbox");
    const typesIds = [];

    for (const _type of $types) {
      const $type = $(_type);
      typesIds.push(parseInt($type.attr("data-id")) || null);
    }

    return typesIds;
  }

  GetTypesFilters() {
    const $types = this.$LogsFiltersDataTypes.find("input[type='checkbox']:checked").closest(".logs-filter-checkbox");
    const typesIds = [];

    for (const _type of $types) {
      const $type = $(_type);
      typesIds.push(parseInt($type.attr("data-id")) || null);
    }

    return typesIds;
  }

  GetDatetimesFilters() {
    const $startDatetime = this.$LogsFiltersDataDatetimes.find(".start-datetime input");
    const $endDatetime = this.$LogsFiltersDataDatetimes.find(".end-datetime input");

    return {
      start: $startDatetime.val() ? new Date($startDatetime.val()).getTime() || null : null,
      end: $endDatetime.val() ? new Date($endDatetime.val()).getTime() || null : null,
    };
  }

  GetFilters(offset, limit) {
    return {
      query: this.GetQuery(),
      find_by: this.GetFindByFilters(),
      actions: this.GetActionsFilters(),
      types: this.GetTypesFilters(),
      datetimes: this.GetDatetimesFilters(),
      offset: offset,
      limit: limit,
    };
  }

  CreateFilterTypes(types) {
    this.$LogsFiltersDataTypes.empty();

    for (const _type of types) {
      const $newType = $(`<div class="logs-filter-checkbox steamid" data-id="${_type.id}">
                            <span>${_type.name}</span>              
                            <input type="checkbox"></input>
                          </div>`);

      this.$LogsFiltersDataTypes.append($newType);
    }
  }

  CreateFilterActions(actions) {
    this.$LogsFiltersDataActions.empty();

    for (const _action of actions) {
      const $newAction = $(`<div class="logs-filter-checkbox steamid" data-id="${_action.id}">
                            <span>${_action.name}</span>              
                            <input type="checkbox"></input>
                          </div>`);

      this.$LogsFiltersDataActions.append($newAction);
    }
  }

  ShowFilters() {
    this.$LogsFilters.removeClass("hidden");
  }

  HideFilters() {
    this.$LogsFilters.addClass("hidden");
  }

  #Handler__SearchInputFocus(event) {
    const self = event.data.self;
    self.ShowFilters();
  }

  async #Handler__DocumentMousedown(event) {
    const self = event.data.self;
    const $target = $(event.target);

    if ($target.closest(".logs-filters").length == 0 && $target.closest(".logs-search-bar").length == 0 && !self.$LogsFilters.hasClass("hidden")) {
      self.Reset();

      const filters = self.GetFilters(self.Offset, self.Limit);
      const logs = await self.GetLogs(filters);
      self.ClearLogs();
      self.AppendLogs(logs);

      self.HideFilters();
    }
  }

  async #Handler__SearchInputKeyup(event) {
    const self = event.data.self;

    if (event.key != "Enter") return;

    self.Reset();

    const filters = self.GetFilters(self.Offset, self.Limit);
    const logs = await self.GetLogs(filters);
    self.ClearLogs();
    self.AppendLogs(logs);

    self.HideFilters();
  }

  async #Handler__LogsTableContainerScroll(event) {
    const self = event.data.self;
    const $target = $(event.currentTarget);

    if (self.IsLoading) {
      return;
    }

    const threshold = 8;
    const isAtBottom = $target?.[0].scrollTop + $target?.[0].clientHeight >= $target?.[0].scrollHeight - threshold;

    if (!isAtBottom) {
      return;
    }

    self.IsLoading = true;

    try {
      const nextOffset = self.Offset + self.Limit;
      const nextLimit = self.Limit;

      const filters = self.GetFilters(nextOffset, nextLimit);
      const logs = await self.GetLogs(filters);

      if (!logs?.length) {
        return;
      }

      self.Offset = nextOffset;
      self.AppendLogs(logs);
    } finally {
      self.IsLoading = false;
    }
  }

  #Handler__LogsTableNicknameClick(event) {
    const self = event.data.self;
    const $target = $(event.currentTarget);
    const profileLink = $target.attr("data-profile-link");
    window.location.href = profileLink;
  }
}

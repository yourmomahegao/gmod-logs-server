var logs = null;

$(async function () {
  logs = new Logs();
  await logs.Preload();
});
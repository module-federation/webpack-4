

if (!window.System) {
  // 重复运行systemjs会导致异常
  require("systemjs/dist/s")
  require("systemjs/dist/extras/amd")
  require("systemjs/dist/extras/module-types")
}
if (!window.System.__wpmjs) {
  require("./wpmjsObject").default 
}

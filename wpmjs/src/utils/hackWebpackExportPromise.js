// webpack4使用 export(module) 方式向systemjs抛出模块
// import-http-webpack-plugin使用export promise方式来加载依赖
// getRegister hook, 让e(res<object>)支持res<promise>

const existingHook = System.constructor.prototype.getRegister;
System.constructor.prototype.getRegister = function (url) {
  return Promise.resolve(existingHook.call(this, url))
  .then(function ([deps, oriDecFun] = []) {
    // custom hook here
    return [deps, function decFun(_oriExport, _context) {
      let _exportRes = []
      function _export (...res) {
        _exportRes = res
        _oriExport(...res)
      }
      const decRes = oriDecFun(_export, _context)
      const {setters, execute: oriExec, ...otherDec} = decRes
      function execute (...execArgs) {
        oriExec?.call?.(this, execArgs)
        const [promiseRes] = _exportRes.filter(item => item instanceof Promise)
        if (promiseRes) {
          return Promise.all(_exportRes).then(res => {
            if (res[1]?.__esModule === true) {
              _oriExport(res[1])
            } else {
              _oriExport(...res)
            }
            return res
          })
        }
      }
      return {
        setters: setters,
        execute,
        ...otherDec
      }
    }]
  });
};




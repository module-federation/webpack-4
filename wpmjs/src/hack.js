// webpack4使用 export(module) 方式向systemjs抛出模块, 不支持异步模块（promise）
// 重写System.register, 让e(res<object>)支持res<promise>
;(function () {
  const System = window.System
  if (System.register.__wpm__hackPromise) return
  // 重写System.register, 让webpack4支持systemjs的top-level await
  var orireg = System.register
  System.register = function (dep, oriDecFun) {
    function decFun(_oriExport, _context) {
      let _exportRes
      function _export (...res) {
        _exportRes = res?.[0]
        _oriExport(...res)
      }
      const {setters, execute: oriExec} = oriDecFun(_export, _context)
      function execute () {
        oriExec.apply(this, arguments)
        if (_exportRes instanceof Promise) {
          return _exportRes.then(res => {
            _oriExport(res)
            return res
          })
        }
      }
      return {
        setters: setters,
        execute: execute
      }
    }
    return orireg.apply(this, [
      dep, 
      decFun
    ])
  }
  System.register.__wpm__hackPromise = true
})();
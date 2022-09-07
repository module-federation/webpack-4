// webpack4使用 library + system 会给System.register(name, dep, decFun)传入三个参数
// 固定丢弃name参数

const existingHook = System.constructor.prototype.register;
System.constructor.prototype.register = function (...args) {
  args = args.length === 3 ? args.slice(1) : args
  if (args[0] instanceof Array) {
    args[0] = args[0].filter(item => !!item)
  }
  return existingHook.apply(this, args)
};




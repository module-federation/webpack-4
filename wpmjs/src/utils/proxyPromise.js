export default function proxyPromise(obj) {
  return new Proxy(obj, {
    get (obj, prop) {
        if (prop === "then" || prop === "catch" || prop === "finally") {
          if (obj instanceof Promise) {
            return obj[prop]
          }
        }
        let _resolve
        const promise = new Promise(resolve => {
          _resolve = resolve
        });
        (async function () {
          const resProp = await (await obj)[prop]
          _resolve(resProp)
        })()
        return proxyPromise(promise)
    },
    async apply (target, context, args) {
      return proxyPromise(target.apply(context, args))
    }
  })
}
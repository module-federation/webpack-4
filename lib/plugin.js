/**
 * 注释中wpm意思是通过http引入的远程包
 */
 const pluginName = "ImportHttpWebpackPlugin"

 const { Template } = require("webpack")
 const { ConcatSource } = require("webpack-sources");
 const fs = require("fs")
 const path = require("path")
 const loaderPath = require.resolve("./loader")
 const packageJson = require(path.join(process.cwd(), "package.json"))
 const emptyJs = require.resolve("./$empty.js")
 const importWpmLoaderPath = require.resolve("./import-wpm-loader")
 const {minify} = require("terser");
 const webpack = require("webpack")
 const { stringifyHasFun, injectRefreshLoader, getUsedWpmPackages } = require("./utils");
 // https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js
 /**
  * import http
  */
 module.exports = class ImportHttpWebpackPlugin {
   constructor (options = {}) {
     this.options = Object.assign({
       alias: {},
       init: null,
       singleWarningPattern: /./,
       singleWarningExcludePkgs: [],
       injects: []
     }, options)
     options = this.options
     this.wpmHeader = ''
     this.jsonpFunction = ""
   }
   
   apply(compiler) {
     const options = this.options
     if (!options.module) {
      options.module = {}
     }
     if (!options.module.rules) {
      options.module.rules = []
     }
     options.module.rules.push([
      { parser: { system: false } }
    ])
     if (compiler.options.mode !== "production") {
       if (!options.alias) {
         options.alias = {}
       }
       if (!options.init) {
         options.init = {}
       }
       // TODO: dev react
       options.init.dev = true
      //  options.alias["react-refresh"] = 
      //  options.alias["react-refresh/runtime"] = 
      //  options.alias["react-refresh/runtime.js"] = 
      //    "wpmjs/$/react-refresh"
      //  options.singleWarningExcludePkgs.push("react-refresh")
     }
     this.mergeAlias(compiler)
     this.addLoader(compiler)
 
     compiler.resolverFactory.plugin('resolver normal', resolver => {
       this.interceptImport(resolver)
     });
     this.patchJsonpChunk(compiler)
     this.injectChunks(compiler)
   }
 
   // 1. 为loader编译出的__wpm__entryWaitLoaderChunkId替换为真实的chunkId
   // 2. 将wpmjs sdk和__wpm__plugin变量打包进所有chunk第一行, 准备好加载远程资源的相关api
   // __wpm__plugin = {
   //   chunkMap: {},
   //   wait () {}
   // }
   injectChunks(compiler) {
     compiler.hooks.emit.tap(pluginName, compilation => {
        this.wpmHeader = this.getWpmHeader()
       const chunks = compilation.chunks
       chunks.forEach(chunk => {
        chunk.files.forEach(file => {
          if (!(/^[^?]+\.js([?#]|$)/.test(file))) return
          const source = new ConcatSource()
          const oldSourceText = compilation.assets[file].source()
          const wpmPackages = getUsedWpmPackages(oldSourceText)
          source.add(`window.__wpm__plugin.chunkMap['${packageJson.name}__${chunk.id}'] = ${JSON.stringify(wpmPackages)};\r\n`)
          source.add(
            oldSourceText
              .replace(/\_\_wpm\_\_entryWaitLoaderChunkId/g, chunk.id)
              + '\r\n'
          )
          compilation.assets[file] = source
        })
       })
 
       chunks.forEach(chunk => {
        chunk.files.forEach(file => {
          if (!(/^[^?]+\.js([?#]|$)/.test(file))) return
          const oriSource = compilation.assets[file].source()
          const newSource = new ConcatSource()
          // TODO: 此处直接用自执行函数会产生乱码
          newSource.add(`
          ;var WpmMessyCodeCompilerFunction = (function () {
          `)
          newSource.add(this.wpmHeader)
          newSource.add(`
          })();
          `)
          newSource.add(oriSource)
          compilation.assets[file] = newSource
        })
       })
     })
   }
 
   /**
    * 让webpack的chunk等待, 使http包预先加载
    * @param {*} compiler 
    */
   patchJsonpChunk(compiler) {
     compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
       let once = true
       compilation.hooks.beforeModuleIds.tap(pluginName, () => {
         // beforeModuleIds钩子之后, 才会有chunkTemplate.hooks.render
         // 只需要对chunkTemplate.hooks.render进行监听
         // once避免重复挂载监听
         if (!once) return
         const mainTemplate = compilation.mainTemplate
         const chunkTemplate = compilation.chunkTemplate
         const jsonpFunction = chunkTemplate.outputOptions.jsonpFunction;
         this.jsonpFunction = jsonpFunction
         
         // 让jsonp chunk代码wait(用到的wpm packages)
         compilation.chunkTemplate.hooks.render.tap(
           pluginName,
           (modules, chunk) => {
             const source = new ConcatSource()
             const wpmPackages = getUsedWpmPackages(modules.source())
             source.add(`window.__wpm__plugin.chunkMap['${packageJson.name}__${chunk.id}'] = ${JSON.stringify(wpmPackages)};\r\n`)
             source.add(`window.window.__wpm__plugin.wait(${JSON.stringify(wpmPackages)}).then(res => {\r\n`)
             source.add(modules)
             source.add(`\r\n})`)
             return source;
           }
         )
     
 
         // jsonp chunk会wait再执行, 此处为entry, 声明jsonp代码的地方, 需配合jsonp chunk进行wait
         compilation.mainTemplate.hooks.jsonpScript.tap(pluginName,
           (_, chunk, hash) => {
             const crossOriginLoading =
               mainTemplate.outputOptions.crossOriginLoading;
             const chunkLoadTimeout = mainTemplate.outputOptions.chunkLoadTimeout;
             const jsonpScriptType = mainTemplate.outputOptions.jsonpScriptType;
             return Template.asString([
               "var script = document.createElement('script');",
               "var onScriptComplete;",
               jsonpScriptType
                 ? `script.type = ${JSON.stringify(jsonpScriptType)};`
                 : "",
               "script.charset = 'utf-8';",
               `script.timeout = ${chunkLoadTimeout / 1000};`,
               `if (${mainTemplate.requireFn}.nc) {`,
               Template.indent(
                 `script.setAttribute("nonce", ${mainTemplate.requireFn}.nc);`
               ),
               "}",
               'script.src = jsonpScriptSrc(chunkId)',
               crossOriginLoading
                 ? Template.asString([
                     "if (script.src.indexOf(window.location.origin + '/') !== 0) {",
                     Template.indent(
                       `script.crossOrigin = ${JSON.stringify(crossOriginLoading)};`
                     ),
                     "}"
                   ])
                 : "",
               "// create error before stack unwound to get useful stacktrace later",
               "var error = new Error();",
               "onScriptComplete = function (event) {",
               Template.indent([
                 `window.__wpm__plugin.wait(window.__wpm__plugin.chunkMap["${packageJson.name}__" + chunkId]).then(res => {`,
                 Template.indent([
                   "// avoid mem leaks in IE.",
                   "script.onerror = script.onload = null;",
                   "clearTimeout(timeout);",
                   "var chunk = installedChunks[chunkId];",
                   "if(chunk !== 0) {",
                   Template.indent([
                     "if(chunk) {",
                     Template.indent([
                       "var errorType = event && (event.type === 'load' ? 'missing' : event.type);",
                       "var realSrc = event && event.target && event.target.src;",
                       "error.message = 'Loading chunk ' + chunkId + ' failed.\\n(' + errorType + ': ' + realSrc + ')';",
                       "error.name = 'ChunkLoadError';",
                       "error.type = errorType;",
                       "error.request = realSrc;",
                       "chunk[1](error);"
                     ]),
                     "}",
                     "installedChunks[chunkId] = undefined;"
                   ]),
                   "}",
                 ]),
                 `})`
               ]),
               "};",
               "var timeout = setTimeout(function(){",
               Template.indent([
                 "onScriptComplete({ type: 'timeout', target: script });"
               ]),
               `}, ${chunkLoadTimeout});`,
               "script.onerror = script.onload = onScriptComplete;"
             ]);
           }
         )
         once = false
       })
     })
   }
 
   /**
    * 拦截import
    * @param {*} resolver 
    */
   interceptImport(resolver) {
     resolver.hooks.resolve.tapAsync(pluginName, (request, resolveContext, cb) => {
       const requestStr = request.request
       let [_, pkgName] = requestStr.match(/[\\/]+wpmjs[\\/]+\$[\\/]+(.+)/) || []
       if (/^https?:\/\//.test(requestStr)) {
        // http直接
        pkgName = requestStr
       }
       if (pkgName) {
        const query = request.query || ""
         cb(null, {
           path: emptyJs,
           request: "",
           query: `?${query.replace('?', "&")}&wpm&type=wpmPkg&pkgName=${encodeURIComponent(pkgName + query)}`,
         })
       } else {
         cb()
       }
     });
   }
 
   /**
    * 注册loader
    * @param {*} compiler 
    */
   addLoader(compiler) {
     const importWpmMatch = function (moduleData) {
       return moduleData.resourceResolveData.path.indexOf(emptyJs) > -1
     };
     const entryWaitMatch = function (moduleData) {
       return /\.([cm]js|[jt]sx?|flow)$/i.test(moduleData.resourceResolveData.path)
     };
     compiler.hooks.compilation.tap(
       pluginName,
       (compilation, { normalModuleFactory }) => {
         normalModuleFactory.hooks.afterResolve.tap(
           this.constructor.name,
           // Add react-refresh loader to process files that matches specified criteria
           (data) => {
             data = injectRefreshLoader(data, {match: entryWaitMatch}, loaderPath)
             data = injectRefreshLoader(data, {match: importWpmMatch}, importWpmLoaderPath)
             return data;
           }
         );
       })
   }
 
   /**
    * 合并alias
    * @param {*} compiler 
    */
   mergeAlias(compiler) {
     // 给resolve.alias默认值
     if (!compiler.options.resolve) {
       compiler.options.resolve = {}
     }
     if (!compiler.options.resolve.alias) {
       compiler.options.resolve.alias = {}
     }
     const compilerAlias = compiler.options.resolve.alias
     const remotes = this.options.remotes
     Object.keys(remotes).forEach(name => {
     const targetName = `wpmjs/$/${name}`
      const pkgName = name.split("@")[0]
      if (compilerAlias[pkgName]) {
        console.log(`[import-http-webpack-plugin]覆盖alias: ${compilerAlias[pkgName]} -> ${targetName}`)
      }
      compilerAlias[pkgName] = targetName
    })
   }
 
   /**
    * 插入到每个chunk首行, 最先执行的代码
    * @returns 
    */
   getWpmHeader () {
     const wpmInit = stringifyHasFun({
      ...this.options.init,
      idUrlMap: this.options.remotes,
      devIdUrlMap: this.options.devRemotes,
      idDefineMap: this.options.defineRemotes,
    } || {})
     function runInject(content) {
      if (/^https?:\/\//.test(content)) {
        return minify(`window.__wpm__plugin.injectSdkMap["${content}"] || (window.__wpm__plugin.injectSdkMap["${content}"] = window.fetch("${content}").then(function (res) {
          return res.text()
        }).then(function(code) {
          eval(code)
        }))`).code
      } else {
        return `Promise.resolve().then(function (_) {
          ${minify(content).code}
        })`
      }
     }
     const terserResult = minify(`
       (function(){
        initWpmPlugin();
         var injectsPromise = window["injectsPromise_${this.jsonpFunction}"]
         if (!injectsPromise) {
            window["injectsPromise_${this.jsonpFunction}"] = Promise.all([${this.options.injects.map(inject => {
              return `(function() {return ${runInject(inject)}})()`
            }).join(",")}])
            injectsPromise = window["injectsPromise_${this.jsonpFunction}"]
         }
         var initConfig = ${wpmInit};
         function initWpmPlugin() {
          if (!window.__wpm__plugin) {
            window.__wpm__plugin = {
              injectSdkMap: {},
              chunkMap: {},
              wait (pkgs) {
                if (!(pkgs instanceof Array)) {
                  throw new Error("wait(pkgs)入参需要是数组")
                }
                if (pkgs.length === 0) {
                  return Promise.resolve()
                }
                return new Promise(function (resolve, reject) {
                  window.__wpm__plugin.wpmjsScriptOnload(function () {
                    resolve(Promise.all(pkgs.map(function (pkg){
                      return window.System.__wpmjs__.import(pkg)
                    })))
                  })
                })
              },
              wpmjsScriptOnload: function (cb) {
               injectsPromise.then(function () {
                  Promise.resolve().then(function () {
                    cb()
                  })
                })
              }
            }
          }
         }
         window.__wpm__plugin.wpmjsScriptOnload(function () {
           window.System.__wpmjs__.setConfig(initConfig);
         })
       })()
     `)
     if (terserResult.error) {
       console.error("wpmHeader异常", terserResult.error)
       throw new Error()
     }
     return terserResult.code
   }
 }
 module.exports.loader = loaderPath
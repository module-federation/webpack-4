/**
 * 注释中wpm意思是通过http引入的远程包
 */
 const pluginName = "MFWebpack4"

 const { Template } = require("webpack")
 const { ConcatSource } = require("webpack-sources");
 const fs = require("fs")
 const path = require("path")
 const packageJson = require(path.join(process.cwd(), "package.json"))
 const emptyJs = require.resolve("./$empty.js")
 const VirtualModulesPlugin = require("webpack-virtual-modules")
 const Parser = require("webpack/lib/Parser");

 const importWpmLoaderPath = require.resolve("./import-wpm-loader")
 const entryInjectLoaderPath = require.resolve("./entry-inject-loader")
 const {minify} = require("terser");
 const webpack = require("webpack")
 const resolveRequest = require("wpmjs/src/utils/resolveRequest")
 const { stringifyHasFun, injectRefreshLoader, getUsedWpmPackages, getEntrysPath } = require("./utils");
 const DynamicEntryPlugin = require("webpack/lib/DynamicEntryPlugin")
 const {getInitConfigModule, modulePath: virtualInitConfigPath} = require("./virtualModule/initConfig")
 const {getSetSharedModule, modulePath: virtualSetSharedPath} = require("./virtualModule/setShared")
 const {getExposesModule, modulePath: virtualExposesPath} = require("./virtualModule/exposes")
 const {getSharedModule, modulePath: virtualLocalSharedPath} = require("./virtualModule/localShared")
 const resolveCwd = require("resolve-cwd")

 // https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js
 /**
  * import http
  */
 module.exports = class MFWebpack4 {
   constructor (options = {}) {
     this.options = Object.assign({
        remotes: {},
        name: "",
        remoteType: "",
        filename: "remoteEntry.js",
        library: {
          type: ""
        },
        shareScope: "",
        shared: {},
        exposes: {}
     }, options)
     if (!options.name) {
      throw new Error("name is required")
     }
     this.jsonpFunction = ""
     this.entryResources = new Set()
     this.wpmInitConfig = {}
     this.genWpmInitConfig()
   }
   
   apply(compiler) {
    compiler.options.output.jsonpFunction = `mfrename_webpackJsonp__${this.options.name}`
    compiler.__mfplugin__entryResources = this.entryResources
    this.watchEntryRecord(compiler)
    this.genVirtualModule(compiler)
    this.addEntry(compiler)
    
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
     this.convertRemotes(compiler)
     this.addLoader(compiler)
 
     compiler.resolverFactory.plugin('resolver normal', resolver => {
       this.interceptImport(resolver, compiler)
     });
     this.patchJsonpChunk(compiler)
     this.injectChunks(compiler)
   }

   genWpmInitConfig() {
    const options = this.options
    const remotes = options.remotes || {}
    const idUrlMap = {}
    const idDefineMap = {}
    Object.keys(remotes).forEach(key => {
      if (typeof remotes[key] !== "string") return
      const url = remotes[key].substr(remotes[key].indexOf("@") + 1)
      idUrlMap[key] = url
      idDefineMap[key] = {
        remoteType: "mf",
        name: key,
      }
    })
    const wpmInit = Object.assign({}, options.init, {
      idUrlMap,
      devIdUrlMap: options.devRemotes,
      idDefineMap,
    } || {})
    this.wpmInitConfig = wpmInit
   }

   /**
    * 将remotes解析成外部包
    */
   convertRemotes(compiler) {
    // 给resolve.alias默认值
    if (!compiler.options.resolve) {
      compiler.options.resolve = {}
    }
    if (!compiler.options.resolve.alias) {
      compiler.options.resolve.alias = {}
    }
    const { remotes, shared } = this.options
    Object.keys(remotes).forEach(key => {
      compiler.options.resolve.alias[key] = `wpmjs/$/${key}`
    })
    Object.keys(shared).forEach(key => {
      // 不存在的文件才能拦截
      compiler.options.resolve.alias[key] = `wpmjs/$/mfshare:${key}`
    })
    return remotes
   }
   
   injectChunks(compiler) {
     compiler.hooks.emit.tap(pluginName, compilation => {
       let entryChunks = []
       compilation.entrypoints.forEach(entry => {
        entryChunks = entryChunks.concat(entry.chunks)
       })
       // 给jsonp chunk插入依赖标识
       compilation.chunks.forEach(chunk => {
        if (entryChunks.indexOf(chunk) > -1) return
        this.eachJsFiles(chunk, (file) => {
          const source = new ConcatSource()
          const oldSourceText = compilation.assets[file].source()
          const wpmPackages = getUsedWpmPackages(oldSourceText)
          source.add(`window["__mfplugin__${this.options.name}"].chunkMap['${this.options.name}__${chunk.id}'] = ${JSON.stringify(wpmPackages)};\r\n`)
          source.add(oldSourceText)
          compilation.assets[file] = source
        })
       })

       // 修改remoteEntry入口最后生成的文件名
       entryChunks.forEach(chunk => {
        this.eachJsFiles(chunk, (file) => {
          if (file.indexOf("$_mfplugin_remoteEntry.js") > -1) {
            compilation.assets[file.replace("$_mfplugin_remoteEntry.js", this.options.filename)] = compilation.assets[file]
            // delete compilation.assets[file]
          }
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
         
         // 让jsonp chunk代码wait(用到的remotes packages)
         compilation.chunkTemplate.hooks.render.tap(
           pluginName,
           (modules, chunk) => {
             const source = new ConcatSource()
             const wpmPackages = getUsedWpmPackages(modules.source())
             source.add(`window["__mfplugin__${this.options.name}"].chunkMap['${this.options.name}__${chunk.id}'] = ${JSON.stringify(wpmPackages)};\r\n`)
             source.add(`window["__mfplugin__${this.options.name}"].wait(${JSON.stringify(wpmPackages)}).then(res => {\r\n`)
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
                 `window["__mfplugin__${this.options.name}"].wait(window["__mfplugin__${this.options.name}"].chunkMap["${this.options.name}__" + chunkId]).then(res => {`,
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
   interceptImport(resolver, compiler) {
     resolver.hooks.resolve.tapAsync(pluginName, (request, resolveContext, cb) => {
       const requestStr = request.request
       let [_, pkgName] = requestStr.match(/[\\/]+wpmjs[\\/]+\$[\\/]+(.+)/) || []
       if (/^https?:\/\//.test(requestStr)) {
        // http直接
        pkgName = requestStr
       }
       pkgName = pkgName || ""
       request.query = request.query || ""
       if (pkgName.startsWith("mfshare:")) {
        Object.keys(this.options.shared).filter(pkgname => {
          const issuer = path.join(request.context.issuer)
          if (request.query.indexOf("isLocalShareEntry=1" > -1) || new RegExp(`/node_modules/${pkgname}(/|$)`).test(issuer)) {
            // localShared的入口请求, 需要请求本地包
            // 包内部的request转入本地包
            cb(null, {
              path: resolveCwd(pkgName.replace("mfshare:", "")),
              request: "",
              query: request.query,
            })
            return
          }
        })
       }
       if (pkgName) {
        const query = request.query || ""
         cb(null, {
           path: emptyJs,
           request: "",
           query: `?${query.replace('?', "&")}&wpm&type=wpmPkg&mfName=${this.options.name}&pkgName=${encodeURIComponent(pkgName + query)}`,
         })
       } else {
         cb()
       }
     });

     compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
      factory.hooks.parser.for('javascript/auto').tap(pluginName, (parser, options) => {
        parser.hooks.importCall.tap(pluginName, (expression) => {
          if (!(expression.arguments || []).length) return
          const {string} = parser.evaluateExpression(expression.arguments[0]) || {}
          if (!string) return
          expression.arguments[0] = Parser.parse(`"${string}${string.indexOf("?") > -1 ? "&" : "?"}importType=async&mfName=${this.options.name}"`).body[0].expression
        });
      });
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
     const entryInjectMatch = function (moduleData) {
       return /\.([cm]js|[jt]sx?|flow)$/i.test(moduleData.resourceResolveData.path)
     };
     compiler.hooks.compilation.tap(
       pluginName,
       (compilation, { normalModuleFactory }) => {
         normalModuleFactory.hooks.afterResolve.tap(
           this.constructor.name,
           // Add react-refresh loader to process files that matches specified criteria
           (data) => {
             data = injectRefreshLoader(data, {match: entryInjectMatch}, entryInjectLoaderPath)
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
      const {name: pkgName} = resolveRequest(name)
      if (compilerAlias[pkgName]) {
        console.log(`[import-http-webpack-plugin]覆盖alias: ${compilerAlias[pkgName]} -> ${targetName}`)
      }
      compilerAlias[pkgName] = targetName
    })
   }

   eachJsFiles(chunk, cb) {
    chunk.files.forEach(file => {
      if (!(/^[^?]+\.js([?#]|$)/.test(file))) return
      cb(file)
    })
   }

   /**
    * 生成虚拟模块
    * shared
    * exposes
    * @param {*} compiler 
    */
   genVirtualModule(compiler) {
    new VirtualModulesPlugin({
      [virtualInitConfigPath]: getInitConfigModule(this),
    }).apply(compiler);
    new VirtualModulesPlugin({
      [virtualLocalSharedPath]: getSharedModule(this),
    }).apply(compiler)
    new VirtualModulesPlugin({
      [virtualSetSharedPath]: getSetSharedModule(this),
    }).apply(compiler)
    new VirtualModulesPlugin({
      [virtualExposesPath]: getExposesModule(this),
    }).apply(compiler);
   }

   addEntry(compiler) {
    new DynamicEntryPlugin(compiler.options.context, () => {
      return {
        "$_mfplugin_remoteEntry": virtualExposesPath
      }
    }).apply(compiler)
   }

   /**
    * 监听entry变化并记录
    */
   watchEntryRecord(compiler) {
      compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
        compilation.hooks.addEntry.tap(pluginName, (entry) => {
          getEntrysPath(entry, compiler.options.context).forEach(path => {
            this.entryResources.add(path)
          })
        })
      })
   }
 }
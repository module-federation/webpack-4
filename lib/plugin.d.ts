interface MFWebpack4Config {
  remotes?: {
    /**
     * 1. name: 'global@url'
     * 2. name: 'promise new Promise()'
     */
    [name: string]: string
  };
  name: string;
  // default is "remoteEntry.js"
  filename?: string;
  // default is "default"
  shareScope?: string;
  shared?: {
    [name: string]: {
      singleton?: boolean,
      eager?: boolean,
      requiredVersion?: string,
      version?: string;
      shareScope?: string;
    } | Array<string>;
  }
  exposes?: {
    [name: string]: string
  }
}

export = class MFWebpack4 {
  constructor(config: MFWebpack4Config)
}
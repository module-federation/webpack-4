## react-refresh-umd
一般用于ModuleFederation、wpmjs等微前端方案

react热更新必要条件:
1. react-refresh、react-dom、react单例
2. react-dom、react使用development版本
3. react-refresh代码在react-dom之前运行
4. 安装react热更新插件（@pmmmwh/react-refresh-webpack-plugin）


DEMO:
* https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/hot-refresh?file=app2%2Fsrc%2FApp2.jsx
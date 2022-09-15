## wpm
"Wpm (Micro front-end package manager)" integrates the packages of "umd, system, module federation" and other specifications, and can even reference a "share" to achieve the connection between "umd deps" and "mf share", and provides hooks that can uniformly manage url specifications

## characteristic
* fusion dependency（umd、system、mf）
* Out of the build environment（wpmjs sdk）
* Support webpack4 + webpack5

## examples
### 微前端热更新
https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/hot-refresh?file=app2%2Fsrc%2FApp2.jsx

### umd import module federation
https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/hot-refresh?file=app2%2Fsrc%2FApp2.jsx
# fontmin-client

字体压缩工具（客户端）

## Description
基于Fontmin实现的字体压缩工具，对比起Fontmin的官方应用，扩展了一下自己需要的功能

- 点击上传字体文件
- 拖拽txt文件进入输入框快速输入文本
- 生成字体时生成压缩的文本txt，方便之后迭代压缩的字体文件
- 支持自定义生成路径

## Development

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Project Setup

#### Install

```bash
$ npm install
```

#### Dev

```bash
$ npm run dev
```

#### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### Reference Documents

[electron-vite](https://cn-evite.netlify.app/guide/) + [electron](https://www.electronjs.org/zh/docs/latest/api/app) + [fontmin](https://github.com/ecomfe/fontmin)
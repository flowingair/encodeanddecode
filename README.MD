# Encode / Decode

一个完全在浏览器本地运行的字符串编码、解码、摘要和加密工具。界面支持系统深浅色主题、手机浏览器和算法动态配置。

当前支持 AES-GCM，以及基于 CryptoJS 的 AES、DES、TripleDES、RC4、Rabbit、Hash、HMAC 和 PBKDF2。第三方算法库会在首次使用对应算法时按需加载；超过 128 KiB 的输入自动交给 Worker，避免阻塞页面交互。

## 本地运行

项目没有构建步骤，但使用了原生 JavaScript 模块，需要通过 HTTP 服务打开：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000/`。输入、密钥和转换结果不会发送到服务器。

## 目录

- `styles/`：主题、组件和响应式样式。
- `scripts/`：UI、算法注册表、适配器、校验、错误和 Worker。
- `libs/`：第三方依赖及冻结的历史算法实现，应用代码只通过适配器调用。
- `tests/`：无需构建的浏览器算法测试。

`libs/` 内的内容不参与日常修改。升级或修复依赖前，请先阅读 `libs/README.md` 和其中的作用域说明。

## 浏览器范围

支持当前版本的 Chrome、Edge、Firefox、Safari，以及 Android/iOS 主流浏览器。不再支持 IE。VBScript 编码依赖 ActiveX，因此现代浏览器只提供解码功能。

## 安全说明

- Console 日志会对密钥、口令、IV 和盐进行脱敏。
- 敏感配置不会写入 `localStorage`，切换算法或清空时会从页面状态中清除。
- MD5、SHA-1、DES、TripleDES 和 RC4 仅用于兼容旧数据，不建议用于新系统。
- 本工具是通用转换工具，不替代经过审计的生产级密钥管理和密码学系统。

AES-GCM 使用浏览器 Web Crypto 实现。其输出会自动包含 IV、盐和口令派生参数；解密时仍需选择相同的密钥类型和密文编码格式。

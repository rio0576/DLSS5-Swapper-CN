# DLSS 5 Swapper 简体中文汉化

给 [DLSS5-Swapper](https://github.com/rakanki911/DLSS5-Swapper) 2.2.9 做的简体中文本地化。只改界面文字，不改动功能逻辑，也不碰游戏文件。

## 汉化效果

| 部分 | 原版 | 汉化后 |
|---|---|---|
| 主界面（主页 / 游戏 / 设置 / 历史 / 诊断…） | 中文词条只有 166/290，大半仍是英文 | **290/290，缺失 0** |
| **F8 游戏内面板**（调 DLSS 神经渲染的那个） | 全英文硬编码 | **全中文**，含 RenoDX / Feeder 的 31 个控件名与下拉选项 |
| 「叠加层」设置页 | 只有英文与阿拉伯文 | 中文 |
| 语言切换 | 只管主界面 | 主界面与 F8 面板**同步**切换 |

F8 面板汉化后的实际文字（抓取自运行中的面板窗口）：

```
DLSS 5 画质交换器 · 控制面板   预览   已连接
DLSS 神经渲染 开   游戏内状态角标
全局控制    结构强度   色调强度
角色遮罩    RenoDX 角色遮罩   角色 / 皮肤结构
NR 风格   模型 A · 默认   模型 B · 自然   模型 C · 电影感
更多 RenoDX 控制   整体强度   局部色调强度   漫反射白点（nit）
运动缩放 X 倍率   运动缩放 Y 倍率   NR 界面校正   启用超分（实验）   NR 预设   深度约定
```

## 为什么 F8 面板能汉化

F8 面板表面上在游戏里，实际上**是桌面上运行的 Swapper 用离屏 Chromium 窗口画好，再通过命名管道把画面推给游戏里的 ReShade 插件**。所以面板文字就是普通的 HTML/JS 字符串，改 JS 就能变中文，也不存在游戏引擎缺中文字形的问题。

由此也带来一个前提：**F8 面板生效时，DLSS 5 Swapper 必须保持运行**。这是原版设计，不是汉化引入的。

## 目录结构

```
修改计划.md                            汉化方案（结构分析、改动清单、打包方案）
review.md                              方案复核报告（含一条被实测证伪的方案）
validation.md                          构建与验证报告（含哈希与复现命令）
patch/dlss5-swapper-2.2.9-zh.patch     相对原版 2.2.9 的标准补丁（git apply 可用）
patched-files/                         同样的改动，按上游相对路径存放，可直接覆盖
build/portable.nsi                     复刻原版便携外壳的 NSIS 脚本
tools/                                 解包 / 校验辅助脚本
LICENSE-DLSS5-Swapper.txt              上游 MIT 许可证
```

本仓库**不包含**原始程序与构建产物（`work/`、`dist/` 已在 `.gitignore` 中忽略）。

## 使用方式

### 方式一：直接用构建好的便携版

文件结构与官方 portable 一致（解包到临时目录运行、退出后清理），双击即用。构建命令见下方「自己构建」。

### 方式二：对官方 2.2.9 打补丁

```powershell
# 1) 解出便携版的外壳与载荷
7z x DLSS5-Swapper-2.2.9-portable.exe -o extract -y
7z x "extract\`$PLUGINSDIR\app-64.7z" -o app -y

# 2) 解出前端代码
npx --yes @electron/asar extract app\resources\app.asar asar

# 3) 打补丁（在本仓库根目录执行）
git apply --directory=asar patch\dlss5-swapper-2.2.9-zh.patch

# 4) 回填并重新打包
npx --yes @electron/asar pack asar app\resources\app.asar
```

## 自己构建

```powershell
# 依赖：Node 22、7-Zip、NSIS 3（scoop install nsis，用户级即可）

# 1) 重建 app.asar
npx --yes @electron/asar pack work\asar work\app\resources\app.asar

# 2) 重建载荷（保持 135 文件 / 15 目录结构）
cd work\app
7z a -t7z -m0=lzma2 -mx=9 -ms=off ..\..\dist\app-64.7z *
cd ..\..

# 3) 重新封装便携 exe
#    （nsis7z.dll 从原包解出后放入 NSIS 的 Plugins\x86-unicode）
cd work\_build
makensis portable.nsi
```

## 自查

```powershell
node tools\i18n_audit.js work\asar\src\renderer            # 中英词条覆盖对比
node tools\control_names_check.js work\asar\src\renderer\overlay-i18n.js <上游 overlay 源码目录>
node tools\panel_dom_check.js work\asar\src\renderer       # 面板离屏渲染，中英各渲染一次
```

详细结论见 [validation.md](validation.md)：词条 290/290、控件名 31/31 覆盖、asar 重打包 121/121 文件哈希一致、交付 exe 内载荷哈希与已验证载荷一致、真实程序内 F8 面板实测中文、语言双向切换实测同步。

## 已知限制

| 项目 | 状态 | 原因 |
|---|---|---|
| 「聊天」页、「社区」页、设置里的「Community profile」区块 | 仍为英文 | 需要把 `chat.js` / `community.js` 的「英 / 阿」双表整体改成多语言表，工作量最大而收益最小，本次未做 |
| ReShade 插件列表的条目名与说明、F8 状态角标 `DLSS 5 On/Off` | 保持英文 | 由原生 ImGui 绘制，中文字形需额外注入字体贴图；**且这些字符串同时被插件用于精确匹配 RenoDX 内部 UI，改动会让桥接失效、F8 面板变砖** |
| F8 面板需要 Swapper 常驻后台 | 原版设计 | 面板画面由 Swapper 的离屏窗口推送 |

## 风险提示

- 叠加层用在反作弊网络游戏里本身就有风险（安装时程序会给出警告），这与汉化无关。
- 自行重打包的 exe 没有代码签名，可能被杀毒软件或 SmartScreen 拦下。
- 补丁只针对 2.2.9；官方发布新版本后需要重新适配。

## 许可

上游 DLSS5-Swapper 以 MIT 许可证发布，© 2026 Rakan Alkhaldi，全文见 [LICENSE-DLSS5-Swapper.txt](LICENSE-DLSS5-Swapper.txt)。`patched-files/` 与 `patch/` 中的内容是对上游文件的修改，属衍生作品，同样以 MIT 许可证发布。

本项目与 NVIDIA 无关，不含 NVIDIA 官方 SDK 或官方叠加层。

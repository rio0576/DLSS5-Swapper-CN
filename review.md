# 复核报告（Review）：DLSS 5 Swapper 中文界面修改计划

| 项 | 内容 |
|---|---|
| 复核对象 | `修改计划.md`（v2） |
| 被审版本 | v1 → v2（v1 有 7 处问题，v2 已全部修订） |
| 被审程序 | `DLSS5-Swapper-2.2.9-portable.exe`（SHA/尺寸见附录 A） |
| 复核日期 | 2026-10-08 |
| 复核方式 | 静态分析 + 二进制实测 + 上游源码比对（非人工目视，全部可复现） |
| **结论** | **PASS —— 同意整体方案，可推进下一步** |

---

## 1. 结论摘要

计划的核心判断成立，且经过独立验证，不是自证：

1. **可行路径正确**：F8 游戏内面板由运行中的 Swapper 用离屏 Chromium 渲染后推流进游戏，汉化只需改 JS，**不需要碰原生插件、不需要重编译 C++**。
2. **最重要的红线判断正确**：插件里那批英文控件名是拿来做**字符串精确匹配**的（`strcmp`），改了会让桥接拒绝工作。这一条从上游源码得到证实，避免了最危险的误操作。
3. **打包路径可行**：`app.asar` 重打包经实测**无损**（121/121 文件哈希一致），且不受完整性校验/`OnlyLoadAppFromAsar` fuse 限制。
4. **唯一被推翻的方案已撤销**：v1/v2 初稿中的"用 7z.sfx 重新封装"经实测**不成立**，已改为以 NSIS 为主路径。

放行建议：**可以推进**。推进后的第一步（M0）是一次需要你看着屏幕的运行时冒烟测试（见 §6）。

---

## 2. 检查项与判定

### 2.1 结构性检查（全部 PASS）

| # | 检查项 | 方法 | 证据 | 判定 |
|---|---|---|---|---|
| C-01 | 程序真实技术栈 | 解析 PE + 解包 | 外层 NSIS-3 Unicode 自解压（32 位），内含 `app-64.7z` → Electron 应用 + ReShade 插件 | PASS |
| C-02 | 英文文本分布是否盘点完整 | 全量解包 + 逐文件检索 | 前端字符串集中在 `app.asar`；F8 面板 246 条字面量 / 4 个文件；原生插件另有 20 余条 | PASS |
| C-03 | 主界面中文覆盖率是否量化 | 在 VM 中真实加载 `i18n.js`+`i18n-extra.js`+`feature-i18n.js` | 英文 284 条，中文实际覆盖 166 条（≈58%），缺 118 条 | PASS |
| C-04 | 语言开关是否真实存在 | 读 `renderer.js:1205/1277`、`main.js:504` | 有完整语言菜单，写入 `%APPDATA%\dlss5-swapper\library.json` 的 `lang` | PASS |
| C-05 | 语言能否传导到 F8 面板 | 读 `overlay-bridge.js` / `overlay-preload.js` | 现无语言通道，但 bridge/preload/IPC 三处均可扩展，改动面小 | PASS |
| C-06 | 面板是否真有 534px 宽度约束 | 读 `overlay-protocol.js:6` | `WIDTH = 534, MAX_HEIGHT = 1600`，中文更短，不溢出 | PASS |
| C-07 | 中文是否受字体限制 | 读 `overlay-panel.html` / `overlay-lab.css` | 面板由 Chromium 渲染（`font-family: Segoe UI`），回退到系统中文字体，无字形问题 | PASS |
| C-08 | 面板是否依赖 Swapper 常驻 | 读插件字符串 + bridge 架构 | 插件侧原文 "DLSS 5 Swapper must remain open. Waiting for the shared panel design…" | PASS |

### 2.2 上游源码比对（关键红线，全部 PASS）

| # | 检查项 | 方法 | 证据 | 判定 |
|---|---|---|---|---|
| C-09 | RenoDX 控件 ID ↔ 英文名对应关系 | 取 `overlay/renodx-ui-bridge.hpp` | `std::array<field, 15> fields` 顺序 = 计划表格；下发时 `"id": 101+i` | PASS |
| C-10 | Feeder 控件 ID ↔ 名称 | 取 `overlay/feeder-controls.hpp` | `schema()` 12 项；下发时 `"id": 301+i` → 301~312 | PASS |
| C-11 | 插件内英文标签能否直接改 | 同上 | `strcmp(f.label, label) == 0` 按标签匹配，且注释明确写"改名/删除只会丢那一个控件" | PASS（结论：不可改） |
| C-12 | 状态角标是否可中文化 | 取 `overlay/status-badge.hpp` | `DLSS 5 On/Off` 由 ImGui 原生绘制，无 CJK 字形 → 保留英文 | PASS（结论：不改） |
| C-13 | 上游是否公开、许可是否允许改 | GitHub API | `rakanki911/DLSS5-Swapper`，public，MIT，含 `overlay/` 源码 | PASS |

### 2.3 打包可行性实测（PASS，含 1 项撤销）

| # | 检查项 | 方法 | 证据 | 判定 |
|---|---|---|---|---|
| C-14 | `app.asar` 能否安全重打包 | 解析 asar 头部 | 仅 `files` 键，**无 `integrity`**；`unpacked=0`、`link=0`（121 文件 / 23 目录） | PASS |
| C-15 | 重打包是否无损 | `asar pack` → `asar extract` → 逐文件 SHA-256 比对 | 121/121 完全一致，missing/extra/different 均为 0 | PASS |
| C-16 | Electron 是否拦截改包 | `@electron/fuses read` | `EnableEmbeddedAsarIntegrityValidation = Disabled`、`OnlyLoadAppFromAsar = Disabled` | PASS |
| C-17 | 解包目录能否独立运行、配置是否共用 | 读 `main.js:346-350` + 检查 `%APPDATA%` | `runningPortable()` 仅用于错误文案；`%APPDATA%\dlss5-swapper` 已存在，与便携版同 profile | PASS |
| C-18 | 单文件重打包路径 | 实测 `7z.sfx` 与官方 Extra 包 | **7z.sfx 不含 RunProgram/config 支持，Extra 包无 sfx 模块** → 原"方案 A0"**撤销** | **FAIL → 已修订** |
| C-19 | NSIS 路径是否可行 | `scoop info nsis` + 检查 `nsis7z.dll` 导出 | NSIS 3.12 在 extras 桶（用户级安装）；`nsis7z.dll` 导出 `Extract`/`ExtractWithDetails` | PASS |
| C-20 | 程序会不会自动更新覆盖改动 | 检索 `autoUpdater`/`electron-updater` | 无相关代码；`main.js:1568` 注释原文 "nothing here updates itself" | PASS（风险等级由"高"降为"中"） |

### 2.4 未执行 / 未覆盖项（不影响放行）

| # | 项目 | 原因 | 归属 |
|---|---|---|---|
| N-01 | 解包目录的运行时冒烟测试（启动一次） | 复核时你**正在运行官方便携版**（6 个进程、主窗口标题 "DLSS 5 Swapper"），再起一个会撞单实例锁 | 推进后 M0 首步，需你在场 |
| N-02 | 游戏内 F8 面板实测 | 需要已装 ReShade 插件的游戏 | M1 完成后，验证项 5/6/9 |
| N-03 | 重打包后的 exe 被杀软行为 | 无法在离线环境模拟 | 交付时随包说明 |

---

## 3. v1 的问题清单（7 条，v2 全部修订）

| # | 问题 | 级别 | 影响 | 修订位置 |
|---|---|---|---|---|
| D-1 | 只提到改 `overlay-panel.html`，漏了 `index.html` | **高** | 主界面「叠加层」页的预览会仍为英文 | 计划 §4.1 第 6 项 |
| D-2 | 未说明面板语言有**两个来源**（游戏内走 IPC、主界面预览走 `window.i18n`） | **高** | 两处效果不一致，排查成本高 | 计划 §4.1 第 7 项 |
| D-3 | 切换语言后「叠加层」页不会自动刷新 | 中 | 需要退出该页再进才生效 | 计划 §4.1 第 8 项、验证项 11 |
| D-4 | 只写了"翻译字符串"，未声明**不得改动 id/class/data-\* 选择器** | **高** | 一旦改动，`overlay-live.js` 的控件绑定整块失效 | 计划 §4.2 红线行、验证项 9 |
| D-5 | "用 7z.sfx 重新封装"方案 | **高** | 按原方案执行会直接失败 | 计划 §5 方案 A0 已撤销，改走 NSIS |
| D-6 | 把"被官方更新覆盖"标为**高（必然发生）** | 低 | 与事实不符，误导风险判断 | 计划 §7，改为"中" |
| D-7 | 未设置"改包前先验证解包目录可运行"的前置步骤 | 中 | 出问题时分不清是环境还是补丁 | 计划 M0 + 本报告 N-01 |

---

## 4. 风险矩阵（复核后）

| 风险 | 等级 | 是否已缓解 |
|---|---|---|
| 误改插件二进制导致面板失效 | 高 → **已消除** | C-09~C-11 已确认禁区，方案明确禁止 |
| asar 重打包被校验拦截 | — → **已消除** | C-14~C-16 实测无拦截 |
| 重打包破坏文件 | — → **已消除** | C-15 无损验证通过 |
| 单文件重打包失败 | 中 | 方案 A0 撤销，改 NSIS；NSIS 3.12 与 nsis7z 均已确认可用（C-19） |
| 翻译改坏选择器/联动逻辑 | 中 | D-4 红线 + 验证项 6/9 覆盖 |
| 面板文案过长溢出 | 低 | 534px 宽，翻译限长约 18 全角字，实机核对 |
| 无签名 exe 被杀软拦截 | 中 | 交付说明；不做承诺 |
| 官方版本升级导致补丁失效 | 中 | 程序不自动更新（C-20）；补丁为纯文本替换，可快速重放 |

---

## 5. 范围建议（需你拍板）

计划 M4（社区页 + 聊天页多语言）**工作量最大、与实际痛点关联最小**（`community.js` 89 KB、`chat.js` 43 KB 的 EN/AR 双表要整体重构）。

复核建议：**M4 降级为可选**，先按 M1 → M5 → M2 → M3 把"F8 面板看得懂、主界面可用"做完，再决定要不要投入 M4。

---

## 6. 放行条件（Go / No-Go）

**判定：Go（通过）**，附一条前置动作：

* **M0（开工第一步，约 2 分钟，需要你操作）**：关闭当前正在运行的官方便携版 → 双击 `C:\Users\zengr\Documents\ChatGPT\DLSS5\work\app\DLSS 5 Swapper.exe` → 确认主界面与「叠加层」页正常加载 → 关闭。
  * 通过 → 直接进入 M1。
  * 不通过 → 说明解包目录不能独立运行，届时改为"只替换原 exe 内 payload 并重打包"路线（方案 A），不必回头重做分析。

---

## 附录 A：被审对象基本信息

| 项 | 值 |
|---|---|
| 被审 exe | `C:\Users\zengr\Documents\dlss5 swper\DLSS5-Swapper-2.2.9-portable.exe` |
| 尺寸 / 时间 | 258,133,136 字节 / 2026-10-05 11:42:56 |
| 外壳 | NSIS-3 Unicode，载入 `$PLUGINSDIR\app-64.7z`（257,674,340 字节） |
| 应用 | `DLSS 5 Swapper.exe` 188,868,096 字节（Electron，64 位） |
| `app.asar` | 3,134,230 字节，121 文件 / 23 目录 |
| 原生插件 | `resources\overlay\dlss5-lab-overlay.addon64`（879,616 字节） |
| 上游仓库 | `github.com/rakanki911/DLSS5-Swapper`（MIT，public，branch `main`） |

## 附录 B：复核证据可复现命令

```powershell
# b1. 拆外壳与 payload
7z x "…\DLSS5-Swapper-2.2.9-portable.exe" -o work\extract -y
7z x "work\extract\`$PLUGINSDIR\app-64.7z" -o work\app -y

# b2. 解 app.asar（本仓库自带脚本）
python tools\asar_extract.py work\app\resources\app.asar work\asar

# b3. 主界面中文覆盖率
node -e "…vm 加载 i18n.js / i18n-extra.js / feature-i18n.js…"     # 见报告 §2.1 C-03

# b4. asar 无损重打包验证
npx --yes @electron/asar pack work\asar work\_check\repacked.asar
npx --yes @electron/asar extract work\_check\repacked.asar work\_check\roundtrip
# 然后逐文件 SHA-256 比对 → 121/121 一致

# b5. Electron fuse 状态
npx --yes @electron/fuses read --app "work\app\DLSS 5 Swapper.exe"

# b6. 上游控件表（关键红线）
#   https://raw.githubusercontent.com/rakanki911/DLSS5-Swapper/main/overlay/renodx-ui-bridge.hpp
#   https://raw.githubusercontent.com/rakanki911/DLSS5-Swapper/main/overlay/feeder-controls.hpp

# b7. 7z.sfx 能力检验（证伪方案 A0）
rg -a -o ";!@Install@!UTF-8!|RunProgram|GUIMode" "C:\Users\zengr\scoop\apps\7zip\current\7z.sfx"   # 无匹配
```

## 附录 C：判定符号说明

| 符号 | 含义 |
|---|---|
| PASS | 检查通过，假设成立 |
| FAIL → 已修订 | 原计划该处有误，已修正并可继续 |
| 未执行 | 受环境限制未做，已指定归属阶段 |

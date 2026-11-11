# 每日练习

把口算、拼音、中译英三个训练工具整合为一个单页 PWA，面向幼小衔接 / 中小学阶段儿童，手机、平板优先。

## 功能

首页选择科目 → 选择难度 → 开始答题 → 结算 → 订正错题。三科各自保留原有题数、时限、难度、判题和订正逻辑：

| 科目 | 题数 | 时限 | 难度 |
|------|------|------|------|
| 口算 | 20 | 10 分钟 | 10/20/50 以内 × 进位/不进位，共 6 档 |
| 拼音 | 10 | 10 分钟 | 一二年级 1600 / 小学 3000 / 常用 3500 / 规范 8105，共 4 档 |
| 中译英 | 20 | 10 分钟 | 小学低年级 / 小学高年级 / 初中，共 3 档（看中文选英文） |

- 口算：九宫格数字键盘，支持退格、回车提交。
- 拼音：26 键全键盘，`v` 键输入 `ü`；声调可拖拽到元音上，也可点选声调再点元音；多音字任一标准读音均判对，支持轻声。
- 中译英：三选一，中文题目与选项均可朗读，显示中文拼音提示。
- 三科均支持错题订正，答对才进入下一题，订正不改变原成绩。
- 答题页左上角可二次确认退出测试，返回主界面，不保存本次成绩。
- 每科开始测试时播放 Ready → Go! 开场动画与语音，Go 播报结束后才开始计时。
- 结算时按成绩随机显示鼓励大字并语音播报（全对 / 错 1 题 / 错 2 题以上或超时）。
- 结算表演逐项揭晓：鼓励语弹入、成绩与按钮错峰出现；全对时同时绽放多朵烟花，覆盖在成绩条目上方，带光晕、闪光环和闪烁拖尾（约 4 秒）。
- 历史记录按科目分别保存，沿用原应用的 localStorage key，可与旧版记录共存。

## 文件结构

```
DailyPractice/
├── index.html                 # 统一外壳 + 三科逻辑（内联 CSS/JS）
├── data/
│   ├── pinyin-data.js         # 8105 字读音 + 4 档字表（来自 PinyinQuiz）
│   ├── pinyin-words.js        # 汉字常见组词（来自 PinyinQuiz）
│   └── en-words.js            # 课标英语词汇表（来自 WordQuiz2）
├── manifest.webmanifest       # PWA 元信息
├── sw.js                      # Service Worker（离线缓存）
├── Changelog.md               # 版本改动记录
├── icon.svg                   # 图标源文件
├── icon-192.png / icon-512.png / apple-touch-icon.png
├── favicon-32.png / favicon.ico
└── README.md
```

数据文件通过 `<script src>` 加载，`file://` 双击打开也能正常使用；PWA 相关能力（离线缓存、添加到主屏幕）需要 HTTP(S)。

## 本地预览

```bash
cd DailyPractice
python3 -m http.server 8000
# 打开 http://localhost:8000/
```

也可以直接双击 `index.html`。注意 `file://` 下 iOS Safari 可能在 7 天后清理 localStorage，长期使用建议部署后添加到主屏幕。

## 部署与更新

1. 把整个 `DailyPractice/` 目录推到 GitHub 仓库，在 Settings → Pages 选择分支根目录。
2. 用 Safari / Chrome 打开 GitHub Pages 链接，添加到主屏幕。
3. **每次发版需同步更新 `index.html` 的 `APP_VERSION` 与 `sw.js` 的 `CACHE_VERSION`**（两者保持一致，如 `1.0.1` / `v1.0.1`），否则旧 Service Worker 会继续命中旧缓存。
4. 新版本在用户下次启动时后台激活，再下一次启动生效。

## 版本管理

当前版本 **1.1.2**，显示在首页右下角，定义于 [index.html](index.html) 的 `APP_VERSION`。

版本号遵循 Semantic Versioning，完整规则见 [Changelog.md](Changelog.md)：

- **PATCH**：bug 修复和小优化。
- **MINOR**：功能变化。
- **MAJOR**：仅在明确要求时更新。

每次改动按上述规则确定新版本号，然后同步更新 `APP_VERSION`、`CACHE_VERSION`，并在 Changelog 记录改动。同一版本内的小迭代可用 `v1.1.2-2` 形式的缓存版本强制刷新，界面版本保持不变。

### 开发测试面板

首页底部有临时「测试」按钮，可模拟全对 / 错 1 题 / 错 2 题 / 超时四种结算，方便调试反馈效果；模拟结果不写入历史记录。确认效果后，把 [index.html](index.html) 中的 `DEV_PANEL` 改为 `false` 即可隐藏入口。

## 数据与旧版兼容

- 拼音数据由 PinyinQuiz 原样复制；英语词汇由 WordQuiz2 原样复制。更新数据时覆盖对应文件并自增缓存版本。
- 历史记录 key：`calcquiz_history`、`pinyinquiz_history`、`wordquiz2_history`。前三者与旧应用相同，部署在同一 GitHub Pages 域名下时旧记录会自动显示。旧口算记录使用 `difficulty` 字段，新版读取时兼容 `level || difficulty`。
- 原三个目录（CalcQuiz / PinyinQuiz / WordQuiz2）保持不动，可继续独立使用。

## 说明

- 英语模块保持 WordQuiz2 的「看中文选英文」方向，而非 WordQuiz 第一版需求文档中的「看英文选中文」。
- 拼音订正答错时沿用原版行为：保留已输入内容并抖动提示，便于修改，不直接显示正确答案。
- `index.html` 暴露了 `window.__daily` 测试钩子，供自动化测试读取当前会话状态，不影响正常使用。

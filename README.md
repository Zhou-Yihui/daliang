# 大凉语输入法安全版 · 全功能单文件

> 在地球从未出现过的大凉语系，也能 5 分钟拥有自己的「手写绘制 → 自动上传 → 云端打包 APK → 手机安装」完整输入法！

---

## 一、0-1 极速体验

| 步骤 | 耗时 | 操作 |
| ---- | ---- | ---- |
| 1 | 1 min | 把 `index.html` 保存到电脑，双击打开 |
| 2 | 1 min | 按提示填入 **GitHub Personal Access Token**（仅本地存储，永不进源码） |
| 3 | 2 min | 点右上角 ✍️「绘制新字符」→ 手写 → 填拉丁键 → 保存 |
| 4 | 1 min | 仓库自动出现 `table.json` + `chars/*.png` → Actions 自动生成 APK |
| 5 | 30 s | 手机打开 `https://github.com/你的用户名/DaliangIME/releases` 下载安装即可把大凉语键盘设为系统输入法 |

---

## 二、功能清单

✅ **纯前端单文件** → 无需服务器  
✅ **真 · 手写绘制**（Canvas）→ 自动生成 PNG 上传 GitHub  
✅ **实时候选栏** → 支持翻页、长按符号、九宫格/全键盘切换  
✅ **Token 安全机制** → 页面只存 `localStorage`，源码无敏感信息  
✅ **自动 CI/CD** → 推送即触发 GitHub Actions 签名 APK → Release 可直接装  
✅ **响应式 + 深色主题** → 手机/PC 均可绘制与输入  
✅ **调试友好** → 右下角 🔄 一键重载字符表；Console 全日志输出

---

## 三、文件结构

DaliangIME/ ← GitHub 仓库（自动创建） ├─ chars/ │ ├─ a_1683xxxx.png ← 你画的字符 │ └─ b_1684xxxx.png ├─ table.json ← 映射表 {a:[{url:...,filename:...},..]} ├─ .github/workflows/build.yml ← Actions 打包脚本 └─ releases/  └─ app-release.apk ← 每次推送自动生成，扫码即装

---

## 四、常见问题（FAQ）

| 现象 | 90% 原因 | 秒解 |
| ---- | -------- | ---- |
| 上传报错 `Bad credentials` | Token 错/已吊销 | 重新生成 → 页面刷新 → 粘贴新 Token |
| 候选栏空白 | 未同步到内存 | 按右下角 🔄 或 F5 刷新页面 |
| 键盘不出现候选 | 映射表没这条拉丁 | 先确认 `table.json` 有你刚上传的字母 → 再刷新 |
| Actions 打包失败 | 仓库没开 Actions 权限 | Settings → Actions → General → 选「允许所有」 |

---

## 五、本地二次开发

1. 改主题色  
   搜索 `--theme` 变量，随意换色即可。

2. 加新键盘布局  
   在 `LAYOUTS` 对象里新增数组，然后 `layout='你的新名字'`。

3. 调整笔刷默认粗细  
   `id="brushW"` 的 `value="6"` 改成想要的像素。

4. 替换 APK 模板  
   修改 `.github/workflows/build.yml` 里 `git clone` 的模板地址即可。

---

## 六、开源协议

MIT · 随意商用、魔改、再分发  
（留下作者彩蛋就更好了 😊）

---

Enjoy your 大凉语！

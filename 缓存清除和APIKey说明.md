# 缓存清除和API Key使用说明

## 🔍 问题分析

您遇到的错误主要有两个原因:

1. **浏览器缓存**: 浏览器缓存了旧版本的JavaScript文件
2. **API Key**: 首次使用需要输入API Key

## ✅ 解决方案

### 1. 清除浏览器缓存

**方法A: 强制刷新(推荐)**
- Windows: 按 `Ctrl + Shift + R`
- Mac: 按 `Cmd + Shift + R`

**方法B: 开发者工具清除**
1. 按 `F12` 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

**方法C: 使用无痕模式**
1. 打开新的无痕窗口
2. 访问 `http://localhost:8002`

**方法D: 手动清除**
1. 按 `Ctrl + Shift + Delete`
2. 选择"缓存的图片和文件"
3. 点击"清除数据"

### 2. API Key配置

应用已经实现了智能API Key管理系统,会按以下顺序尝试:

#### 自动获取流程:
1. ✅ **优先**: 尝试从后端API读取环境变量 `ZHIPU_API_KEY`
2. ✅ **后备**: 从浏览器localStorage读取之前保存的API Key
3. ✅ **最后**: 提示用户手动输入(通过prompt弹窗)

#### 使用步骤:

**首次使用:**
1. 点击"🌟 饮食推荐"按钮
2. 如果未找到API Key,会弹出输入框
3. 输入您的智谱AI API Key (格式: `id.secret`)
4. API Key会自动保存到浏览器localStorage
5. 下次使用时无需再次输入

**获取API Key:**
1. 访问 https://open.bigmodel.cn/
2. 注册并登录账号
3. 在控制台获取API Key

**查看已保存的API Key:**
1. 按 `F12` 打开开发者工具
2. 切换到"Console"标签
3. 输入: `localStorage.getItem('ZHIPU_API_KEY')`

**删除已保存的API Key:**
1. 按 `F12` 打开开发者工具
2. 切换到"Console"标签
3. 输入: `localStorage.removeItem('ZHIPU_API_KEY')`

## 🎯 验证修复

访问以下任一URL:
- `http://localhost:8002` (推荐,已更新版本号)
- `http://localhost:8002/index.html`

点击"🌐 中文"按钮切换语言,应该不再出现 `onLanguageChanged` 错误。

## 📝 版本说明

- **index.html**: 已更新版本号为 `?v=3`
- **app.js**:
  - ✅ 添加了 `onLanguageChanged()` 方法
  - ✅ 实现了完整的 `getApiKey()` 方法(支持prompt用户输入)
  - ✅ 添加了空指针安全检查
- **i18n.js**:
  - ✅ 添加了位置和天气的中英文翻译
  - ✅ 实现了位置下拉菜单的动态翻译

## 🚀 快速启动

```bash
cd C:\D\CAIE_tool\MyAIProduct\food
python -m http.server 8002
```

然后在浏览器访问: `http://localhost:8002`

按 `Ctrl + Shift + R` 强制刷新页面,清除缓存!

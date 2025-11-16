# 网站导航统一更新指南

## 标准导航结构

建议所有页面使用以下统一的导航结构：

```html
<nav class="nav container">
    <a href="index.html" class="logo">DigitSpanTest.online</a>
    <ul class="nav-links">
        <li><a href="game.html">Test Your Memory</a></li>
        <li><a href="working-memory.html">Working Memory</a></li>
        <li><a href="memory-training.html">Training</a></li>
        <li><a href="memory-techniques.html">Techniques</a></li>
        <li><a href="contact.html">Contact Us</a></li>
    </ul>
</nav>
```

## 页面更新统计

### 需要完全重新设计导航结构的页面

1. **index.html** - 需要简化复杂的单页导航，适配多页网站结构
2. **game.html** - 当前几乎没有导航，需要添加完整nav
3. **backward-game.html** - 当前几乎没有导航，需要添加完整nav
4. **backward-digit-span.html** - 导航结构不稳定，需要标准化

### 需要添加contact链接的页面

1. **working-memory.html** - 导航基本OK，只需添加contact链接
2. **memory-training.html** - 导航基本OK，只需添加contact链接

### 已有标准导航，只需添加contact链接的页面

1. **memory-techniques.html** - 已有统一结构，添加Contact Us链接
2. **contact.html** - 刚创建，已有正确导航结构

## 更新步骤指南

### 第一步：添加 contacted 链接到已有标准 navigation 的页面
```html
在 nav-links 列表末尾添加:
<li><a href="contact.html">Contact Us</a></li>
```

### 第二步：更新不完整的 navigation

对于使用 href="https://digitspantest.online/" 的页面，需要更改为相对链接：
- 将 `https://digitspantest.online/game.html` 替换为 `game.html`
- 保持链接顺序和格式一致

### 第三步：为缺少主要导航的页面添加完整nav

game.html 和 backward-game.html 需要添加 standard navigation header

## 验证清单

- [ ] 所有页面都有 contact.html 链接
- [ ] 导航链接格式统一(相对链接)
- [ ] 导航项目顺序一致
- [ ] CSS 类和格式统一
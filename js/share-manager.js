/**
 * ShareManager - 社交平台分享管理器
 *
 * 功能：
 * - Web Share API 集成
 * - 平台特定分享逻辑（X、Reddit、Facebook）
 * - 复制到剪贴板
 * - 本地保存/下载功能
 * - 分享UI叠加层
 *
 * 技术栈：
 * - Navigator.share() - 原生分享API
 * - Clipboard API - 剪贴板操作
 * - Canvas API - 图片导出
 */

class ShareManager {
  constructor() {
    this.cardGenerator = null;
    this.isGenerating = false;
  }

  /**
   * 初始化分享管理器
   */
  init(generatorInstance) {
    this.cardGenerator = generatorInstance;
    console.log('✅ ShareManager 初始化完成');
  }

  /**
   * 检查是否支持Web Share API
   */
  isWebShareSupported() {
    return (
      navigator.share &&
      typeof navigator.share === 'function' &&
      navigator.canShare
    );
  }

  /**
   * 检查是否可以分享文件
   */
  canShareFiles() {
    return this.isWebShareSupported() && navigator.canShare;
  }

  /**
   * 通用分享方法
   */
  async share(data) {
    try {
      if (this.isWebShareSupported() && data.files) {
        return await this.shareViaWebAPI(data);
      } else {
        return await this.shareViaFallback(data);
      }
    } catch (error) {
      console.error('分享失败:', error);
      throw new Error('分享失败，请重试');
    }
  }

  /**
   * 通过Web Share API分享
   */
  async shareViaWebAPI({ title, text, url, files }) {
    const shareData = {
      title,
      text,
      url
    };

    // 如果支持文件分享且有文件，则添加文件
    if (files && files.length > 0 && this.canShareFiles()) {
      try {
        shareData.files = files;
        await navigator.share(shareData);
        console.log('✅ 通过Web Share API分享成功');
        return true;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('用户取消了分享');
          return false;
        }
        throw error;
      }
    } else {
      // 如果不支持文件分享，则只分享文本和URL
      await navigator.share(shareData);
      console.log('✅ 通过Web Share API分享成功');
      return true;
    }
  }

  /**
   * 回退分享方法（不支持Web Share API时）
   */
  async shareViaFallback({ platform, text, url }) {
    let shareUrl = '';

    switch (platform) {
      case 'x':
        shareUrl = this.getXShareUrl(text, url);
        break;
      case 'reddit':
        shareUrl = this.getRedditShareUrl(text, url);
        break;
      case 'facebook':
        shareUrl = this.getFacebookShareUrl(url);
        break;
      case 'linkedin':
        shareUrl = this.getLinkedInShareUrl(url);
        break;
      default:
        throw new Error('不支持的分享平台');
    }

    // 打开分享URL
    window.open(shareUrl, '_blank', 'width=600,height=400');
    console.log(`✅ 通过 ${platform} 分享成功`);
    return true;
  }

  /**
   * 生成分享卡片
   */
  async generateShareCard(testData) {
    if (!this.cardGenerator) {
      throw new Error('ShareCardGenerator 未初始化');
    }

    if (this.isGenerating) {
      throw new Error('卡片正在生成中，请稍候');
    }

    this.isGenerating = true;

    try {
      // 设置数据
      this.cardGenerator.setData(testData);

      // 生成卡片
      const dataURL = await this.cardGenerator.generate();

      // 转换为Blob
      const blob = await this.dataURLToBlob(dataURL);

      return { dataURL, blob };
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * 分享到X (Twitter)
   */
  async shareToX(testData) {
    const { dataURL, blob } = await this.generateShareCard(testData);

    // 生成分享文本
    const shareText = this.generateShareText(testData);

    // 准备分享数据
    const shareData = {
      title: '我的数字广度测试成绩',
      text: shareText,
      url: 'https://digitspantest.online',
      files: [new File([blob], 'digit-span-test.png', { type: 'image/png' })]
    };

    try {
      await this.share(shareData);
      return true;
    } catch (error) {
      // 如果Web Share失败，回退到打开Twitter
      const twitterUrl = this.getXShareUrl(shareText, 'https://digitspantest.online');
      window.open(twitterUrl, '_blank', 'width=600,height=400');
      return true;
    }
  }

  /**
   * 分享到Reddit
   */
  async shareToReddit(testData) {
    const { dataURL, blob } = await this.generateShareCard(testData);

    const shareText = this.generateShareText(testData);
    const redditUrl = this.getRedditShareUrl(shareText, 'https://digitspantest.online');

    // 打开Reddit分享页面
    window.open(redditUrl, '_blank', 'width=600,height=400');
    return true;
  }

  /**
   * 分享到Facebook
   */
  async shareToFacebook(testData) {
    const { dataURL, blob } = await this.generateShareCard(testData);

    const facebookUrl = this.getFacebookShareUrl('https://digitspantest.online');

    // 打开Facebook分享页面
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    return true;
  }

  /**
   * 复制分享文本到剪贴板
   */
  async copyToClipboard(testData) {
    const shareText = this.generateShareText(testData);

    try {
      await navigator.clipboard.writeText(shareText);
      console.log('✅ 分享文本已复制到剪贴板');
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      throw new Error('复制失败，请手动复制');
    }
  }

  /**
   * 下载分享卡片
   */
  async downloadCard(testData) {
    const { dataURL } = await this.generateShareCard(testData);

    // 创建下载链接
    const link = document.createElement('a');
    link.download = `digit-span-test-${Date.now()}.png`;
    link.href = dataURL;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ 卡片下载开始');
    return true;
  }

  /**
   * 生成分享文本
   */
  generateShareText(testData) {
    const { score, scoreLevel, percentile } = testData;
    return `I scored ${score} points (${scoreLevel}) on the Digit Span Test, ranking in the top ${percentile}%! 🧠💪 Challenge your memory:`;
  }

  /**
   * 获取X (Twitter) 分享URL
   */
  getXShareUrl(text, url) {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  }

  /**
   * 获取Reddit分享URL
   */
  getRedditShareUrl(text, url) {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    return `https://www.reddit.com/submit?title=${encodedText}&url=${encodedUrl}`;
  }

  /**
   * 获取Facebook分享URL
   */
  getFacebookShareUrl(url) {
    const encodedUrl = encodeURIComponent(url);
    return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  }

  /**
   * 获取LinkedIn分享URL
   */
  getLinkedInShareUrl(url) {
    const encodedUrl = encodeURIComponent(url);
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  }

  /**
   * 将DataURL转换为Blob
   */
  async dataURLToBlob(dataURL) {
    const response = await fetch(dataURL);
    return await response.blob();
  }

  /**
   * 显示分享叠加层
   */
  showShareOverlay(testData) {
    // 创建叠加层
    const overlay = document.createElement('div');
    overlay.id = 'shareOverlay';
    overlay.className = 'share-overlay';

    // 设置样式
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;

    // 创建分享面板
    const panel = document.createElement('div');
    panel.className = 'share-panel';
    panel.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    `;

    panel.innerHTML = `
      <h2 style="text-align: center; color: #667eea; margin-bottom: 20px;">分享你的成绩</h2>
      <div class="share-buttons" style="display: flex; flex-direction: column; gap: 15px;">
        <button class="share-btn" data-platform="x" style="padding: 15px; border: none; border-radius: 10px; background: #1DA1F2; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">
          🐦 分享到 X (Twitter)
        </button>
        <button class="share-btn" data-platform="reddit" style="padding: 15px; border: none; border-radius: 10px; background: #FF4500; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">
          🔴 分享到 Reddit
        </button>
        <button class="share-btn" data-platform="facebook" style="padding: 15px; border: none; border-radius: 10px; background: #1877F2; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">
          📘 分享到 Facebook
        </button>
        <button class="share-btn" data-platform="copy" style="padding: 15px; border: none; border-radius: 10px; background: #10b981; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">
          📋 复制分享文本
        </button>
        <button class="share-btn" data-platform="download" style="padding: 15px; border: none; border-radius: 10px; background: #667eea; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">
          💾 下载卡片
        </button>
        <button class="share-btn" data-platform="cancel" style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 10px; background: white; color: #6b7280; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">
          取消
        </button>
      </div>
    `;

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .share-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
    `;
    document.head.appendChild(style);

    // 添加到DOM
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // 绑定事件
    this.bindShareEvents(overlay, panel, testData);

    return overlay;
  }

  /**
   * 绑定分享事件
   */
  bindShareEvents(overlay, panel, testData) {
    const buttons = panel.querySelectorAll('.share-btn');

    buttons.forEach(button => {
      button.addEventListener('click', async () => {
        const platform = button.dataset.platform;

        // 添加加载状态
        button.textContent = '处理中...';
        button.disabled = true;

        try {
          switch (platform) {
            case 'x':
              await this.shareToX(testData);
              break;
            case 'reddit':
              await this.shareToReddit(testData);
              break;
            case 'facebook':
              await this.shareToFacebook(testData);
              break;
            case 'copy':
              await this.copyToClipboard(testData);
              alert('分享文本已复制到剪贴板！');
              break;
            case 'download':
              await this.downloadCard(testData);
              alert('卡片下载已开始！');
              break;
            case 'cancel':
              this.hideShareOverlay(overlay);
              return;
          }

          // 成功后再关闭
          setTimeout(() => {
            this.hideShareOverlay(overlay);
          }, 1000);

        } catch (error) {
          alert('操作失败: ' + error.message);
          button.textContent = button.dataset.platform === 'x' ? '🐦 分享到 X (Twitter)' :
                               button.dataset.platform === 'reddit' ? '🔴 分享到 Reddit' :
                               button.dataset.platform === 'facebook' ? '📘 分享到 Facebook' :
                               button.dataset.platform === 'copy' ? '📋 复制分享文本' :
                               button.dataset.platform === 'download' ? '💾 下载卡片' : '取消';
          button.disabled = false;
        }
      });
    });

    // 点击背景关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hideShareOverlay(overlay);
      }
    });
  }

  /**
   * 隐藏分享叠加层
   */
  hideShareOverlay(overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 300);
  }
}

// 导出类
window.ShareManager = ShareManager;

console.log('✅ ShareManager 核心类已加载');

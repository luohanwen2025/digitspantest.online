/**
 * ShareTemplates - 分享卡片模板系统
 *
 * 功能：
 * - 多种卡片模板（经典、现代、极简等）
 * - 模板数据结构和配置
 * - 动态模板渲染
 * - 模板自定义选项
 * - 模板预览功能
 *
 * 模板类型：
 * - classic: 经典样式（默认）
 * - modern: 现代渐变
 * - minimal: 极简风格
 * - colorful: 彩色版本
 */

class ShareTemplates {
  constructor() {
    this.templates = new Map();
    this.defaultTemplate = 'classic';
    this.init();
  }

  /**
   * 初始化模板
   */
  init() {
    this.registerTemplate('classic', this.createClassicTemplate());
    this.registerTemplate('modern', this.createModernTemplate());
    this.registerTemplate('minimal', this.createMinimalTemplate());
    this.registerTemplate('colorful', this.createColorfulTemplate());
    console.log('✅ ShareTemplates 初始化完成');
  }

  /**
   * 注册模板
   */
  registerTemplate(name, config) {
    this.templates.set(name, config);
  }

  /**
   * 获取模板
   */
  getTemplate(name) {
    return this.templates.get(name) || this.templates.get(this.defaultTemplate);
  }

  /**
   * 获取所有模板名称
   */
  getAllTemplateNames() {
    return Array.from(this.templates.keys());
  }

  /**
   * 渲染模板
   */
  render(templateName, data) {
    const template = this.getTemplate(templateName);
    return template.renderer(data);
  }

  /**
   * 经典模板
   */
  createClassicTemplate() {
    return {
      name: 'classic',
      displayName: '经典样式',
      description: '传统设计，适合正式场合',
      config: {
        backgroundColor: '#ffffff',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        accentColor: '#10b981',
        textColor: '#1f2937',
        textSecondary: '#6b7280',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 12,
        shadow: true
      },
      renderer: (data) => {
        return {
          ...data,
          template: 'classic',
          customizations: {}
        };
      }
    };
  }

  /**
   * 现代模板
   */
  createModernTemplate() {
    return {
      name: 'modern',
      displayName: '现代风格',
      description: '渐变背景，活力四射',
      config: {
        backgroundColor: '#f0f4ff',
        primaryColor: '#8b5cf6',
        secondaryColor: '#ec4899',
        accentColor: '#f59e0b',
        textColor: '#1f2937',
        textSecondary: '#4b5563',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 20,
        shadow: true,
        gradient: ['#8b5cf6', '#ec4899']
      },
      renderer: (data) => {
        return {
          ...data,
          template: 'modern',
          customizations: {
            useGradient: true,
            gradientDirection: 'diagonal'
          }
        };
      }
    };
  }

  /**
   * 极简模板
   */
  createMinimalTemplate() {
    return {
      name: 'minimal',
      displayName: '极简风格',
      description: '简洁明了，突出重点',
      config: {
        backgroundColor: '#ffffff',
        primaryColor: '#000000',
        secondaryColor: '#666666',
        accentColor: '#000000',
        textColor: '#000000',
        textSecondary: '#666666',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 0,
        shadow: false,
        border: {
          color: '#e5e7eb',
          width: 2
        }
      },
      renderer: (data) => {
        return {
          ...data,
          template: 'minimal',
          customizations: {
            showBorder: true,
            showShadow: false
          }
        };
      }
    };
  }

  /**
   * 彩色模板
   */
  createColorfulTemplate() {
    return {
      name: 'colorful',
      displayName: '彩色版本',
      description: '色彩丰富，活泼有趣',
      config: {
        backgroundColor: '#fef3c7',
        primaryColor: '#f59e0b',
        secondaryColor: '#ef4444',
        accentColor: '#10b981',
        textColor: '#1f2937',
        textSecondary: '#6b7280',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 16,
        shadow: true,
        decorations: true
      },
      renderer: (data) => {
        return {
          ...data,
          template: 'colorful',
          customizations: {
            showDecorations: true,
            decorationColors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6']
          }
        };
      }
    };
  }

  /**
   * 创建自定义模板
   */
  createCustomTemplate(baseTemplateName, customizations) {
    const baseTemplate = this.getTemplate(baseTemplateName);
    if (!baseTemplate) {
      throw new Error(`基础模板 "${baseTemplateName}" 不存在`);
    }

    return {
      name: `custom-${Date.now()}`,
      displayName: '自定义模板',
      description: '基于现有模板的自定义版本',
      config: {
        ...baseTemplate.config,
        ...customizations
      },
      renderer: (data) => {
        return {
          ...data,
          template: 'custom',
          customizations: customizations
        };
      }
    };
  }

  /**
   * 验证模板配置
   */
  validateTemplate(template) {
    const required = ['name', 'config', 'renderer'];
    for (const field of required) {
      if (!template[field]) {
        return { valid: false, error: `缺少必要字段: ${field}` };
      }
    }

    if (typeof template.renderer !== 'function') {
      return { valid: false, error: 'renderer 必须是函数' };
    }

    return { valid: true };
  }

  /**
   * 获取模板预览信息
   */
  getTemplatePreview(templateName) {
    const template = this.getTemplate(templateName);
    if (!template) {
      return null;
    }

    return {
      name: template.name,
      displayName: template.displayName,
      description: template.description,
      config: template.config
    };
  }

  /**
   * 导出模板配置
   */
  exportTemplate(templateName) {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`模板 "${templateName}" 不存在`);
    }

    const exportData = {
      name: template.name,
      displayName: template.displayName,
      description: template.description,
      config: template.config
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导入模板配置
   */
  importTemplate(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      const template = {
        name: data.name || `imported-${Date.now()}`,
        displayName: data.displayName || '导入的模板',
        description: data.description || '',
        config: data.config || {},
        renderer: (data) => data // 默认渲染器
      };

      const validation = this.validateTemplate(template);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      this.registerTemplate(template.name, template);
      return template;

    } catch (error) {
      throw new Error(`导入模板失败: ${error.message}`);
    }
  }
}

/**
 * TemplateRenderer - 模板渲染器
 * 负责将模板配置应用到ShareCardGenerator
 */
class TemplateRenderer {
  constructor() {
    this.templates = new ShareTemplates();
  }

  /**
   * 使用指定模板生成卡片
   */
  async generateCard(templateName, data, generator) {
    // 获取模板配置
    const template = this.templates.getTemplate(templateName);
    if (!template) {
      throw new Error(`模板 "${templateName}" 不存在`);
    }

    // 应用模板配置到生成器
    this.applyTemplateToGenerator(generator, template);

    // 渲染数据
    const renderedData = template.renderer(data);

    // 设置数据并生成
    generator.setData(renderedData);

    return await generator.generate();
  }

  /**
   * 将模板配置应用到生成器
   */
  applyTemplateToGenerator(generator, template) {
    // 更新生成器的配置
    Object.assign(generator.config, template.config);

    // 应用自定义绘制逻辑
    if (template.customDraw) {
      generator.drawCard = template.customDraw.bind(generator);
    }
  }

  /**
   * 获取可用模板列表
   */
  getAvailableTemplates() {
    return this.templates.getAllTemplateNames().map(name => ({
      name,
      ...this.templates.getTemplatePreview(name)
    }));
  }

  /**
   * 预览模板效果
   */
  previewTemplate(templateName, sampleData) {
    const template = this.templates.getTemplate(templateName);
    if (!template) {
      throw new Error(`模板 "${templateName}" 不存在`);
    }

    const previewData = template.renderer(sampleData);
    return previewData;
  }
}

// 导出类
window.ShareTemplates = ShareTemplates;
window.TemplateRenderer = TemplateRenderer;

console.log('✅ ShareTemplates 核心类已加载');

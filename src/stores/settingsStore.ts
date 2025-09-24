//全局主题颜色和字体大小的设置

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

// 定义可选的字体大小，方便类型检查
type FontSize = 'small' | 'medium' | 'large';

export const useSettingsStore = defineStore('settings', () => {
  // 1. 从 localStorage 读取初始值，如果没有则使用默认值
  const themeColor = ref(localStorage.getItem('theme-color') || '#ff4b2b'); 
  const fontSize = ref<FontSize>((localStorage.getItem('font-size') as FontSize) || 'medium');

  // 获取根HTML元素，我们将在它上面修改CSS变量
  const rootEl = document.documentElement;

  // 2. 核心函数：根据当前状态，将CSS变量应用到根元素上
  const applySettings = () => {
    // 应用颜色
    rootEl.style.setProperty('--primary-color', themeColor.value);
    // 你可以根据主色调衍生出其他颜色，或者像渐变色这样保持固定
    // rootEl.style.setProperty('--primary-color-gradient', `linear-gradient(...)`);

    // 应用字体大小
    let baseSize = '16px';
    if (fontSize.value === 'small') baseSize = '14px';
    if (fontSize.value === 'large') baseSize = '18px';
    rootEl.style.setProperty('--font-size-base', baseSize);
  };

  // 3. 使用 watch 侦听器，当状态变化时自动应用新设置并持久化
  watch(themeColor, (newColor) => {
    localStorage.setItem('theme-color', newColor);
    applySettings(); // 重新应用所有设置
  });

  watch(fontSize, (newSize) => {
    localStorage.setItem('font-size', newSize);
    applySettings(); // 重新应用所有设置
  });
  
  // 4. 返回状态和方法，供组件使用
  return { themeColor, fontSize, applySettings };
});
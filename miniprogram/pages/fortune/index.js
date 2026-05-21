// pages/fortune/index.js
// 命理解析三合一（算卦 / 塔罗 / 星座）
Page({
  data: {
    // 是否已录入生辰
    hasBirthInfo: false,
    // 当前 Swiper 索引（0=算卦 1=塔罗 2=星座）
    currentTab: 0,
    // 加载状态
    loading: false,
    // 三模块结果
    bazi: null,
    tarot: null,
    zodiac: null
  },

  onLoad() {
    // TODO: 读取本地存储的生辰；无则展示 birth-picker
  },

  // 接收生辰输入组件回调
  onBirthSubmit(e) {
    // TODO: 保存生辰、调用云函数 bazi/hexagram/tarot/zodiac
  },

  // Swiper 切换
  onSwiperChange(e) {
    this.setData({ currentTab: e.detail.current });
  }
});

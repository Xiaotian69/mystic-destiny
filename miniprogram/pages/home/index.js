// pages/home/index.js
// 首页 / 今日运势
Page({
  data: {
    // 用户信息
    userInfo: null,
    // 今日日期信息
    todayInfo: {
      date: '',
      lunarDate: '',
      solarTerm: ''
    },
    // 综合评分（1-5）
    overallScore: 0,
    // 分项评分
    categoryScores: {
      career: 0,
      love: 0,
      wealth: 0,
      health: 0
    },
    // 今日宜
    todoList: [],
    // 今日忌
    avoidList: [],
    // 个性化建议（100 字以内）
    advice: ''
  },

  onLoad() {
    // TODO: 检查用户是否已录入生辰；若未录入，引导至命理页输入
    // TODO: 调用 dailyFortune 云函数获取今日运势
  },

  onShow() {
    // TODO: 每日首次进入时刷新
  },

  // 点击「查看完整命理报告」
  onTapFullReport() {
    wx.switchTab({ url: '/pages/fortune/index' });
  }
});

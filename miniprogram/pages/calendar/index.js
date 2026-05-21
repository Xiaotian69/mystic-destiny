// pages/calendar/index.js
// 运势日历
Page({
  data: {
    // 当前查看的年月
    year: 0,
    month: 0,
    // 当月每日运势数据
    days: []
  },

  onLoad() {
    const now = new Date();
    this.setData({
      year: now.getFullYear(),
      month: now.getMonth() + 1
    });
    // TODO: 调用 dailyFortune 云函数批量获取本月运势
  },

  // 切换月份
  onChangeMonth(e) {
    // TODO
  }
});

// components/fortune-score/index.js
// 运势评分组件：1-5 星
Component({
  properties: {
    // 分数 1-5
    score: {
      type: Number,
      value: 0
    },
    // 标签文字，如 "事业" "感情"
    label: {
      type: String,
      value: ''
    },
    // 尺寸 'small' | 'medium' | 'large'
    size: {
      type: String,
      value: 'medium'
    }
  },

  data: {
    starList: [1, 2, 3, 4, 5]
  }
});

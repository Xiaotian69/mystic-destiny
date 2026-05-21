// components/tarot-card/index.js
// 单张塔罗牌展示组件
Component({
  properties: {
    // 牌信息 { id, name, image, keywords, upright, reversed }
    card: {
      type: Object,
      value: null
    },
    // 是否逆位
    reversed: {
      type: Boolean,
      value: false
    },
    // 是否展示详情（false 时只显示牌面）
    showDetail: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    // 点击牌面 → 展开详情
    onTapCard() {
      this.triggerEvent('tap', { card: this.data.card, reversed: this.data.reversed });
    }
  }
});

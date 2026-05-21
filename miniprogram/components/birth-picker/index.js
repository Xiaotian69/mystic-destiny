// components/birth-picker/index.js
// 生辰输入组件：年/月/日/时辰 + 性别 + 出生地（可选）
Component({
  properties: {
    // 初始值（编辑场景使用）
    defaultValue: {
      type: Object,
      value: null
    }
  },

  data: {
    year: null,
    month: null,
    day: null,
    // 时辰 0-11（子=0 丑=1 ... 亥=11）
    shichen: 0,
    // 性别 'male' | 'female'
    gender: 'male',
    // 出生地（城市名），可选
    birthplace: ''
  },

  methods: {
    onYearChange(e) { this.setData({ year: e.detail.value }); },
    onMonthChange(e) { this.setData({ month: e.detail.value }); },
    onDayChange(e) { this.setData({ day: e.detail.value }); },
    onShichenChange(e) { this.setData({ shichen: e.detail.value }); },
    onGenderChange(e) { this.setData({ gender: e.detail.value }); },
    onBirthplaceChange(e) { this.setData({ birthplace: e.detail.value }); },

    // 提交回调 → 触发父组件 onBirthSubmit
    onSubmit() {
      const { year, month, day, shichen, gender, birthplace } = this.data;
      // TODO: 校验
      this.triggerEvent('submit', { year, month, day, shichen, gender, birthplace });
    }
  }
});

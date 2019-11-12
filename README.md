# 安装
拷贝 source/script/vue 文件夹到APPworker项目的 source/script 目录下

# 具体用例可以下载后在APPworker 编辑器内查看

# 基础用法

```javascript
// *.ui.js
var vue = require('vue');
new vue({
	data: {
		message: 'hello do_vue'
	},
	ui: ui,  // 必须传入 当前ui 对象
	el: ui('$'), // 程序挂载点, do_vue 会从这个组件开始, 如果该组件存在 getChildren 方法 就会往下遍历, 可以传一个数组. 例: [ui('layHeader'), ui('scrollView1')]
	// 内部过程(T_T是这样叫的吗?)
	methods: {
		clearMessage: function(){
			this.message = '';
		}
	},
	// 挂载完成会执行 created
	created: function(){
		this.message = 'hello do_vue!';
	},
	// 观察者
	watch: {
		message: function(newVal, oldVal){
			print(newVal, oldVal);
		}
	},
	// 计算属性
	computed: {
		calcMessage: function(){
			return this.message.split(' ').reverse().join(' ');
		}
	}
})
```

绑定需要在设计界面在对应的组件的 tag 里面填入信息
比如:

**绑定值到对应的属性

```javascript
	:text="message" :visible="!message == 'hide'"
```

**双向绑定
目前只支持 do_textField 和 do_textBox
```javascript
	v-model="message"
```

**绑定事件

```javascript
	@touch="message = 1"
```

或者

```javascript
	@touch="clearMessage"
```

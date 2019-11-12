var root = ui('$')
var page = sm('do_Page')
var app = sm('do_App')
var nf = sm('do_Notification')
var Vue = require('vue/vue')

page.on('back', function(){
	app.closePage()
})
var data = {
	message: 'hello do_vue',
	obj: {a: 'haha'}
}
var methods = {
	clearMessage: function(){
		this.message = '';
	}
}
var watch = {
	message: function(newVal, oldVal){
		print(newVal, oldVal);
	}
}
var vue = new Vue({
	data: data,
	methods: methods,
	el: root,
	ui: ui,
	watch: watch,
	created: function(){
		this.message = 'hello do_vue!';
		this.obj.a = 'this is an example!';
		this.$refs.do_Label_3.bgColor = "00000022"; // 还可以拿到组件实例
	},
	computed: {
		calcMessage: function(){
			return this.message.split(' ').reverse().join(' ');
		}
	}
})


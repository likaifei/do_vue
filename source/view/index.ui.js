var root = ui('$')
var page = sm('do_Page')
var app = sm('do_App')
var nf = sm('do_Notification')
var Vue = require('vue/vue')

page.on('back', function(){
	app.closePage()
})
var data = {
	name: 'abc',
	obj: {a:3},
	arr: [0,1,2],
	arr1: [{a: 1}, {a: 2}, 22]
}
var methods = {
	click: function(v){
		print(v)
		this.arr[2]++
	}
}
var watch = {
	"arr1[2]": function(val){
		print(val, 'watched')
	}
}
ui('arr11a').on('touch', function(){
	vue.arr = [5, 5, 5]
	vue.obj = {a: 99}
	print(JSON.stringify(vue.arr1))
	vue.arr1.unshift(52)
	print(JSON.stringify(vue.arr1))
})
var vue = new Vue({
	data: data,
	methods: methods,
	el: root,
	ui: ui,
	watch: watch,
	created: function(){
		this.$refs.do_TextField_3.on('textChanged', function(){
			print('text Change', vue.$refs.do_TextField_3.text)
		})
	},
	computed: {
		c: function(){
			return this.arr[1]
		}
	}
})


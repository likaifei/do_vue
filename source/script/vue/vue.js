// 如果el中包含scrollView 需要传 el 为数组, 把scrollView里面的layOut 加进去
// 因为scrollView 竟然没有getChilden 方法

var init = require('vue/init')
var Vue = function(option){
	this._init(option);
};
var fn = Vue.fn = Vue.prototype;
fn._init = function(options){
	var dataDef = {}
	this.$options = options
	dataDef.get = function (){ return this._data}
	var methodsDef = {}
	methodsDef.get = function(){return this._methods}
	this._data = options.data || {};
	this._methods = options.methods || {}
	this._el = options.el || {}
	this._watch = options.watch || {}
	this._computed = options.computed || {}
	Object.defineProperty(this, '$data', dataDef)
	Object.defineProperty(this, '$methods', methodsDef)
	init.call(this)
}


module.exports = Vue;
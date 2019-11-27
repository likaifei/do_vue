var hook = require('vue/hook')
var utils = require('vue/utils')
var log = utils.log
var extra = utils.extra
var format = utils.format
var Binder = utils.Binder

var popStack = utils.popStack
var pushStack = utils.pushStack
var stack = utils.stack

var uid = 0;
var init = function(){
	this._isVue = true
	this._uid = uid++
	this._binders = {}
	initData.call(this)
	initMethods.call(this)
	initComputed.call(this)
	initEl.call(this)
	initWatch.call(this)
	if(this.$options.created) this.$options.created.call(this)
}

function initData(){
	for(var k in this._data){
		proxy(this, '_data', k)
		hook(this, this._data, k, '')
	}
}
// 把深层属性暴露到第一层
function proxy(obj, scope, k){
	var proxy = {}
	proxy.get = function(){
//		log('get1', k)
		return obj[scope][k]
		};
	proxy.set = function(val){
		obj[scope][k] = val
	};
	Object.defineProperty(obj, k, proxy)
}
function initMethods(){
	var methods = this._methods
	for(var k in methods){
		this[k] = methods[k].bind(this)
	}
}
function initEl(){
	var vm = this
	var root = vm._el
	vm.$refs = {}
	var children;
	if(Array.isArray(root)){
		for(var i in root){
			getEl(root[i])
		}
	}else{
		getEl(root)
	}
	function getEl(root){
		if(!root.getChildren) return;
		var children = root.getChildren()
		for(var i in children){
			var el = vm.$options.ui(children[i])
			if(el){
				vm.$refs[el.id] = el
				bind(el)
			}
		}
	}
	function bind(el){
		var tags = el.tag.match(/(\S+?="[^"]+")/g)
		for(var tag in tags){
			var t = tags[tag].match(/(.+)="([^"]+)"/)
			var event = t[1]
			var data = t[2]
			log(event, data, 'init')
			if(/^@/.test(t)){
				// 绑定方法
				if(vm[data]){
					el.on(event.substr(1), (function(data){
						return function(arg1, arg2){
							vm[data](arg1, arg2)
						}})(data))
				}else{
					b(data)
					function b(data){
						var e = new Function("with(this){"+data+"}")
						el.on(event.substr(1), function(arg1, arg2){
							try{
								e.call(vm, arg1, arg2)
							}catch(e){
								log(e, 'eval javascript string error')
							}
						})
					}
				}
				
			}else if(/^:/.test(t)){
				// 绑定数据
				function cb1(el, key, fn){
					return function(){
						el[key] = fn()
					}
				}
				var fn = {uid: uid++, fn: cb1(el, event.substr(1), new Function(
						"with(this){return " + data + "}").bind(vm))
						}
				pushStack(fn)
				fn.fn()
				popStack()
			}else if(event == ('v-model')){
				// 双向绑定
				data = format(data)
				var type = el.getType();
				var action = t[2]?t[2]: 'change';
				var getter = t[3]?t[3]: 'text';
				var setter = t[4]?t[4]: 'text';
				
				if(type == 'do_TextField' || type == 'do_TextBox'){
					action = 'textChanged';
					getter = 'text';
					setter = 'text';
				}
				el.on(action, (function(data){ 
					return function(){
					log(data, el[getter], 'v-model')
					extra(vm, data, el[getter])
				}})(data))
				var fn = {uid: uid++, fn: 
					(function cb(el, k, data){
						return function(v){
							log(v, el[getter], 'v-model')
							el[k] = extra(vm, data)
						}
					})(el, setter, data)};
				pushStack(fn)
				fn.fn(extra(vm, data))
				popStack()
			}
		}
		getEl(el)
	}
	
}

function initWatch(){
	var vm = this
	var watch = vm._watch
	for(var key in watch){
		if(typeof watch[key] !== 'function')return;
		var data = format(key)
		var binder = vm._binders[data] = 
			vm._binders[data]?vm._binders[data]:(new Binder(extra(vm, data)))
		binder.push({uid: uid++, fn: watch[key].bind(vm)})
	}
}

function initComputed(){
	var vm = this
	var computed = vm._computed
	function p(obj, k){
		var proxy = {}
		proxy.get = function(){
			return obj['_computed'][k].call(vm)
			};
		proxy.set = function(val){
			print('computed methods can\'t set')
		};
		Object.defineProperty(obj, k, proxy)
	}
	function cb(key, fn){
		return function(){
			vm._binders[key].update(fn.call(vm))
		}
	}
	for(var key in computed){
		if(typeof computed[key] !== 'function')continue;
		p(vm, key)
		pushStack({uid: uid++, fn: cb(key, computed[key])})
		vm._binders[key] = new Binder(computed[key].call(vm))
		popStack()
	}
}

module.exports = init;
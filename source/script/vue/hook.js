var utils = require('vue/utils')
var log = utils.log
var extra = utils.extra
var format = utils.format
var Binder = utils.Binder

var popStack = utils.popStack
var pushStack = utils.pushStack
var stack = utils.stack

var arrayProto = Array.prototype
var arrayMethods = Object.create(arrayProto)
var methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
methodsToPatch.forEach(function (method) {
	  // cache original method
	  var original = arrayProto[method]
	  Object.defineProperty(arrayMethods, method, {
		  enumerable: false,
	      writable: true,
	      configurable: true,
		  value: function mutator () {
		var args = arguments
	    var result = original.apply(this, args)
	    var inserted
	    print('in array prop ' + method)
	    switch (method) {
	      case 'push':
	      case 'unshift':
	        inserted = args
	        break
	      case 'splice':
	        inserted = args.slice(2)
	        break
	    }
	    if (inserted){
	    	for(var i in this){
				hook(this._vm, this, i, this._key + '.')
			}
	    }
	    // 通知更新
	    update(this._vm, this._key, this)
	    return result
	  }})
	})

function hook(vm, obj, key, parentKey){
		if(obj[key] && obj[key]._isVue)return;
		var property = Object.getOwnPropertyDescriptor(obj, key)
		log(JSON.stringify(property), '', 'prop')
		if(property && property.configurable === false)return
		
		var getter = property && property.get
		var setter = property && property.set
		var val = obj[key]
		var p = {
		    enumerable: true,
		    configurable: false}
		p.get = function(){
			var value = getter ? getter.call(obj):val
			log('get2', key, 'get')
			if(stack.target){
				var binder = vm._binders[parentKey + key] = 
					vm._binders[parentKey + key]?vm._binders[parentKey + key]:(new Binder(value))
				binder.push(stack.target, true)
			}
			return val
			};
		p.set = function(newVal){
			var value = getter ? getter.call(obj) : val
			if(value === newVal || (newVal !== newVal && value !== value))return;
			if(setter){
				setter.call(obj, newVal)
			}else{
				val = newVal
			}
			log(val, 'set ' + parentKey + key, 'set')
			// 通知view更新
			
			update(vm, parentKey + key, val)
			if(typeof(val) == 'object'){
				if(Array.isArray(val)){
					val.__proto__ = arrayMethods
					val._key = parentKey + key
					val._vm = vm
				}
				for(var i in obj[key]){
					hook(vm, val, i, parentKey + key + '.')
				}
				
			}
		}
		Object.defineProperty(obj, key, p)
		if(typeof(obj[key]) == 'object'){
			if(Array.isArray(val)){
//				log('hook array', parentKey + key)
				val.__proto__ = arrayMethods
				val._key = parentKey + key
				val._vm = vm
			}
			for(var i in obj[key]){
				hook(vm, obj[key], i, parentKey + key + '.')
			}
		}
	}

function update(vm, key, val){
	if(vm._binders[key]){
		vm._binders[key].update(val)
	}
	var keys = Object.keys(vm._binders)
	for(var k in keys){
		if(keys[k].indexOf(key + '.') == 0){
			// 有子对象绑定, 挨个通知
			vm._binders[keys[k]].update(extra(val, keys[k].substr(key.length+1)))
		}
	}
}

module.exports = hook
var e = {}
e.log = function log(a, b, t){
//	return;  
//	if('init, get, prop, eval, v-model'.indexOf(t)>=0) return;
//	print(a, b)
}


e.format = function format(d){
	d = d.replace(/\[/g, '.');
	d = d.replace(/\]/g, '');
	return d
}
e.extra = function extra(v, k, _val){
	k = k.split('.')
	k = k.shift() + (k[0]?"['"+k.join("']['")+"']":'')
	var r = undefined;
	e.log("v['"+k+"']", '', 'eval')
	try{
		if(_val !== undefined){
			r = (new Function('with(this){return '+k+' = '+JSON.stringify(_val)+'}')).call(v)
		}else{
			r = (new Function("with(this){return "+k+"}")).call(v)
		}
	}catch(e1){
		e.log(e1.toString(), 'extra eval error', 'error')
	}
	return r
}
function Binder(d){
	this.data = d;
	this.arr = [];
}
Binder.prototype.push = function(obj, dontExe){
	// 去重
	if(this.arr.filter(function(item){
		return item.uid == obj.uid
	}).length > 0) return;
//	obj.fn.bind(this)
	this.arr.push(obj)
	// 不需要执行
	if(dontExe) return;
	obj.fn(this.data)
}
Binder.prototype.update = function(val){
	if(this.data === val) return;
	this.data = val
	for(var i in this.arr){
		pushStack(this.arr[i])
		this.arr[i].fn(this.data)
		popStack()
	}
}
e.Binder = Binder;

var stack = {
		arr: [],
		target: null
}
function pushStack(obj){
	stack.arr.push(obj)
	stack.target = obj
}
function popStack(){
	stack.arr.pop()
	stack.target = stack.arr[stack.arr.length - 1]
}
e.stack = stack
e.pushStack = pushStack
e.popStack = popStack


module.exports = e
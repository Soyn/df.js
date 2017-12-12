/**
 * Created by alnord on 04/24/2017.
 */
//var df = function() {};
/*
* This project is an utils libiary like underscore
* */
(function(){
	//#region: baseline setup
	var root = this;
	var previousDf = root.df;  // keep another df
	var ArrayProto = Array.prototype, ObjProto = Object.prototype,
			FuncProto = Function.prototype;
	var
			push = ArrayProto.push,
			slice = ArrayProto.slice,
			toString = ObjProto.toString,
			hasOwnProperty = ObjProto.hasOwnProperty;
	var
			nativeIsArray = Array.isArray,
			nativeKeys = Object.keys,
			nativeBind = FuncProto.bind,
			nativeCreate = Object.create;
	var Ctor = function() {};  // create object for internal usage

	function df(obj){
		"use strict";
		if (obj instanceof df){
			return obj;
		}
		if(!this instanceof df){
			return new df(obj);
		}
		this._wrapper = obj;
	}
// #end region

// #region collection function
// #end region
	df.isObject = function(obj) {
		var type = obj;
		return type === 'function' || type === 'object' && !!obj;
	}
	df.identify = function(s) {
		return s;
	}
	df.isFunction = function(f) {
		return typeof f == 'function' || false;
	}
	df.keys = function(obj) {
		if(!df.isObject(obj)) return [];
		if(nativeKeys) return nativeKeys(obj);
		var keys = [];

		for(var key in obj) keys.push(key);
		return keys;
	}
	var optimizeCb = function (func, context, argCount) {
		if (context === void 0) return func;
		switch (argCount === null ? 3 : argCount) {
			case 1:return function(value){
				func.call(context, value);
			}
			case 2: return function(value, other) {
				return func.call(context, value, other);
			}
			case 3: return function(value, index, collection) {
				return func.call(context, value, index, collection);
			}
			case 4: return function(accumulator, value, index, collection) {
				return func.call(context, accumulator, value, index, collection);
			}
		}
		return function() {
			"use strict";
			return func.apply(context, arguments);
		}
	}
	var createAssigner = function(keysFunc, undefinedOnly){
		return function(obj){
			var length = arguments.length;
			if(length < 2 || obj == null) return obj;
			for(var index = 1; index < length; ++index){
				var source = arguments[index], keys = keysFunc(source), l = keys.length;
				for(var i = 0; i < l; ++i){
					var key = keys[i];
					if(!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
				}
			}
			return obj;
		}
	}
	df.extendOwn = df.assign = createAssigner(df.keys)	
	df.isMatch = function(obj, attrs) {
		var keys = df.keys(attrs), length = keys.length;
		if(obj == null)	return !length;   // 为什么要返回!length
		var obj = Object(object);
		for(var i = 0; i < length; ++i){
			var key = keys[i];
			if (attrs[key] !== obj[key] || !(key in obj)) return false;
		}
		return true;
	}
	df.matcher = df.matches = function(attrs) {
		attrs = _.extendOwn({}, attrs);
		return function(obj){
			return df.isMatch(obj, attrs);
		}
	}
	var property = function(key){
		return function(obj){
			return obj == null ? void 0 : obj[key];
		}
	}
	df.property = property;
	var cb = function(value, context, argCount){
		"use strict";
		if (value === null) return df.identity(value);
		if (df.isFunction(value)) return optimizeCb(value, context, argCount);
		if (df.isObject(value)) return df.matcher(value);
		return df.property(value);
	}


	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = df;
		}
		exports.df = df;
	} else {
		root.df = df;
	}

	// thia is rest args factory function
	// in ES6 support rest args like this: (a, ...args) => { // do something }
	var restArgs = function(func, startIndex) {
		startIndex = startIndex == null ? func.length - 1 : +startIndex;
		return function(){
			"use strict";
			// fix rest args
			var restArgsLength = Math.max(arguments.length - startIndex, 0);
			var rest = Array(restArgsLength);

			for(var i = 0; i < restArgsLength; ++i) {
				rest[i] = arguments[startIndex + i];
			}

			switch (startIndex) {
				case 0: {
					return func.call(this, rest);
				}
				case 1: {
					return func.call(this, arguments[0], rest);
				}
				case 2: {
					return func.call(this, arguments[0], arguments[1], rest);
				}
			}

			var args = Array(startIndex + 1);

			for(var i = 0; i < startIndex; ++i) {
				args[i] = arguments[i];
			}

			args[startIndex] = rest;
			return func.apply(this, args);
		}
	}
	df.restArgs = restArgs;

	var baseCreate = function(prototype) {
		if(!prototype) return {};
		if(nativeCreate) return nativeCreate(prototype);
		Ctor.prototype = prototype;
		var result = new Ctor;
		Ctor.prototype = null;
		return result;
	}
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	var getLength = property('length')
	var isArrayLike = function(collection) {
		var length = getLength(collection)
		return typeof length === 'number' && length > 0 && length <= MAX_ARRAY_INDEX;
	}
	df.each = df.forEach = function(obj, iteratee, context) {
		iteratee = optimizeCb(iteratee, context)
		var i;
		if(isArrayLike(obj)){
			for(i = 0; i < obj.length; ++i){
				iteratee(obj[i], i, obj)
			}
		} else {
			var keys = df.keys(obj);
			var idx;
			for(i = 0; i < keys.length; ++i) {
				idx = keys[i];
				iteratee(obj[idx], idx, obj)
			}
		}
		return obj;  // for chain-style constructor
	}
	df.map = function(obj, iteratee, context){
		iteratee = cb(iteratee, context);
		console.log(iteratee);
		var keys = !isArrayLike(obj) && df.keys(obj);
		var length = (keys || obj).length;
		var result = Array(length);
		for(var i = 0; i < length; ++i){
			var currentKey = keys ? keys[i] : i;
			result[i] = iteratee(obj[currentKey], currentKey, obj)
		}
		return result;
	}
}.call(this));
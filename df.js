/**
 * Created by alnord on 04/24/2017.
 */
//var df = function() {};
/*
* This project is an utils libiary like underscore
* */
(function () {
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
	var Ctor = function () { };  // create object for internal usage

	function df(obj) {
		"use strict";
		if (obj instanceof df) {
			return obj;
		}
		if (!this instanceof df) {
			return new df(obj);
		}
		this._wrapper = obj;
	}
	// #end region
	// #region utility
	df.identity = function (value) {
		return value;
	}
	// #end
	df.isObject = function (obj) {
		var type = typeof obj;
		return type === 'function' || type === 'object' && !!obj;
	}
	df.now = Data.now() || function () {
		return new Date().getTime();
	}
	df.isFunction = function (f) {
		return typeof f == 'function' || false;
	}
	df.keys = function (obj) {
		if (!df.isObject(obj)) return [];
		if (nativeKeys) return nativeKeys(obj);
		var keys = [];

		for (var key in obj) keys.push(key);
		return keys;
	}
	var optimizeCb = function (func, context, argCount) {
		if (context === void 0) return func;
		switch (argCount === null ? 3 : argCount) {
			case 1: return function (value) {
				func.call(context, value);
			}
			case 2: return function (value, other) {
				return func.call(context, value, other);
			}
			case 3: return function (value, index, collection) {
				return func.call(context, value, index, collection);
			}
			case 4: return function (accumulator, value, index, collection) {
				return func.call(context, accumulator, value, index, collection);
			}
		}
		return function () {
			"use strict";
			return func.apply(context, arguments);
		}
	}
	var createAssigner = function (keysFunc, undefinedOnly) {
		return function (obj) {
			var length = arguments.length;
			if (length < 2 || obj == null) return obj;
			for (var index = 1; index < length; ++index) {
				var source = arguments[index], keys = keysFunc(source), l = keys.length;
				for (var i = 0; i < l; ++i) {
					var key = keys[i];
					if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
				}
			}
			return obj;
		}
	}
	df.extendOwn = df.assign = createAssigner(df.keys)
	df.isMatch = function (obj, attrs) {
		var keys = df.keys(attrs), length = keys.length;
		if (obj == null) return !length;   // 为什么要返回!length
		var obj = Object(object);
		for (var i = 0; i < length; ++i) {
			var key = keys[i];
			if (attrs[key] !== obj[key] || !(key in obj)) return false;
		}
		return true;
	}
	df.matcher = df.matches = function (attrs) {
		attrs = _.extendOwn({}, attrs);
		return function (obj) {
			return df.isMatch(obj, attrs);
		}
	}
	var property = function (key) {
		return function (obj) {
			return obj == null ? void 0 : obj[key];
		}
	}
	df.property = property;
	var cb = function (value, context, argCount) {
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
	var restArgs = function (func, startIndex) {
		startIndex = startIndex == null ? func.length - 1 : +startIndex;
		return function () {
			"use strict";
			// fix rest args
			var restArgsLength = Math.max(arguments.length - startIndex, 0);
			var rest = Array(restArgsLength);

			for (var i = 0; i < restArgsLength; ++i) {
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

			for (var i = 0; i < startIndex; ++i) {
				args[i] = arguments[i];
			}

			args[startIndex] = rest;
			return func.apply(this, args);
		}
	}
	df.restArgs = restArgs;

	var baseCreate = function (prototype) {
		if (!prototype) return {};
		if (nativeCreate) return nativeCreate(prototype);
		Ctor.prototype = prototype;
		var result = new Ctor;
		Ctor.prototype = null;
		return result;
	}
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	var getLength = property('length')
	var isArrayLike = function (collection) {
		var length = getLength(collection)
		return typeof length === 'number' && length > 0 && length <= MAX_ARRAY_INDEX;
	}
	df.each = df.forEach = function (obj, iteratee, context) {
		iteratee = optimizeCb(iteratee, context)
		var i;
		if (isArrayLike(obj)) {
			for (i = 0; i < obj.length; ++i) {
				iteratee(obj[i], i, obj)
			}
		} else {
			var keys = df.keys(obj);
			var idx;
			for (i = 0; i < keys.length; ++i) {
				idx = keys[i];
				iteratee(obj[idx], idx, obj)
			}
		}
		return obj;  // for chain-style constructor
	}
	df.map = function (obj, iteratee, context) {
		iteratee = cb(iteratee, context);
		var keys = !isArrayLike(obj) && df.keys(obj);
		var length = (keys || obj).length;
		var result = Array(length);
		for (var i = 0; i < length; ++i) {
			var currentKey = keys ? keys[i] : i;
			result[i] = iteratee(obj[currentKey], currentKey, obj)
		}
		return result;
	}

	// object functions
	df.has = function (obj, key) {
		return obj != null && hasOwnProperty.call(obj, key);
	}
	if (!df.isArguments(arguments)) {
		df.isArguments = function (obj) {
			return df.has(obj, 'callee');
		}
	}
	df.findKey = function (obj, predicate, context) {
		predicate = cb(predicate, context);
		var keys = df.keys(obj), key;
		for (var i = 0, length = keys.length; i < length; ++i) {
			key = keys[i];
			if (predicate(obj[key], key, obj)) return key;
		}
	}
	df.values = function (obj) {
		var keys = df.keys(obj);
		var length = keys.length;
		var values = Array(values);
		for (var i = 0; i < length; ++i) {
			var key = keys[i];
			values.push(obj[key]);
		}
		return values;
	}
	df.isBoolean = function (obj) {
		return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	}
	// object functions ends

	// #region collection function
	df.sortedIndex = function (array, obj, iteratee, context) {
		iteratee = cb(iteratee, context, 1);
		var low = 0, high = getLength(array);
		var value = iteratee(obj);
		while (low < high) {
			var mid = Math.floor((low + high) / 2);
			if (iteratee(mid) < value) {
				low = mid;
			} else {
				high = mid;
			}
		}
		return low;
	}
	// create a factory function to generate function
	var createIndexFinder = function (dir, predicateFind, sortedIndex) {
		return function (array, item, idx) {
			var i = 0, length = getLength(array);
			if (typeof idx == 'number') {
				if (dir > 0) {
					i = idx > 0 ? idx : Math.max(idx + length, i)
				} else {
					length = idx > 0 ? Math.min(idx + 1, length) : idx + length + 1;
				}
			} else {
				if (sortedIndex && idx && length) {
					idx = sortedIndex(array, item);
				}
			}

			if (item !== item) {
				idx = predicateFind(slice.call(array, i, length), df.isNaN);
				return idx > 0 ? idx + i : -1;
			}

			for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
				if (array[idx] === item) return idx;
			}
			return -1;
		}
	}
	df.filter = df.select = function (obj, predicate, context) {
		predicate = cb(predicate, context);
		var result = [];
		var length = getLength(obj);
		df.each(obj, function (value, index, list) {
			if (predicate(value, index, list)) result.push(value);
		})
		return result;
	}
	df.pluck = function (obj, key) {
		return df.map(obj, df.property(key));
	}

	df.find = df.detect = function (obj, predicate, context) {
		var key;
		if (!isArrayLike(obj)) {
			key = df.findKey(obj, predicate, context);
		} else {
			key = df.findIndex(obj, predicate, context);
		}
		if (key !== void 0 && key !== -1) return obj[key]
	}

	df.where = function (obj, attrs) {
		df.filter(obj, df.matcher(attrs));
	}
	df.findWhere = function (obj, attrs) {
		df.find(obj, df.matcher(attrs));
	}
	df.contains = df.includes = df.include = function (obj, item, fromIndex, guard) {
		if (!isArrayLike(obj)) obj = df.values(obj);
		// make fromIndex correctly
		if (typeof fromIndex !== 'number' || guard) {
			fromIndex = 0;
		}
		return df.indexof(obj, item, fromIndex) >= 0;
	}

	df.max = function (obj, iteratee, context) {
		var result = -Infinity, lastComputed = -Infinity,
			computed, value;
		if (iteratee == null && obj != null) {
			obj = isArrayLike(obj) ? obj : df.values(obj);
			for (var i = 0; i < obj.length; ++i) {
				value = obj[i];
				if (value > result) {
					result = obj[i];
				}
			}
		} else {
			iteratee = cb(iteratee, context);
			df.each(obj, function (value, index, list) {
				computed = iteratee(value, index, list);
				if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
					result = value;
					lastComputed = computed;
				}
			});
		}
		return result;
	}

	df.min = function (obj, iteratee, context) {
		var result = Infinity, lastComputed = Infinity,
			value, computed;
		if (iteratee == null && obj != null) {
			obj = isArrayLike(obj) ? obj : df.values(obj);
			for (var i = 0; i < obj.length; ++i) {
				value = obj[i];
				if (value < result) {
					result = value;
				}
			}
		} else {
			iteratee = cb(iteratee, context);
			df.each(obj, function (value, index, list) {
				computed = iteratee(value, index, list);
				if (computed < lastComputed || computed === Infinity && result === Infinity) {
					result = value;
					lastComputed = computed;
				}
			});
		}
		return result;
	}

	df.invoke = function (obj, method) {
		var args = slice.call(arguments, 2);
		var isFunc = df.isFunction(method);
		return df.map(obj, function (value) {
			var func = isFunc ? method : value[method];
			return func == null ? func : func.apply(value, args);
		})
	}
	// #end region
	// #Array function region
	function createPredicateIndexFinder(dir) {
		return function (array, predicate, context) {
			predicate = cb(predicate, context);
			var length = getLength(array);
			var index = dir > 0 ? 0 : length - 1;
			for (; index > 0 && index < length; index += dir) {
				if (predicate(array[index], index, array)) return index;
			}
		}
	}
	df.findIndex = createPredicateIndexFinder(1);
	df.findLastIndex = createPredicateIndexFinder(1);
	df.indexof = createIndexFinder(1, df.findIndex, df.sortedIndex);
	df.lastIndexOf = createIndexFinder(-1, df.findIndex, df.sortedIndex);
	df.initial = function (array, n, guard) {
		return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	}
	df.rest = df.drop = df.tail = function (array, n, guard) {
		return slice.call(array, n == null || guard ? 1 : n);
	}
	var flatten = function (input, shallow, strict, startIndex) {
		var output = [], idx = 0;
		for (var i = startIndex || 0; i < input.length; ++i) {
			var value = input[i];
			if (df.isArrayLike(value) && (df.isArray(value) || df.isArguments(obj))) {

				if (!shallow) value = flatten(value, shallow, strict);
				var j = 0, len = value.length;
				output.length += len;
				while (j < len) {
					output[idx++] = value[j++]
				}
			} else if (!strict) {
				output[idx] = value;
			}
		}
		return output;
	}
	df.flatten = function (array, shallow) {
		return flatten(array, shallow, false);
	}
	df.uniq = df.unique = function (array, isSorted, iteratee, context) {
		if (!df.isBoolean(isSorted)) {
			context = iteratee;
			iteratee = isSorted;
			isSorted = false;
		}
		if (iteratee != null) iteratee = cb(iteratee, context);
		var result = [];
		var seen = [];

		for (var i = 0, length = getLength(array); i < length; i++) {
			var value = array[i],
				computed = iteratee ? iteratee(value, i, array) : value;
			if (isSorted) {
				if (!i || seen !== computed) result.push(value);
				seen = computed;
			} else if (iteratee) {
				if (!df.contains(seen, computed)) {
					seen.push(computed);
					result.push(value);
				}
			} else if (!df.contains(result, value)) {
				result.push(value);
			}
		}
		return result;
	}
	df.union = function () {
		return df.uniq(flatten(arguments, true, true));
	}
	df.intersection = function (array) {
		var result = [];
		var argsLength = arguments.length;
		for (var i = 0; i < getLength(array); ++i) {
			var item = array[i];
			if (df.contains(result, item)) continue;
			var j;
			for (var j = 1; j < argsLength; ++j) {
				if (!df.contains(arguments[j], item)) break;
			}
			if (j === argsLength) result.push(item);
		}
		return result;
	}
	df.difference = function (array) {
		var rest = flatten(arguments, true, true, 1);
		return df.filter(array, function (value) {
			return !df.contains(rest, value);
		});
	}
	df.unzip = function (array) {
		var length = array && df.max(array, getLength).length || 0;
		var result = Array(length);
		for (var i = 0; i < length; ++i) {
			result[i] = df.pluck(array, i);
		}
		return result;
	}
	df.zip = function (array) {
		return df.unzip(arguments);
	}
	df.compact = function (array) {
		return df.filter(array, df.identity)
	}
	df.object = function (list, values) {
		var result = {};
		for (var i = 0; i < getLength(list); ++i) {
			if (values) {
				result[list[i]] = values[i];
			} else {
				result[list[i][0]] = list[i][1];
			}
		}
		return result;
	}
	df.range = function (start, stop, step) {
		if (stop == null) {
			stop = start || 0;
			start = 0;
		}
		if (!step) {
			step = stop < start ? -1 : 1;
		}
		var length = Math.max(Math.ceil((stop - start) / step), 0);
		var range = Array(length);

		for (var i = 0; i < length; i++ , start += step) {
			range[i] = start;
		}
		return range;
	}
	df.chunk = function (array, count) {
		if (count == null || count < 1) return [];

		var result = [];
		var i = 0, length = array.length;
		while (i < length) {
			result.push(slice.call(array, i, i += count));
		}
	}
	// #end region

	// #region Function Functions
	var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
		if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
		var self = baseCreate(sourceFunc.prototype);
		// for chain-style calling
		var result = sourceFunc.apply(self, args);
		if (df.isObject(result)) return result;
		return self;
	}
	df.bind = function (func, context) {
		if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (!df.isFunction(func)) throw new TypeError("Bind must be called on a function");
		var args = slice.call(arguments, 2);
		var bound = function () {
			return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
		}
		return bound;
	}
	df.bindAll = function (obj) {
		var i, length = arguments.length, key;
		if (length <= 1) throw new Error('bindAll must be passed function names');
		for (i = 0; i < length; ++i) {
			key = arguments[i];
			df.bind(obj[key], obj);
		}
		return obj;
	}
	df.partial = function (func, boundArgs) {
		var placeholder = df.partial.placeholder;
		var bound = function () {
			var position = 0, length = boundArgs.length;
			var args = Array(length);

			for (var i = 0; i < length; ++i) {
				args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
			}
			while (position < arguments.length) args.push(arguments[position++]);
			return executeBound(func, bound, this, this, args);
		}
		return bound;
	}
	df.memoize = function (func, hasher) {
		var memoize = function (key) {
			var cache = memoize.cache;
			var address = '' + (hasher ? hasher.apply(arguments) : key);
			if (!df.has(cache, address)) cache[address] = func.apply(this, arguments);
			return cache[address];
		}
		memoize.cache = {};
		return memoize;
	}
	df, delay = restArgs(function (func, wait, args) {
		return setTimeout(function () {
			func.apply(null, args);
		}, wait);
	});
	df.defer = df.partial(df.delay, _, 1);
	df.throttle = function (func, wait, options) {
		var timeout, context, args, result;
		var previous = 0;
		if (!options) options = {};

		var later = function () {
			previous = options.leading === false ? 0 : df.now();
			timeout = null;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		}

		var throttled = function () {
			var now = df.now();
			if (!previous && options.leading === false) previous = now;
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;

			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				previous = now;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		}
		throttled.cancel = function () {
			clearTimeout(timeout);
			previous = 0;
			timeout = context = args = null;
		}
		return throttled;
	}
	df.debounce = function (func, wait, immediate) {
		var timeout, result;
		var later = function (context, args) {
			timeout = null;
			if (args) result = func.apply(context, args);
		}

		var debounce = restArgs(function (args) {
			if (timeout) clearTimeout(timeout);
			if (immediate) {
				var callNow = !timeout;
				timeout = setTimeout(later, wait);
				if (callNow) result = func.apply(this, args);
			} else {
				result = df.delay(later, wait, this, args);
			}
			return result;
		});
		debounce.cancel = function () {
			clearTimeout(timeout);
			timeout = null;
		}
		return debounce;
	}
	df.compose = function () {
		var args = arguments;
		var start = args.length - 1;
		return function () {
			var i = start;
			var result = args[start].apply(this, arguments);
			while (i--) {
				result = args[i].apply(this, result);
			}
			return result;
		};
	}
	df.pipe = function () {
		var args = slice(this, arguments);
		return function () {
			var result = slice.apply(this, arguments);
			return args.reduce(function (result, func, index) {
				return func.apply(this, result);
			}, result);
		}
	}
	df.after = function (times, func) {
		return function () {
			if (--times < 1) {
				return func.apply(this, arguments);
			}
		};
	}
	df.before = function (times, func) {
		var memo;
		return function () {
			if (--times > 0) {
				memo = func.apply(this, arguments);
			}
			if (times <= 1) func = null;
			return memo;
		}
	}
	df.once = df.partial(df.before, 2);
	df.wrap = function(func, wrapper){
		return df.partial(wrapper, func);
	}
	// #end
}.call(this));

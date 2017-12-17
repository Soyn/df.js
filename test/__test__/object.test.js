/**
 * Created by apple on 17/12/2017.
 */

jest.dontMock('../../df.js');
var df = require('../../df');

test('Object function tests', () => {
	"use strict";
	var student = {
		name: 'wxj',
		age: 18,
	}
	expect(df.findKey(student, function(value, key, obj) {
		console.log(value)
		return value === 18;
	})).toBe('age')
})
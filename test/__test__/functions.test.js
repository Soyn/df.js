var df = require('../../df')

test("functions test", function() {
    "use strict";
    var mockFn = function(a, rest) {
      expect(a).toEqual(1);
      expect(rest).toEqual([2])
		};
    df.restArgs(mockFn)(1, 2)
    df.restArgs(function(a, b, args) {
      expect(a).toBe(1)
      expect(b).toBe(2)
      expect(args).toEqual([3, 4])
		}, 2)(1, 2, 3, 4)

    function add(init, rest) {
      var result = init;
      for(var i = 0; i < rest.length; ++i){
        result += rest[i];
      }
      return result;
		}

		expect(df.restArgs(add)(0, 1, 2, 3, 4, 5)).toBe(15);
})

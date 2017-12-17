/**
 * Created by apple on 09/12/2017.
 */

 jest.dontMock('../../df.js');
 var df = require('../../df');
 test('df collections tests', () => {
   var a = [1, 2, 3];
   var cb = function(elem, idx){
     return elem * 2;
   }
   expect(df.map(a, cb)).toEqual([2, 4, 6]);
   //expect(df.map(a)).toEqual([1, 2, 3])

   expect(df.indexof([1, 2, 3], 2)).toBe(1)
 })
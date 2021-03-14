var escape = require('../../');
var should = require('should');

describe('escape.test.js', function () {
  it('escape function normal string data', function () {
    var data = [
      [911, 911],
      ['hello world', 'hello world'],
      ['XXX1', 'XXX1']
    ];
    for (var i = 0, l = data.length; i < l; i++) {
      var item = data[i];
      escape.execute(item[0]).should.equal(item[1]);
    }
  });

  it('escape function innormal string data', function () {
    var data = [
      ['\'', '\\\''],
      ['"' , '\\\"'],
      ['\\', '\\\\'],
      ['\0', '\\0'],
      ['\n', '\\n'],
      ['\r', '\\r'],
      ['\b', '\\b'],
      ['\t', '\\t'],
      ['\x1a','\\Z'],
      ['hello\nworld', 'hello\\nworld']
    ];
    for (var i = 0, l = data.length; i < l; i++) {
      var item = data[i];
      escape.execute(item[0]).should.equal(item[1]);
    }
  });

  it('escape function html data', function () {
    var data = [
      ['<script>', '&lt;script&gt;'],
      ['"', '&quot;'],
    ];
    for (var i = 0, l = data.length; i < l; i++) {
      var item = data[i];
      escape.execute(item[0], {type: 'html'}).should.equal(item[1]);
    }
  })
});
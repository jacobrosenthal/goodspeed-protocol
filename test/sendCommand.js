var chai = require('chai');
var expect = chai.expect;
var bufferEqual = require('buffer-equal');

var EventEmitter = require('events').EventEmitter;

var sendData = require('..').sendData;


var cmd = new Buffer([0x50, 0x02, 0x06, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);

describe('receiveData', function () {

  var port;

  beforeEach(function () {
    port = new EventEmitter();

    port.write = function(data, callback){
      return callback(null, data);
    };

    port.insert = function(data){
      return this.emit('data', data);
    };
  });

  it('should send data without a return', function (done) {

    sendData(port, 10, cmd, false, function (err) {
      expect(err).to.not.be.ok;
      done();
    });
  });

  it('should return data', function (done) {
    var result = new Buffer([0x50, 0x02, 0x06, 0x00, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]);

    sendData(port, 10, cmd, true, function (err, data) {
      expect(err).to.not.be.ok;
      expect(data).to.exist;

      var match = bufferEqual(
          data,
          result.slice(4)
      );
      expect(match).to.equal(true);
      done();
    });
    port.insert(result);
  });

  it('should error if return data app mismatch', function (done) {
    var result = new Buffer([0x51, 0x02, 0x06, 0x00, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]);

    sendData(port, 10, cmd, true, function (err, packet) {
      expect(err).to.be.ok;
      expect(err.message).to.eq('Sending 50020600000102030405: response app and verb did not match');
      done();
    });
    port.insert(result);
  });

  it('should error if return data verb mismatch', function (done) {
    var result = new Buffer([0x50, 0x03, 0x06, 0x00, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]);

    sendData(port, 10, cmd, true, function (err, packet) {
      expect(err).to.be.ok;
      expect(err.message).to.eq('Sending 50020600000102030405: response app and verb did not match');
      done();
    });
    port.insert(result);
  });

  it('should timeout returning data', function (done) {
    sendData(port, 10, cmd, true, function (err, packet) {
      expect(err).to.be.ok;
      expect(err.message).to.eq('Sending 50020600000102030405: receiveData timeout after 10ms');
      done();
    });
  });

});

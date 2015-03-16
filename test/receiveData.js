var chai = require('chai');
var expect = chai.expect;
var bufferEqual = require('buffer-equal');
var es = require('event-stream');

var receiveData = require('..').receiveData;

var buffer = new Buffer([0x00, 0x7f, 0x16, 0x00, 0x68, 0x74, 0x74, 0x70, 0x3a, 0x2f, 0x2f, 0x67, 0x6f, 0x6f, 0x64, 0x66, 0x65, 0x74, 0x2e, 0x73, 0x66, 0x2e, 0x6e, 0x65, 0x74, 0x2f]);

describe('receiveData', function () {

  var port;

  beforeEach(function () {
    port = es.through(function (data) {
      this.emit('data', data);
    });
  });

  it('should timeout on no data', function (done) {
    receiveData(port, 10, function (err, data) {
      expect(err).to.be.ok;
      expect(err.message).to.eq('receiveData timeout after 10ms');
      done();
    });
  });

  it('should timeout on half data', function (done) {
    receiveData(port, 10, function (err, data) {
      expect(err).to.be.ok;
      expect(err.message).to.eq('receiveData timeout after 10ms');
      done();
    });
    port.write(buffer.slice(0,1));
  });

  it('should return with a packet', function (done) {
    receiveData(port, 10, function (err, packet) {
      expect(err).to.not.be.ok;
      expect(packet).to.exist;
      expect(packet.app).to.eq(0x00);
      expect(packet.verb).to.eq(0x7f);
      expect(packet.count).to.eq(0x16);

      var match = bufferEqual(
          packet.data,
          buffer.slice(4)
      );
      expect(match).to.equal(true);

      done();
    });
    port.write(buffer);
  });

  it('should receive a buffer in chunks', function (done) {
    receiveData(port, 10, function (err, packet) {
      expect(err).to.not.be.ok;
      expect(packet).to.exist;
      expect(packet.app).to.eq(0x00);
      expect(packet.verb).to.eq(0x7f);
      expect(packet.count).to.eq(0x16);

      var match = bufferEqual(
          packet.data,
          buffer.slice(4)
      );
      expect(match).to.equal(true);

      done();
    });
    port.write(buffer.slice(0,1));
    port.write(buffer.slice(1));
  });

  it('should receive a buffer in chunks2', function (done) {
    receiveData(port, 10, function (err, packet) {
      expect(err).to.not.be.ok;
      expect(packet).to.exist;
      expect(packet.app).to.eq(0x00);
      expect(packet.verb).to.eq(0x7f);
      expect(packet.count).to.eq(0x16);

      var match = bufferEqual(
          packet.data,
          buffer.slice(4)
      );
      expect(match).to.equal(true);

      done();
    });
    port.write(buffer.slice(0,10));
    port.write(buffer.slice(10));
  });

});

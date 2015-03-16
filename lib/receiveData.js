'use strict';

var when = require('when');
var nodefn = require('when/node');

module.exports = function (stream, timeout, cb) {
  return nodefn.bindCallback(when.promise(function(resolve, reject) {

    var timeoutId = null;
    var buffer = new Buffer(0);
    var packet;

    var handleChunk = function (data) {
      if(!packet){
        buffer = Buffer.concat([buffer, data]);

        if(buffer.length >= 4){
          packet = {
             app: buffer[0],
             verb: buffer[1],
             count: buffer[2] + (buffer[3] << 8),
             data: buffer.slice(4)
           };
        }

      }else{
        if(packet.data.length + data.length > packet.count){
          console.log('overflow');
          data = data.slice(0, packet.count-data.length);
        }
        packet.data = Buffer.concat([packet.data, data]);
      }

      if (packet && packet.data.length === packet.count) {
        return finished();
      }

    };
    var finished = function (err) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      stream.removeListener('data', handleChunk);

      if(err){ return reject(err); }

      return resolve(packet);
    };
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(function () {
        timeoutId = null;
        finished(new Error('receiveData timeout after ' + timeout + 'ms'));
      }, timeout);
    }
    stream.on('data', handleChunk);
  }), cb);
};

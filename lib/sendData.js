'use strict';

var when = require('when');
var nodefn = require('when/node');

var receiveData = require('./receiveData');

module.exports = function send(stream, timeout, data, response, cb){
  return nodefn.bindCallback(when.promise(function(resolve, reject) {
 
    stream.write(data, function (err) {
      var error;
      if (err) {
        error = new Error('Sending ' + data.toString('hex') + ': ' + err.message);
        return reject(error);
      }

      if(!response){
        return resolve();
      }

      receiveData(stream, timeout, function (err, packet) {
        if (err) {
          error = new Error('Sending ' + data.toString('hex') + ': ' + err.message);
          return reject(error);
        }

        if (packet.app !== data[0] || packet.verb !== data[1]) {
          error = new Error('Sending ' + data.toString('hex') + ': response app and verb did not match');
          return reject(error);
        }

        return resolve(packet.data);
      });
    });

  }), cb);
};

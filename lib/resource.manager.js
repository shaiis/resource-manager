var Q = require("q");

/**
 * @param resourceRetrieverFunction - function which retrieve the resource - MUST return a promise
 * @param timeout - timeout to wait for the resource in milliseconds
 * @constructor
 */
var ResourceManager = function (resourceRetrieverFunction, timeout) {
  this.resourceRetrieverFunction = resourceRetrieverFunction;
  this.timeout = timeout;
}

ResourceManager.prototype.state = null;
ResourceManager.prototype.result = null;
ResourceManager.prototype.promises = null;

/**
 * return a cached resource, if the resource is not ready add the waiting promise to a queue
 * to be resolved when the resource is received.
 * If the retrieve of the resource fail, all the waiting promises are rejected.
 * Calling this function after 'error' state will cause another try of getting the resource
 * @returns {Promise.promise}
 */
ResourceManager.prototype.getResource = function () {
  var deferred = Q.defer();

  if (this.state == null || this.state == 'failed') {
    this.state = 'waiting';
    this.promises = [];

    this.resourceRetrieverFunction.apply().timeout(this.timeout).
      then(function (res) {
        this.result = res;
        deferred.resolve(this.result);
        this.promises.forEach(function (promise) {
          promise.resolve(this.result);
        }.bind(this))
        this.state = 'done';
      }.bind(this)).
      fail(function (err) {
        this.state = 'failed';
        deferred.reject(err);
        this.promises.forEach(function (promise) {
          promise.reject(err);
        })
      }.bind(this))
  }
  else if (this.state == 'waiting') {
    this.promises.push(deferred);
  }
  else {
    deferred.resolve(this.result);
  }
  return deferred.promise;
}

module.exports.ResourceManager = ResourceManager;





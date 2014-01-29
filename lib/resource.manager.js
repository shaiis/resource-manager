var Q = require("q");

/**
 * @param resourceRetrieverFunction - function which retrieve the resource - MUST return a promise
 * @param timeout - timeout to wait for the resource in milliseconds
 * @param metadata - optional - metadata of the resource (default: {})
 * @param noRetry - optional - if set to true no retry next time after error state (default: false)
 * @constructor
 */
var ResourceManager = function (resourceRetrieverFunction, timeout, metadata, noRetry) {
  this.resourceRetrieverFunction = resourceRetrieverFunction;
  this.timeout = timeout;
  this.metadata = metadata || {};
  this.noRetry = noRetry || false;
}

ResourceManager.prototype.state = null;
ResourceManager.prototype.result = null;
ResourceManager.prototype.waitingPromises = null;

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
    this.waitingPromises = [];

    this.resourceRetrieverFunction.apply().timeout(this.timeout).
      then(function (res) {
        this.result = res;
        deferred.resolve(this.result);
        this.waitingPromises.forEach(function (promise) {
          promise.resolve(this.result);
        }.bind(this))
        this.waitingPromises = [];
        this.state = 'done';
      }.bind(this)).
      fail(function (err) {
        if (this.noRetry) {
          this.state = 'reject';
          this.result = err;
        }
        else {
          this.state = 'failed';
        }

        deferred.reject(err);
        this.waitingPromises.forEach(function (promise) {
          promise.reject(err);
        })
        this.waitingPromises = [];
      }.bind(this))
  }
  else if (this.state == 'waiting') {
    this.waitingPromises.push(deferred);
  }
  else if (this.state = 'reject') {
    deferred.reject(this.result);
  }
  else {
    deferred.resolve(this.result);
  }
  return deferred.promise;
}

ResourceManager.prototype.getMetadata = function() {
  return this.metadata;
}

module.exports.ResourceManager = ResourceManager;





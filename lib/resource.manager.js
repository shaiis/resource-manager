var Q = require("q");

var ResourceManager = function(resourceRetrieverFunction, timeout) {
  this.resourceRetrieverFunction = resourceRetrieverFunction;
  this.timeout = timeout;
}

ResourceManager.prototype.state = null;
ResourceManager.prototype.result = null;
ResourceManager.prototype.promises = null;

ResourceManager.prototype.getResource = function(){
  var deferred = Q.defer();
  if ( this.state == null || this.state == 'failed') {
    this.state='waiting';
    this.promises=[];
    this.resourceRetrieverFunction.apply().timeout(this.timeout).
      then(function(res) {
        this.result = res;
        deferred.resolve(this.result);
        this.promises.forEach(function(promise) {
          promise.resolve(this.result);
        }.bind(this))
        this.state='done';
      }.bind(this)).
      fail(function(err) {
        this.state = 'failed';
        deferred.reject(err);
        this.promises.forEach(function(promise) {
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





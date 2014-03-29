var ResourceManager = require('./../lib/resource.manager').ResourceManager;
var Q = require('q');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

function getSomething(timeout) {
  var deferred = Q.defer();
  setTimeout(function() {
    deferred.resolve('something');
  }, timeout);

  return deferred.promise;
}

describe('ResourceManager Test', function(){
  it('get resource - ok', function() {
    var resourceManager = new ResourceManager(getSomething.bind(this,100),200,false);
    return resourceManager.getResource().should.become('something');
  })

  it('get resource - bad - timeout', function() {
    var resourceManager = new ResourceManager(getSomething.bind(this,100),50,false);
    var promise = resourceManager.getResource();
    return promise.should.be.rejected;
  })

  it('get resource - bad - timeout - no retry', function() {
    var resourceManager = new ResourceManager(getSomething.bind(this,100),50,false);
    var promise = resourceManager.getResource().
      then(function() {
        return resourceManager.getResource();
      }).
      fail(function() {
        return resourceManager.getResource();
      });
    return promise.should.be.rejected;
  })

  it('get resource - fail on timeout - retry - ok', function() {
    var resourceManager = new ResourceManager(getSomething.bind(this,100),50,true);
    var promise = resourceManager.getResource().
      then(function() {
        return Q.reject(new Error('Should fail'));
      },
      function() {
        resourceManager.setTimeout(200);
        return resourceManager.getResource();
      });
    return promise.should.become('something');;
  })

  it('get resource twice - sync', function() {
    var resourceManager = new ResourceManager(getSomething.bind(this,50),100,false);
    return resourceManager.getResource().
      then(function(res) {
        res.should.be.equal('something');
        return resourceManager.getResource();
      })
  })


  it('get resource few times async - ok', function() {
    var resourceManager = new ResourceManager(getSomething.bind(this,100),200,false);
    return Q.all(
      resourceManager.getResource(),
      resourceManager.getResource(),
      resourceManager.getResource(),
      resourceManager.getResource(),
      resourceManager.getResource(),
      resourceManager.getResource()
    )
  })

  it('get resource few times async - fail', function() {
    var resourceManager = new ResourceManager(getSomething.bind(this,100),50,false);
    return Q.all(
      resourceManager.getResource(),
      resourceManager.getResource(),
      resourceManager.getResource(),
      resourceManager.getResource(),
      resourceManager.getResource(),
      resourceManager.getResource()
    ).should.be.rejected;
  })

  it('getTimeout check', function() {
    var resourceManager = new ResourceManager(getSomething.bind(this,100),50,false);
    resourceManager.getTimeout().should.be.equal(50);
  })
})
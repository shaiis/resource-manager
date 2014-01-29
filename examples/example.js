var Q = require("q");
var _ = require("underscore");
var ResourceManager = require('./../lib/resource.manager').ResourceManager;

function getConnection() {
  var def = Q.defer();
  setTimeout(function() { def.resolve(123)}, 2000);
//  setTimeout(function() { def.reject(new Error('bad'))}, 2000);
  return def.promise;
}

var resourceManager = new ResourceManager(getConnection,3000);

var arr = [1,2,3,4];
console.log('before');
var allPromises = _.map(arr, function (num) {
  return resourceManager.getResource();
})


Q.all(allPromises).then( function(n) {
 n.forEach(function(p) {
 console.log(p)
 })

 }).fail(function(err) {
    console.log(err);
 })

console.log("Done");
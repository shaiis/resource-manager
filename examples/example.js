var Q = require("q");
var _ = require("underscore");
var ResourceManager = require('./../lib/resource.manager').ResourceManager;

function getDummyConnection() {
  var def = Q.defer();
  setTimeout(function() { def.resolve("Connection OK")}, 2000);
//  setTimeout(function() { def.reject(new Error('Failed To connect'))}, 2000);
  return def.promise;
}

var resourceManager = new ResourceManager(getDummyConnection,3000);

var arr = [1,2,3,4];
console.log('Start');
var allPromises = _.map(arr, function (num) {
  return resourceManager.getResource();
})


Q.all(allPromises).then( function(connections) {
 connections.forEach(function(connection) {
 console.log(connection)
 })

 }).fail(function(err) {
    console.log(err);
 })

console.log("Done");
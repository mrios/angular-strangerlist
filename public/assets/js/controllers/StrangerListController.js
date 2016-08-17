// angular-strangerlist/controllers/StrangerListController.js

  mainApp
    
    .controller('StrangerListController', function($scope, $http) {
      
      var strangerlist = this;

      strangerlist.currentItem = null;
      strangerlist.editedItem = {};

      strangerlist.items = [];

      strangerlist.init = function() {
        strangerlist.loadItems();
      }

      strangerlist.loadItems = function() {
        $http.get('/api/items').success(function(data) {
            $scope.items = data;
        });
      }

      strangerlist.reloadItems = function(items) {
        $scope.items = items;
      }

      strangerlist.sortableOptions = {
        // called after a node is dropped
        stop: function(e, ui) {
          strangerlist.updateItems();
        }
      };

      strangerlist.updateItems = function() {
        $http.put('/api/items', $scope.items)

          .then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            console.log("server response", response)
              
          }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("Error saving items", response)
          });
      }

      strangerlist.setCurrentItem = function(item) {
        strangerlist.currentItem = item;
        strangerlist.editedItem = angular.copy(strangerlist.currentItem);
      }

      strangerlist.updateCancel = function() {
        strangerlist.resetForm(); 
      }

      strangerlist.resetForm = function() {
        strangerlist.currentItem = null;
        strangerlist.editedItem = {};

        strangerlist.detailsForm = $setPristine();
        strangerlist.detailsForm = $setUntouched();
      }

      strangerlist.generateId = function() {
        return '_' + Math.random().toString(36).substr(2,9);
      }

      strangerlist.createItem = function() {
        var newItem = angular.copy(strangerlist.editedItem);
        newItem.id = strangerlist.generateId();

        strangerlist.submit();
        strangerlist.resetForm();
      }

      strangerlist.init();

    });
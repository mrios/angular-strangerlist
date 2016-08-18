// angular-strangerlist/controllers/StrangerListController.js

  mainApp
    
    .controller('StrangerListController', ['$scope', '$http', '$modal', 'Upload', '$location', '$anchorScroll', function($scope, $http, $modal, Upload, $location, $anchorScroll) {

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

      strangerlist.sortableOptions = {
        // called after a node is dropped
        stop: function(e, ui) {
          strangerlist.updateItems();
        },
        placeholder: "ui-state-highlight"
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
        $location.hash('top');
        $anchorScroll();
      }

      strangerlist.deleteCurrentItem = function(item) {
        $http.delete('/api/items/'+item.id)

          .then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            strangerlist.loadItems()
              
          }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("Error deleting item", response)
          });
      }

      strangerlist.updateCancel = function() {
        strangerlist.resetForm(); 
      }

      strangerlist.resetForm = function() {
        strangerlist.currentItem = null;
        strangerlist.editedItem = {};
      }

      strangerlist.generateId = function() {
        return Date.now();
      }

      strangerlist.createItem = function($file) {
        var newItem = angular.copy(strangerlist.editedItem);
        newItem.id = strangerlist.generateId();


        if(typeof $file.name == 'string') {
          strangerlist.upload($file, newItem);
          strangerlist.resetForm();
        }
        else
          alert("You must to select an image")
      }

      strangerlist.updateItem = function($file) {
        var fields = ['imageSrc', 'text']

        fields.forEach(function(field) {
          strangerlist.currentItem[field] = strangerlist.editedItem[field];
        })

        if(typeof $file.name == 'string')
          strangerlist.upload($file, strangerlist.currentItem);
        else
          strangerlist.updateItemServer(strangerlist.currentItem);

        strangerlist.resetForm();
      }

      strangerlist.open = function (item) {
          $scope.item = item;
          $modal.open({
              templateUrl: 'myModalContent.html',
              backdrop: true,
              windowClass: 'modal',
              controller: function ($scope, $modalInstance, $log, item) {
                  $scope.item = item;
                  $scope.submit = function () {
                      strangerlist.deleteCurrentItem(item);
                      $modalInstance.dismiss('cancel');
                  }
                  $scope.cancel = function () {
                      $modalInstance.dismiss('cancel');
                  };
              },
              resolve: {
                  item: function () {
                      return $scope.item;
                  }
              }
          });
      }

      strangerlist.upload = function(file, item) {

        if(file !== undefined) {
          Upload.upload({
              url: 'api/items',
              data: {file: file, 'item': item}
          }).then(function (resp) {
              strangerlist.loadItems()
          }, function (resp) {
              console.log('Error status: ' + resp.status);
          }, function (evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
          });
        }
        else
          console.log("There is no file to upload")
      }

      strangerlist.updateItemServer = function(item) {
        $http.post('/api/items', {item: item})

          .then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            strangerlist.loadItems()
              
          }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("Error updating item", response)
          });
      }

      strangerlist.init();

    }]);
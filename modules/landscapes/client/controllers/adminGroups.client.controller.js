'use strict';

angular.module('landscapes')
    .controller('AdminGroupsCtrl', function ($scope, UserService, GroupService, LandscapesService, PermissionService) {

      var vm = this;
      vm.group = { permissions: [] };
      vm.originalGroup = { permissions: [] };

      vm.errors = {};
      vm.submitted = false;

      vm.addingGroup = false;
      vm.editingGroup = false;
      vm.viewingGroup = false;

      vm.viewGroup = function(group){
        vm.group = group;
        vm.viewingGroup = true;
      };

      vm.editGroup = function(id) {
        console.log('editGroup: ' + id);
        vm.editingGroup = true;
        vm.group = GroupService.get({ id:id })
                .$promise
                .then(function(data){
                  vm.group = data;
                  angular.copy(vm.group, vm.originalGroup);
                });
      };

      vm.addGroup = function() {
        console.log('addGroup');
        vm.addingGroup = true;
      };

      vm.compareUsers = function(obj1,obj2){
        return obj1._id === obj2._id;
      };

      vm.resetGroups = function() {
        console.log('resetGroups');
        vm.originalGroup = { permissions: [] };
        vm.addingGroup = false;
        vm.editingGroup = false;
        vm.viewingGroup = false;
        vm.group = { permissions: [] };
        vm.submitted = false;
        $scope.$parent.vm.groups = GroupService.query();
        $scope.$parent.vm.users = UserService.query();
      };

      vm.saveGroup = function (form) {
        vm.form = form;
        vm.submitted = true;

        if (vm.form.$invalid) {
          console.log('form.$invalid: ' + JSON.stringify(vm.form.$error));
        } else if (vm.addingGroup) {

          GroupService.save({
            name: vm.group.name,
            description: vm.group.description,
            permissions: vm.group.permissions,
            landscapes: vm.group.landscapes
          })
                    .$promise.then(function () {
                      vm.resetGroups();
                    })
                    .catch(function (err) {
                      err = err.data || err;
                      console.log(err);

                      vm.errors = {};

                        // Update validity of form fields that match the mongoose errors
                      angular.forEach(err.errors, function (error, field) {
                        vm.form[field].$setValidity('mongoose', false);
                        vm.errors[field] = error.message;
                      });
                    });

        } else if (vm.editingGroup) {

          GroupService.update({ id:vm.group._id }, {
            name: vm.group.name,
            description: vm.group.description,
            permissions: vm.group.permissions,
            landscapes: vm.group.landscapes
          })
                    .$promise.then(function () {
                        //Find new users
                      var newUsers = lodash.differenceWith(vm.group.users,vm.originalGroup.users, function(a,b){
                        return a._id === b._id;
                      });
                        // Find Deleted users
                      var deletedUsers = lodash.differenceWith(vm.originalGroup.users, vm.group.users, function(a,b){
                        return a._id === b._id;
                      });

                      console.log('new users group ' + newUsers.length);
                      console.log('deleted users group ' + deletedUsers.length);

                        //really need an async here ...
                      for(var i = 0; i < newUsers.length; i++) {
                        console.log('UserService.update: ' + newUsers[i]);
                        UserService.addGroup({ id:newUsers[i]._id,roleId:null,groupId:vm.group._id })
                                .$promise
                                .then(vm.resetGroups);
                                // .then(function (data){
                                //     vm.resetGroups();
                                // });

                      }

                        //  Users from role
                      for(var j = 0; j < deletedUsers.length; j++) {
                        console.log('UserService.update: ' + deletedUsers[i]);
                        UserService.deleteGroup({ id:deletedUsers[j]._id,roleId:null,groupId:vm.group._id })
                                .$promise
                                .then(vm.resetGroups);
                                // .then(function (data){
                                //     vm.resetGroups();
                                // });
                      }
                      vm.resetGroups();
                    })
                    .catch(function (err) {
                      err = err.data || err;
                      console.log(err);

                      $scope.errors = {};

                        // Update validity of form fields that match the mongoose errors
                      angular.forEach(err.errors, function (error, field) {
                        vm.form[field].$setValidity('mongoose', false);
                        vm.errors[field] = error.message;
                      });
                    });
        }
      };

      vm.deleteGroup = function(){
        console.log('deleteGroup: ' + vm.group._id);
        GroupService.delete(vm.group._id)
                .$promise.then(function() {
                  vm.resetGroups();
                })
                .catch(function(err) {
                  err = err.data || err;
                  console.log(err);
                });
      };
    });

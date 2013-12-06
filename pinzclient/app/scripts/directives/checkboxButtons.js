'use strict';

angular.module('modalApp')
    .directive('checkboxButtons', function() {

        return {
                restrict: "E",
                scope: { model: '=', options:'='},
                controller: function($scope){

                    if($scope.model == null || typeof $scope.model === 'undefined') {
                        $scope.model = [];
                    }
                    if(typeof $scope.lastClickedOptionState === 'undefined') {
                        $scope.lastClickedOptionState = false;
                    }
                    if(typeof $scope.optionInQuery === 'undefined') {
                        $scope.optionInQuery = false;
                    }

                    $scope.activate = function(clickedOption){

                        console.log("Scope data model:: " + JSON.stringify($scope.model));
                        console.log("Scope options:: " + JSON.stringify($scope.options));

                        // track state
                        $scope.lastClickedOption = clickedOption;
                        $scope.lastClickedOptionState = false;

                        console.log("Last clicked option:: " + JSON.stringify(clickedOption));
                        

                        var optionInQuery = false;
                        var queryValueIdx;

                        for(queryValueIdx = 0; queryValueIdx < $scope.model.length; queryValueIdx++) {
                            if($scope.model[queryValueIdx] === $scope.lastClickedOption) {
                                $scope.optionInQuery = true;
                                console.log("INFO: " + $scope.model[queryValueIdx] + " equals " + $scope.lastClickedOption);
                                break;
                            }
                        }

                        // now manage add/remove from query
                        if($scope.optionInQuery) {
                            console.log("Clicked value WAS in query, so we need to remove value from query & reactivate button");
                            $scope.model.splice(queryValueIdx , 1);
                            $scope.optionInQuery = optionInQuery;
                        } else {
                            console.log("Clicked value WAS NOT in query, so we need to add to query & deactivate button");
                            if(clickedOption != null) {
                                $scope.model.push(clickedOption);
                                $scope.optionInQuery = optionInQuery;
                            }
                        }
                        
                    }
                },
                template: "<button type='button' class='btn btn-success' "+
                            "ng-class='{active: option == optionInQuery}'"+
                            "ng-repeat='option in options' "+
                            "ng-click='activate(option)'>{{option}} "+
                          "</button>"
            }
});
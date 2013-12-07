'use strict';

angular.module('modalApp')
    .directive('checkboxButtons', function() {

        return {
                restrict: "E",
                scope: { model: '=', options:'='},
                controller: function($scope, $element){

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
                                $scope.$apply(function(){
                                    $scope.model.push(clickedOption);
                                    $scope.optionInQuery = optionInQuery;
                                });
                            }
                        }
                        // Got to get to the bottom of the CSS
                    }
                },
                template: "<button type='button' class='btn btn-success' " +
                            //"ng-class='{activate: optionIsSelected}'" +
                            "ng-repeat='option in options' " +
                            "ng-click='activate(option)'>{{option}} " +
                          "</button>",

                link: function ($scope, element) {
                    console.log('scope.optionInQuery: ', $scope.optionInQuery);
                    element.on('click', function() {
                        console.log("clicked button...");
                        element.toggleClass('active');

                    });
                }
            }
});
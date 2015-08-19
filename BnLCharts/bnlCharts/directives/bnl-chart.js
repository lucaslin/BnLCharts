angular.module('bnlCharts')
.directive('bnlChart', function ($timeout) {
    return {
        controller: function ($scope, $element, $attrs, $transclude) {

            this.getConfig = function () {
                return $scope.config;
            };

            // I transclude content manually to avoid creating another scope.
            // This remove the need for an ng-transclude attribute in the template.
            // Transclude should be after scope is prepared because it causes link function of children to execute.
            $transclude($scope, function (clone, scope) {
                $element.append(clone);
            });
        },
        link: function (scope, element, attrs) {

            $timeout(function () {
                scope.$broadcast('bnl-chart-prepare-data');

                $timeout(function () {
                    scope.$broadcast('bnl-chart-render');
                }, 500);

            }, 500);
        },
        replace: true,
        restrict: 'E',
        scope: {
            config: '='
        },
        templateNamespace: 'svg',
        template: '<svg></svg>',
        transclude: true
    }
});
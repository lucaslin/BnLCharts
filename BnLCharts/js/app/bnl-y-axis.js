bnlCharts.directive('bnlYAxis', [function () {

    var renderAxis = function (element, yScale, width, height) {

        yScale.range([height, 0]);

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        x = width; //orient left is right-hand-side based

        d3.select(element).select('.y-axis')
            .attr({
                transform: 'translate(' + x + ',0)'
            })
            .call(yAxis);
    };

    return {
        controller: ['$scope', function ($scope) {
            console.log('bnlYAxis controller:' + $scope.$id);
        }],
        link: function (scope, element, attrs) {
            console.log('bnlYAxis link:' + scope.$id);

            scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlYAxis render:' + scope.$id);

                var g = element[0];
                var svg = g.ownerSVGElement;

                renderAxis(g, scope.chart.yScale, scope.width, scope.height);
            });
        },
        replace: true,
        restrict: 'E',
        scope: {
            chart: '='
        },
        templateNamespace: 'svg',
        template: '<g><g class="y-axis axis"></g></g>'
    };
}]);
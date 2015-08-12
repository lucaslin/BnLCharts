bnlCharts.directive('bnlXAxis', [function () {

    var renderAxis = function (element, xScale, width, height) {

        xScale.range([0, width]);

        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');

        d3.select(element)
            .attr('class', 'x axis')
            //.attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);
    };

    return {
        controller: ['$scope', function ($scope) {
            console.log('bnlXAxis controller:' + $scope.$id);
        }],
        link: function (scope, element, attrs) {
            console.log('bnlXAxis link:' + scope.$id);

            scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlXAxis render:' + scope.$id);

                var g = element[0];
                var svg = g.ownerSVGElement;

                renderAxis(g, scope.chart.xScale, scope.width, scope.height);
            });

        },
        replace: true,
        restrict: 'E',
        scope: {
            chart: '='
        },
        templateNamespace: 'svg',
        template: '<g></g>'
    };
}]);
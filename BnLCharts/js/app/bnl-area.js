bnlCharts.directive('bnlArea', [function () {

    var render = function (element, x, y, width, height, dataPoints) {

        var area = d3.svg.area()
            .x(function (d) { return x(new Date(d.x)); })
            .y0(height)
            .y1(function (d) { return height - y(d.y); })
             .interpolate("linear");

        var select = d3.select(element).selectAll('.area').data(dataPoints);

        select.enter()
            .append("path")
            .attr("class", "area")
            .attr("d", area(dataPoints));
    };

    return {
        link: function (scope, element, attrs) {
            console.log('bnlArea link:' + scope.$id);

            scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlArea render:' + scope.$id);

                var g = element[0];
                var svg = g.ownerSVGElement;

                render(g, scope.chart.xScale, scope.chart.yScale, scope.width, scope.height, scope.chart.data);
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
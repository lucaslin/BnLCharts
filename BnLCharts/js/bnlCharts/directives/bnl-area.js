bnlCharts.directive('bnlArea', [function () {

    var render = function (element, xScale, yScale, width, height, data) {

        var area = d3.svg.area()
            .x(function (d) { return xScale(new Date(d.x)); })
            .y0(height)
            .y1(function (d) { return height - yScale(d.y); })
             .interpolate("linear");

        var select = d3.select(element).selectAll('.area').data(data);

        select.enter()
            .append("path")
            .classed("area-path", true)
            .attr(
            {
                d: area(data),
                width: width,
                height: height
            })
    };

    return {
        link: function (scope, element, attrs, bnlChartCtrl) {
            console.log('bnlArea link:' + scope.$id);

            scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlArea render:' + scope.$id);

                var g = element[0];
                var svg = g.ownerSVGElement;

                var xScale = bnlChartCtrl.getScale(scope.scaleX).copy(); //scope.chart.scales[scope.scaleX].copy();
                xScale.range([0, scope.width]);

                var yScale = bnlChartCtrl.getScale(scope.scaleY).copy(); // scope.chart.scales[scope.scaleY].copy();
                yScale.range([scope.height, 0]);

                var data = bnlChartCtrl.getData();

                render(g, xScale, yScale, scope.width, scope.height, data);
            });
        },
        replace: true,
        restrict: 'E',
        require: '^bnlChart',
        scope: {
            chart: '=',
            scaleX: '@',
            scaleY: '@'
        },
        templateNamespace: 'svg',
        template: '<g class="area" viewBox="0 0 250 1000"></g>'
    };
}]);
angular.module('bnlCharts')
.directive('bnlArea', function () {

    var render = function (data, x, y, element, xScale, yScale, width, height) {

        var area = d3.svg.area()
            .x(function (d,i) { return xScale(x(d,i)); })
            .y0(height)
            .y1(function (d, i) { return height - yScale(y(d,i)); })
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

            scope.config = bnlChartCtrl.getConfig();

            scope.$on('bnl-chart-render', function (event, args) {

                var g = element[0];
                var svg = g.ownerSVGElement;

                var xScale = scope.scaleX.copy(); 
                xScale.range([0, scope.width]);

                var yScale = scope.scaleY.copy();
                yScale.range([scope.height, 0]);

                var data = scope.data;
                var x = scope.domainX;
                var y = scope.domainY;

                render(data, x, y, g, xScale, yScale, scope.width, scope.height);
            });
        },
        replace: true,
        restrict: 'E',
        require: '^bnlChart',
        scope: {
            data: '=',
            scaleX: '=',
            scaleY: '=',
            domainX: '=',
            domainY: '='
        },
        templateNamespace: 'svg',
        template: '<g class="area" viewBox="0 0 250 1000"></g>'
    }
});
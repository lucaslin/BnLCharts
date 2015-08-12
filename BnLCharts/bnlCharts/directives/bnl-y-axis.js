angular.module('bnlCharts')
.directive('bnlYAxis', function () {

    var renderAxis = function (element, yScale, width, height) {

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
        link: function (scope, element, attrs, bnlChartCtrl) {
            console.log('bnlYAxis link:' + scope.$id);

            scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlYAxis render:' + scope.$id);

                var g = element[0];
                var svg = g.ownerSVGElement;

                var yScale = bnlChartCtrl.getScale(scope.scale).copy(); // scope.chart.scales[scope.scale].copy();
                yScale.range([scope.height, 0]);

                renderAxis(g, yScale, scope.width, scope.height);
            });
        },
        replace: true,
        restrict: 'E',
        require: '^bnlChart',
        scope: {
            chart: '=',
            scale: '@'
        },
        templateNamespace: 'svg',
        template: '<g><g class="axis y-axis"></g></g>'
    }
});
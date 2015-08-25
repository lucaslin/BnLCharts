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

            scope.config = bnlChartCtrl.getConfig();

            scope.$on('bnl-chart-render', function (event, args) {

                var g = element[0];                

                var yScale = scope.scale.copy();
                yScale.range([scope.height, 0]);

                renderAxis(g, yScale, scope.width, scope.height);
            });
        },
        replace: true,
        restrict: 'E',
        require: '^bnlChart',
        scope: {            
            scale: '='
        },
        templateNamespace: 'svg',
        template: '<g><g class="axis y-axis"></g></g>'
    }
});
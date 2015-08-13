bnlCharts.directive('bnlXAxis', [function () {

    var render = function (element, xScale, ticks, tickFormat) {

        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');


        if (ticks) {
            var tickNumber = Number(ticks);

            if (isNaN(tickNumber)) {

                var parts = ticks.split(',');

                if (parts.length > 0) {

                    var step = 1;

                    if (parts.length == 2) {
                        step = Number(parts[1]);
                        step = isNaN(step) ? undefined : step;
                    }

                    switch (parts[0]) {
                        case 'second':
                            xAxis.ticks(d3.time.second, step);
                            break;
                        case 'minute':
                            xAxis.ticks(d3.time.minute, step);
                            break;
                        case 'hour':
                            xAxis.ticks(d3.time.hour, step);
                            break;
                        case 'day':
                            xAxis.ticks(d3.time.day, step);
                            break;
                        case 'week':
                            xAxis.ticks(d3.time.week, step);
                            break;
                        case 'month':
                            xAxis.ticks(d3.time.month, step);
                            break;
                        case 'year':
                            xAxis.ticks(d3.time.year, step);
                            break;
                        default:
                            break;
                    }
                }
            }
            else {
                xAxis.ticks(tickNumber);
            }
        }

        if (tickFormat) {
            xAxis.tickFormat(d3.time.format(tickFormat));
        }


        d3.select(element)
            .call(xAxis);
    };

    return {
        link: function (scope, element, attrs, bnlChartCtrl) {
            console.log('bnlXAxis link:' + scope.$id);

            scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlXAxis render:' + scope.$id);

                var g = element[0];
                var svg = g.ownerSVGElement;


                var xScale = bnlChartCtrl.getScale(scope.scale).copy();// scope.chart.scales[scope.scale].copy();
                xScale.range([0, scope.width]);

                render(g, xScale, scope.ticks, scope.tickFormat);
            });

        },
        replace: true,
        restrict: 'E',
        require: '^bnlChart',
        scope: {
            scale: '@',
            ticks: '@',
            tickFormat: '@'
        },
        templateNamespace: 'svg',
        template: '<g class="axis x-axis"></g>'
    };
}]);
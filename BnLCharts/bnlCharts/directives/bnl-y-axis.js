angular.module('bnlCharts')
.directive('bnlYAxis', function () {

    var render = function (element, yScale, width, ticks, tickFormat) {

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

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
                            yAxis.ticks(d3.time.second, step);
                            break;
                        case 'minute':
                            yAxis.ticks(d3.time.minute, step);
                            break;
                        case 'hour':
                            yAxis.ticks(d3.time.hour, step);
                            break;
                        case 'day':
                            yAxis.ticks(d3.time.day, step);
                            break;
                        case 'week':
                            yAxis.ticks(d3.time.week, step);
                            break;
                        case 'month':
                            yAxis.ticks(d3.time.month, step);
                            break;
                        case 'year':
                            yAxis.ticks(d3.time.year, step);
                            break;
                        default:
                            break;
                    }
                }
            }
            else {
                yAxis.ticks(tickNumber);
            }
        }

        if (tickFormat) {
            yAxis.tickFormat(d3.time.format(tickFormat));
        }


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

                render(g, yScale, scope.width, scope.ticks, scope.tickFormat);
            });
        },
        replace: true,
        restrict: 'E',
        require: '^bnlChart',
        scope: {            
            scale: '=',
            ticks: '@',
            tickFormat: '@'
        },
        templateNamespace: 'svg',
        template: '<g><g class="axis y-axis"></g></g>'
    }
});
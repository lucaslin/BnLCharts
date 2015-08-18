var bnlCharts = angular.module('bnlCharts', []);
;
bnlCharts.directive('bnlAbsoluteLayout', [function () {
    return {
        controller: function ($scope, $element, $attrs, $transclude) {
            console.log('bnlAbsoluteLayout controller:' + $scope.$id);

            // I use $scope.$parent to avoid injecting an empty scope for trancluded content.
            $transclude($scope.$parent, function (clone, scope) {
                $element.append(clone);
            });

            $scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlAbsoluteLayout render:' + $scope.$id);

                var svg = $element[0];

                $.each($($element).children(), function (index, child) {

                    var $child = $(child);
                    var x = $child.attr('x') ? Number($child.attr('x')) : 0;
                    var y = $child.attr('y') ? Number($child.attr('y')) : 0;

                    d3.select(child).attr({
                        transform: 'translate(' + x + ',' + y + ')'
                    });


                    var width = $child.attr('width') ? Number($child.attr('width')) : svg.clientWidth;
                    var height = $child.attr('height') ? Number($child.attr('height')) : svg.clientHeight;

                    var childScope = angular.element(child).isolateScope();

                    childScope.width = width;
                    childScope.height = height;
                });
            });
        },
        replace: true,
        restrict: 'E',
        scope: {},
        templateNamespace: 'svg',
        template: '<g class="bnl-absolute-layout"></g>',
        transclude: true
    };
}]);
;
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
;
bnlCharts.directive('bnlChart', ['$timeout', function ($timeout) {

    return {
        controller: function ($scope, $element, $attrs, $transclude) {
            console.log('bnlChart controller:' + $scope.$id);

            var svg = $element[0];

            var scales = [];

            this.getData = function () {
                return $scope.chartData;
            };

            this.getScale = function (name) {
                return scales[name];
            };

            this.setScale = function (name, scale) {
                scales[name] = scale;
            };

            // I transclude content manually to avoid creating another scope.
            // This remove the need for an ng-transclude attribute in the template.
            // Transclude should be after scope is prepared because it causes link function of children to execute.
            $transclude($scope, function (clone, scope) {
                $element.append(clone);
            });
        },
        link: function (scope, element, attrs) {
            console.log('bnlChart link:' + scope.$id);

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
            chartData: '='
        },
        templateNamespace: 'svg',
        template: '<svg></svg>',
        transclude: true
    };
}]);
;
bnlCharts.directive('bnlDockedLayout', [function () {
    var parseMargin = function (text) {

        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

        if (text) {

            var parts = text.split(',');

            switch (parts.length) {
                case 1:
                    var marginAll = Number(parts[0]);
                    if (!isNaN(marginAll)) {
                        margin.top = marginAll;
                        margin.right = marginAll;
                        margin.bottom = marginAll;
                        margin.left = marginAll;
                    }
                    break;
                case 2:
                    var marginTopBottom = Number(parts[0]);
                    var marginLeftRight = Number(parts[1]);

                    if (!isNaN(marginTopBottom)) {
                        margin.top = marginTopBottom;
                        margin.bottom = marginTopBottom;
                    }

                    if (!isNaN(marginLeftRight)) {
                        margin.right = marginLeftRight;
                        margin.left = marginLeftRight;
                    }
                    break;
                case 3:
                    var marginTop = Number(parts[0]);
                    var marginLeftRight = Number(parts[1]);
                    var marginBottom = Number(parts[2]);

                    if (!isNaN(marginTop)) {
                        margin.top = marginTop;
                    }

                    if (!isNaN(marginLeftRight)) {
                        margin.right = marginLeftRight;
                        margin.left = marginLeftRight;
                    }

                    if (!isNaN(marginBottom)) {
                        margin.bottom = marginBottom;
                    }

                    break;
                default:

                    if (parts.length >= 4) {

                        var marginTop = Number(parts[0]);
                        var marginRight = Number(parts[1]);
                        var marginBottom = Number(parts[2]);
                        var marginLeft = Number(parts[3]);

                        if (!isNaN(marginTop)) {
                            margin.top = marginTop;
                        }

                        if (!isNaN(marginRight)) {
                            margin.right = marginRight;
                        }

                        if (!isNaN(marginBottom)) {
                            margin.bottom = marginBottom;
                        }

                        if (!isNaN(marginLeft)) {
                            margin.left = marginLeft;
                        }
                    }

                    break;
            }
        }

        return margin;
    }

    var positionChild = function (child, x, y, width, height) {

        if (x !== 0 || y !== 0) {
            d3.select(child).attr({
                transform: 'translate(' + x + ',' + y + ')'
            });
        }

        var childScope = angular.element(child).isolateScope();

        childScope.width = width;
        childScope.height = height;
    };

    return {
        controller: function ($scope, $element, $attrs, $transclude) {
            console.log('bnlDockedLayout controller:' + $scope.$id);

            // I use $scope.$parent to avoid injecting an empty scope for trancluded content.
            $transclude($scope.$parent, function (clone, scope) {
                $element.append(clone);
            });

            $scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlDockedLayout render:' + $scope.$id);

                var g = $element[0];
                var svg = g.ownerSVGElement;

                var layouts = [];

                var x = 0, y = 0, width = $scope.width ? $scope.width : svg.clientWidth, height = $scope.height ? $scope.height : svg.clientHeight;

                var undocked = [];
                var undockedMargin = { top: 0, right: width, bottom: height, left: 0 };

                $.each($($element).children(), function (index, child) {

                    var $child = $(child);

                    var childMargin = parseMargin($child.attr('margin'));

                    var childX = x + childMargin.left;
                    var childY = y + childMargin.top;
                    var childWidth = $child.attr('width') ? Number($child.attr('width')) : width;
                    var childHeight = $child.attr('height') ? Number($child.attr('height')) : height;

                    var childDockHeight = childMargin.top + childHeight + childMargin.bottom;
                    var childDockWidth = childMargin.left + childWidth + childMargin.right;

                    var dock = $child.attr('dock');
                    if (dock) {
                        switch (dock) {
                            case 'top':
                                undockedMargin.top = Math.max(y + childDockHeight, undockedMargin.top);
                                childWidth -= childMargin.left + childMargin.right;
                                break;
                            case 'right':
                                undockedMargin.right = Math.min(width - childDockWidth, undockedMargin.right);
                                childX = width - childDockWidth;
                                childHeight -= childMargin.top + childMargin.bottom;
                                break;
                            case 'bottom':
                                undockedMargin.bottom = Math.min(height - childDockHeight, undockedMargin.bottom);
                                childY = height - childDockHeight;
                                childWidth -= childMargin.left + childMargin.right;
                                break;
                            case 'left':
                                undockedMargin.left = Math.max(x + childDockWidth, undockedMargin.left);
                                childHeight -= childMargin.top + childMargin.bottom;
                                break;
                            default:
                                console.log('The dock attribute "' + dock + '" is not supported by bnl-docked-layout. The element will be treated as undocked.');
                                dock = undefined;
                                break;
                        }
                    }

                    if (dock) {
                        positionChild(child, childX, childY, childWidth, childHeight);
                    }
                    else {
                        undocked.push({ child: child, childMargin: childMargin });
                    }
                });

                // undocked children are positioned after undockedMargin is calculated               
                for (var i = 0; i < undocked.length; i++) {

                    var child = undocked[i].child;
                    var childMargin = undocked[i].childMargin;

                    var childX = undockedMargin.left + childMargin.left;
                    var childY = undockedMargin.top + childMargin.top;
                    var childWidth = (undockedMargin.right - childMargin.right) - childX;
                    var childHeight = (undockedMargin.bottom - childMargin.bottom) - childY;

                    positionChild(child, childX, childY, childWidth, childHeight);
                }
            });
        },
        replace: true,
        restrict: 'E',
        scope: {},
        templateNamespace: 'svg',
        template: '<g class="bnl-docked-layout"></g>',
        transclude: true
    };
}]);
;
angular.module('bnlCharts')
.directive('bnlLinearScale', [function () {

    var createScale = function (data) {
        var scale = d3.scale.linear();

        var minY = 0;
        var maxY = 0;

        if (data) {
            minY = d3.min(data, function (d) { return d.y; });
            maxY = d3.max(data, function (d) { return d.y; });
        }

        minY = Math.min(0, minY);
        maxY = Math.max(1, maxY);

        scale.domain([minY, maxY]);

        return scale;
    };

    return {
        link: function (scope, element, attrs, bnlChartCtrl) {
            console.log('bnlLinearScale link:' + scope.$id);

            scope.$on('bnl-chart-prepare-data', function (event, args) {

                console.log('bnlLinearScale prepare:' + scope.$id);

                var name = scope.name;

                if (name) {
                    var data = bnlChartCtrl.getData();
                    var scale = createScale(data);
                    bnlChartCtrl.setScale(name, scale);
                }
            });
        },
        restrict: 'E',
        require: '^bnlChart',
        scope: {
            chart: '=',
            name: '@',
        }
    };
}]);
;
angular.module('bnlCharts')
.directive('bnlTimeScale', function () {

    var createScale = function (data, isUtc) {

        var scale;

        if (isUtc) {
            scale = d3.time.scale.utc();
        }
        else {
            scale = d3.time.scale();
        }

        var minDate = data && data.length > 0 ? new Date((data[0].x)) : new Date();
        var maxDate = data && data.length > 0 ? new Date((data[data.length - 1].x)) : minDate;

        scale.domain([minDate, maxDate]);

        return scale;
    };

    return {
        link: function (scope, element, attrs, bnlChartCtrl) {
            console.log('bnlTimeScale link:' + scope.$id);

            scope.$on('bnl-chart-prepare-data', function (event, args) {

                console.log('bnlTimeScale prepare:' + scope.$id);

                var name = scope.name;
                if (name) {
                    var data = bnlChartCtrl.getData();
                    var scale = createScale(data, scope.isUtc);
                    bnlChartCtrl.setScale(name, scale);
                }
            });

        },
        restrict: 'E',
        require: '^bnlChart',
        scope: {
            name: '@',
            isUtc: '=?'
        },
    };
});
;
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
;
bnlCharts.directive('bnlYAxis', [function () {

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
    };
}]);
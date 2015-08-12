var bnlCharts = angular.module('bnlCharts', []);
;
bnlCharts.directive('bnlAbsoluteLayout', [function () {
    return {
        controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
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
        }],
        link: function (scope, element, attrs) {
            console.log('bnlAbsoluteLayout link:' + scope.$id);
        },
        replace: true,
        restrict: 'E',
        scope: {},
        templateNamespace: 'svg',
        template: '<g class="bnl-absolute-layout"></g>',
        transclude: true
    }
}]);
;
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
;
bnlCharts.directive('bnlChart', ['$timeout', function ($timeout) {

    var createXScale = function (width) {
        // I create the X scale
        var x = d3.time.scale();

        x.ticks(d3.time.day);
        x.tickFormat('%a %d');
        x.range([0, width]);

        return x;
    };

    var createYScale = function (height) {
        var y = d3.scale.linear()
            .range([height, 0]);
        return y;
    };

    var updateXDomain = function (x, dataPoints) {

        // I determine the min/max of the X scale
        var minDate = dataPoints && dataPoints.length > 0 ? new Date((dataPoints[0].x)) : new Date();
        var maxDate = dataPoints && dataPoints.length > 0 ? new Date((dataPoints[dataPoints.length - 1].x)) : minDate;

        minDate = moment.utc(minDate);
        maxDate = moment.utc(maxDate);

        x.domain([minDate, maxDate]);
    };

    var updateYDomain = function (y, dataPoints) {
        var minY = 0;
        var maxY = 0;

        if (dataPoints) {
            minY = d3.min(dataPoints, function (d) { return d.y; });
            maxY = d3.max(dataPoints, function (d) { return d.y; });
        }

        minY = Math.min(0, minY);
        maxY = Math.max(1, maxY);

        y.domain([minY, maxY]);
    };

    return {
        controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
            console.log('bnlChart controller:' + $scope.$id);

            var svg = $element[0];

            var xScale = createXScale(svg.clientWidth);
            updateXDomain(xScale, $scope.chartData);

            var yScale = createYScale(svg.clientHeight);
            updateYDomain(yScale, $scope.chartData);

            $scope.chart = {
                data: $scope.chartData,
                xScale: xScale,
                yScale: yScale
            };

            // I transclude content manually to avoid creating another scope.
            // This remove the need for an ng-transclude attribute in the template.
            // Transclude should be after scope is prepared because it causes link function of children to execute.
            $transclude($scope, function (clone, scope) {
                $element.append(clone);
            });
        }],
        link: function (scope, element, attrs) {
            console.log('bnlChart link:' + scope.$id);
            $timeout(function () {
                scope.$broadcast('bnl-chart-render');
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

    return {
        controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
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

                $.each($($element).children(), function (index, child) {

                    var $child = $(child);
                    var dock = $child.attr('dock');

                    var childX = x, childY = y, childWidth = width, childHeight = height;

                    if (dock) {
                        if (dock === 'top') {
                            childHeight = $child.attr('height') ? Number($child.attr('height')) : height;
                            y += childHeight;
                            height -= childHeight;
                        }
                        else if (dock === 'right') {

                            childWidth = $child.attr('width') ? Number($child.attr('width')) : width;
                            childX = width - childWidth;

                            width -= childWidth;
                        }
                        else if (dock === 'bottom') {

                            childHeight = $child.attr('height') ? Number($child.attr('height')) : height;
                            childY = height - childHeight;

                            height -= childHeight;
                        }
                        else if (dock === 'left') {
                            childWidth = $child.attr('width') ? Number($child.attr('width')) : width;

                            x += childWidth;
                            width -= childWidth;
                        }
                    }

                    // I support margin attribute (TRBL same as CSS margin
                    var margin = parseMargin($child.attr('margin'));
                    childY += margin.top;
                    childX += margin.left;

                    childHeight -= (margin.top + margin.bottom);
                    childWidth -= (margin.left + margin.right);

                    // I position each child
                    if (childX !== 0 || childY !== 0) {
                        d3.select(child).attr({
                            transform: 'translate(' + childX + ',' + childY + ')'
                        });
                    }

                    var childScope = angular.element(child).isolateScope();

                    childScope.width = childWidth;
                    childScope.height = childHeight;
                });
            });
        }],
        link: function (scope, element, attrs) {
            console.log('bnlDockedLayout link:' + scope.$id);

            var g = element[0];
            d3.select(g).classed('bnl-docked-layout', true);
        },
        replace: true,
        restrict: 'E',
        scope: {},
        templateNamespace: 'svg',
        template: '<g></g>',
        transclude: true
    };
}]);
;
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
;
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
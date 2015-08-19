/*
 * BnL Charts
 * 
 * D3 charting componentized using Angular directives.
 * 
 * Usage
 * -----
 * HTML:
 * 
 *   <bnl-chart config="myConfig" width="1200" height="300">
 *     <bnl-docked-layout>                
 *       <bnl-area data="config.data" domain-x="config.x" domain-y="config.y" scale-x="config.xScale" scale-y="config.yScale"></bnl-area>
 *       <bnl-x-axis scale="config.xScale" ticks="day" tick-format="%b %d" dock="bottom" height="25" margin="0,0,0,25"></bnl-x-axis>
 *       <bnl-y-axis scale="config.yScale" dock="left" width="25" margin="0,0,25,0"></bnl-y-axis>
 *     </bnl-docked-layout>
 *   </bnl-chart>
 * 
 *   The bnl-chart accesses data through the config binding.
 *   The bnl-chart renders as an SVG element, so you can set properties on the SVG like width and height.
 * 
 *   Choose a layout container for the parts of your chart.  Based on your choice, you can apply different attributes to control layout. 
 *   Ordering parts can be important to layout and z-order of rendering.
 * 
 *   Different directives require different attributes in order to render.  
 *   For example, bnl-area requires a data property, scale functions, and domain functions.
 *   
 * Components
 * ----------
 * Modules: 
 *   bnlCharts
 * 
 * Directives:
 *   bnl-chart: Main container for a chart.
 * 
 *   bnl-x-axis: Renders an x axis
 *   bnl-y-axis: Renders a Y axis.
 * 
 *   bnl-area: Renders an area chart for a single series)
 * 
 *   bnl-absolute-layout: Positions children based on their attributes of x, y, width, height.
 *   bnl-docked-layout: Positions children based on the side they are docked (left, top, right, bottom, none).
 * 
 * 
 * Design Considerations
 * ---------------------
 * Scope: 
 *   The chart directive is isolated scope to prevent collision with other charts on the page.
 *   Each child that renders has isolated scope to allow for setting individual scope properties like width and height.
 *    
 * Transclusion:
 *   Containers (chart and layouts) transclude content to avoid requiring chart authors to edit templates.
 *   Transclusion is done manually in the directives to avoid creating an additonal isolated scope. ng-transclude is not in the templates.
 *   Layouts with isolated scopes use the chart's scope for their transcluded content to be invisible to their children.
 *   The call to $transclude is done at the tail of the method because it causes link functions to execute.  
 *   $transclude is called so that controller calls tunnel down the scope hierarchy and link calls bubble up the scope hierarchy.
 * 
 * SVG:
 *   This library avoids nesting SVG elements for grouping and uses the <g> element instead.
 *   A single SVG at the root allows the chart to scale properly; It is vector graphics after all.
 *   D3 renders based on variables in memory and not SVG containers (e.g. axis.range), so width/height containment isn't important.
 *   Browsers handle nested SVG width/height updates for rendering, but the clientWidth, clientHeight, and getBBox() are zeros for a nested SVG in JavaScript.
 */
// ================================================================================ //
angular.module('bnlCharts', []);
;
angular.module('bnlCharts')
.directive('bnlAbsoluteLayout', function () {
    return {
        controller: function ($scope, $element, $attrs, $transclude) {

            // I use $scope.$parent to avoid injecting an empty scope for trancluded content.
            $transclude($scope.$parent, function (clone, scope) {
                $element.append(clone);
            });

            $scope.$on('bnl-chart-render', function (event, args) {

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
    }
});
;
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
;
angular.module('bnlCharts')
.directive('bnlChart', function ($timeout) {
    return {
        controller: function ($scope, $element, $attrs, $transclude) {

            this.getConfig = function () {
                return $scope.config;
            };

            // I transclude content manually to avoid creating another scope.
            // This remove the need for an ng-transclude attribute in the template.
            // Transclude should be after scope is prepared because it causes link function of children to execute.
            $transclude($scope, function (clone, scope) {
                $element.append(clone);
            });
        },
        link: function (scope, element, attrs) {

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
            config: '='
        },
        templateNamespace: 'svg',
        template: '<svg></svg>',
        transclude: true
    }
});
;
/*
 * BnL Charts - bnl-docked-layout
 * 
 * Provides layout of child SVG elements based on docking to the sides of the available
 * area with undocked element taking up the remaining space.
 * 
 * Usage
 * -----
 * HTML:
 * 
 *   <bnl-chart ...>
 *     ...
 *     <bnl-docked-layout>                
 *       <bnl-y-axis ... dock="left" width="25" margin="0,0,25,0"></bnl-y-axis>
 *       <bnl-x-axis ... dock="bottom" height="25"></bnl-x-axis>                               
 *       <bnl-area ... ></bnl-area>
 *     </bnl-docked-layout>
 *   </bnl-chart>
 * 
 *   The optional dock element can be top, left, right, or bottom.
 *   If multiple items at the same dock position overlap.
 *   You can nest bnl-docked-layout elements to stack element docked to the same side.
 *   
 *   The optional margin element allows spacing around elements.  
 *   Margin behaves like the CSS margin attribute (i.e. TRBL)
 *    
 * 
 * Design Considerations
 * ---------------------
 * Elements are positioned using tranform: translate
 * Width and Height are set on the scope of each child element.
 * Child elements are expected to have isolated scope.
 */
// ================================================================================ //
angular.module('bnlCharts')
.directive('bnlDockedLayout', function () {

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
    }

    return {
        controller: function ($scope, $element, $attrs, $transclude) {

            // I use $scope.$parent to avoid injecting an empty scope for trancluded content.
            $transclude($scope.$parent, function (clone, scope) {
                $element.append(clone);
            });

            $scope.$on('bnl-chart-render', function (event, args) {

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
                                console.warn('The dock attribute "' + dock + '" is not supported by bnl-docked-layout. The element will be treated as undocked.');
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
    }
});
;
angular.module('bnlCharts')
.directive('bnlXAxis', function () {

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

            scope.config = bnlChartCtrl.getConfig();

            scope.$on('bnl-chart-render', function (event, args) {

                var g = element[0];
                var svg = g.ownerSVGElement;


                var xScale = scope.scale.copy();
                xScale.range([0, scope.width]);

                render(g, xScale, scope.ticks, scope.tickFormat);
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
        template: '<g class="axis x-axis"></g>'
    }
});
;
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
                var svg = g.ownerSVGElement;

                var yScale = scope.scale.copy(); // scope.chart.scales[scope.scale].copy();
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
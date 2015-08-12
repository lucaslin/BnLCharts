// ================================================================================ //
/*
 * BnL Charts
 * 
 * D3 charting componentized using Angular directives.
 * 
 * Usage
 * -----
 * HTML:
 * 
 *   <bnl-chart chart-data="chartData" width="1200" height="300">
 *     <bnl-time-scale name="xScale" is-utc="true"></bnl-time-scale>
 *     <bnl-linear-scale name="yScale"></bnl-linear-scale>
 *     <bnl-docked-layout>                
 *       <bnl-y-axis scale="yScale" dock="left" width="25" margin="0,0,25,0"></bnl-y-axis>
 *       <bnl-x-axis scale="xScale" ticks="day" tick-format="%b %d" dock="bottom" height="25"></bnl-x-axis>                               
 *       <bnl-area scale-x="xScale" scale-y="yScale" ></bnl-area>
 *     </bnl-docked-layout>
 *   </bnl-chart>
 * 
 *   The bnl-chart data is bound via the chart-data attribute.
 *   The bnl-chart renders as an SVG element, so you can set properties on the SVG like width and height.
 * 
 *   The scales define the domain/range mapping. 
 *   They do not render anything, but are reference by name to be used by rendering components.
 * 
 *   Choose a layout container for the parts of your chart.  Based on your choice, you can apply different attributes to control layout. 
 *   Ordering parts can be important to layout and z-order of rendering.
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

var bnlCharts = angular.module('bnlCharts', []);

// -------------------------------------------------------------------------------- //
// bnlChart
// -------------------------------------------------------------------------------- //
bnlCharts.directive('bnlChart', function ($timeout) {

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
    }
});

// -------------------------------------------------------------------------------- //
// bnlTimeScale
// -------------------------------------------------------------------------------- //
bnlCharts.directive('bnlTimeScale', function () {

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
    }

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
    }
});

// -------------------------------------------------------------------------------- //
// bnlLinearScale
// -------------------------------------------------------------------------------- //
bnlCharts.directive('bnlLinearScale', function () {

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
    }

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
    }
});

// -------------------------------------------------------------------------------- //
// bnlXAxis
// -------------------------------------------------------------------------------- //
bnlCharts.directive('bnlXAxis', function () {

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
    }
});

// -------------------------------------------------------------------------------- //
// bnlYAxis
// -------------------------------------------------------------------------------- //
bnlCharts.directive('bnlYAxis', function () {

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

// -------------------------------------------------------------------------------- //
// bnlArea
// -------------------------------------------------------------------------------- //
bnlCharts.directive('bnlArea', function () {

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
    }
});

// -------------------------------------------------------------------------------- //
// bnlAbsoluteLayout
// -------------------------------------------------------------------------------- //
bnlCharts.directive('bnlAbsoluteLayout', function () {
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
    }
});

// -------------------------------------------------------------------------------- //
// bnlDockedLayout
// -------------------------------------------------------------------------------- //
bnlCharts.directive('bnlDockedLayout', function () {

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
        },       
        replace: true,
        restrict: 'E',
        scope: {},
        templateNamespace: 'svg',
        template: '<g class="bnl-docked-layout"></g>',
        transclude: true
    }
});


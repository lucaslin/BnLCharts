// Dangle Chart Directive
// This is the top level container for a chart.
var bnlCharts = angular.module('bnlCharts', []);

bnlCharts.directive('bnlChart', function ($timeout) {

    var createXScale = function (width) {
        // I create the X scale
        var x = d3.time.scale();            

        x.ticks(d3.time.day);
        x.tickFormat('%a %d');
        x.range([0, width]);

        return x;
    }

    var createYScale = function (height) {
        var y = d3.scale.linear()
            .range([height, 0]);
        return y;
    }

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
        controller: function ($scope, $element, $attrs, $transclude) {
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
        },
        link: function (scope, element, attrs) {
            console.log('bnlChart link:' + scope.$id);
            $timeout(function () {
                scope.$broadcast('bnl-chart-render');
            },500);
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

bnlCharts.directive('bnlXAxis', function () {

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
        controller: function ($scope) {
            console.log('bnlXAxis controller:' + $scope.$id);
        },
        link: function (scope, element, attrs) {
            console.log('bnlXAxis link:' + scope.$id);

            scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlXAxis render:' + scope.$id);

                var g = element[0];
                var svg = g.ownerSVGElement;

                var x = scope.x ? scope.x : 0;
                var y = scope.y ? scope.y : 0;
                var width = scope.width ? scope.width : svg.clientWidth;
                var height = scope.height ? scope.height : svg.clientHeight;

                d3.select(g).attr({
                    transform: 'translate(' + x + ',' + y + ')'
                });

                renderAxis(g, scope.chart.xScale, width, height);
            });
            
        },
        replace: true,
        restrict: 'E',
        scope: {
            chart: '=',
            x: '=',
            y: '=',
            width: '=',
            height: '='
        },
        templateNamespace: 'svg',
        template: '<g></g>'
    }
});

bnlCharts.directive('bnlYAxis', function () {

    var renderAxis = function (element, yScale, width, height) {

        yScale.range([height, 0]);

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        d3.select(element)
            .attr('class', 'y axis')            
            .call(yAxis);
    };

    return {
        controller: function ($scope) {
            console.log('bnlYAxis controller:' + $scope.$id);
        },
        link: function (scope, element, attrs) {
            console.log('bnlYAxis link:' + scope.$id);

            scope.$on('bnl-chart-render', function (event, args) {

                console.log('bnlYAxis render:' + scope.$id);

                var g = element[0];
                var svg = g.ownerSVGElement;

                var x = scope.x ? scope.x : 0;
                var y = scope.y ? scope.y : 0;
                var width = scope.width ? scope.width : svg.clientWidth;
                var height = scope.height ? scope.height : svg.clientHeight;

                d3.select(g).attr({
                    transform: 'translate(' + x + ',' + y + ')'
                });                
                renderAxis(g, scope.chart.yScale, width, height);
            });
        },
        replace: true,
        restrict: 'E',
        scope: {
            chart: '=',
            x: '=',
            y: '=',
            width: '=',
            height: '='
        },
        templateNamespace: 'svg',
        template: '<g></g>'
    }
});

//bnlCharts.directive('bnlPlot', function ($timeout) {
//    return {
//        controller: function ($scope, $element, $attrs, $transclude) {
//            console.log('bnlPlot controller:' + $scope.$id);

//            // I transclude content manually to avoid creating another scope.
//            // This remove the need for an ng-transclude attribute in the template.
//            // Transclude should be after scope is prepared because it causes link function of children to execute.
//            $transclude($scope, function (clone, scope) {
//                $element.append(clone);
//            });
//        },
//        link: function (scope, element, attrs) {
//            console.log('bnlPlot link:' + scope.$id);           
//        },
//        replace: true,
//        restrict: 'E',
//        scope: false,        
//        template: '<g></g>',
//        transclude: true
//    }
//});

bnlCharts.directive('bnlArea', function () {

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

                var x = scope.x ? scope.x : 0;
                var y = scope.y ? scope.y : 0;
                var width = scope.width ? scope.width : svg.clientWidth;
                var height = scope.height ? scope.height : svg.clientHeight;

                d3.select(g).attr({
                    transform: 'translate(' + x + ',' + y + ')'
                });

                render(g, scope.chart.xScale, scope.chart.yScale, width, height, scope.chart.data);
            });
        },
        replace: true,
        restrict: 'E',
        scope: {
            chart: '=',
            x: '=',
            y: '=',
            width: '=',
            height: '='
        },
        templateNamespace: 'svg',
        template: '<g></g>'
    }
});

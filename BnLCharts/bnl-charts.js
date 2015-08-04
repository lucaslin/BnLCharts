// Dangle Chart Directive
// This is the top level container for a chart.
var bnlCharts = angular.module('bnlCharts', []);

bnlCharts.directive('bnlChart', function ($timeout) {

    var createXScale = function (width) {
        // I create the X scale
        var x = d3.time.scale()
            .range([0, width]);

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
            $scope.svg = svg;

            var xScale = createXScale(svg.clientWidth);
            updateXDomain(xScale, $scope.chartData);
            $scope.xScale = xScale;

            var yScale = createYScale(svg.clientHeight);
            updateYDomain(yScale, $scope.chartData);
            $scope.yScale = yScale;

            // I transclude content manually to avoid creating another scope.
            // This remove the need for an ng-transclude attribute in the template.
            // Transclude should be after scope is prepared because it causes link function of children to execute.
            $transclude($scope, function (clone, scope) {
                $element.append(clone);
            });
        },
        link: function (scope, element, attrs) {
            console.log('bnlChart link:' + scope.$id);
            scope.$broadcast('render-chart');
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
        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');

        d3.select(element)
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);
    };

    return {
        controller: function ($scope) {
            console.log('bnlXAxis controller:' + $scope.$id);
        },
        link: function (scope, element, attrs) {
            console.log('bnlXAxis link:' + scope.$id);

            renderAxis(element[0], scope.xScale, scope.svg.clientWidth, scope.svg.clientHeight);
        },
        replace: true,
        restrict: 'E',
        scope: false,
        templateNamespace: 'svg',
        template: '<g></g>'
    }
});

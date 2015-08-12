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
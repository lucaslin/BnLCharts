var app = angular.module('mainApp', ['bnlCharts']);

app.controller('MainCtrl', ['$scope', function ($scope) {

    var createUtcTimeScale = function (data) {
        var scale = d3.time.scale.utc();
        var minDate = data && data.length > 0 ? new Date((data[0].x)) : new Date();
        var maxDate = data && data.length > 0 ? new Date((data[data.length - 1].x)) : minDate;

        scale.domain([minDate, maxDate]);

        return scale;
    }

    var createLinearScale = function (data) {
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

    var x = function (d, i) {
        return new Date(d.x);
    };

    var y = function (d, i) {
        return d.y;
    };

    var legendLabel = function (d, i) {
        return 'Series ' + (i + 1);
    };

    var legendClass = function (d, i) {
        return 'legend-indicator-' + i;
    }

    var legendColor = function (d, i) {
        if (i == 0) {
            return 'blue';
        }
        else {
            return 'red';
        }
    };

    var data = [
        [
            { x: '2015-01-05', y: 10 },
            { x: '2015-01-06', y: 23 },
            { x: '2015-01-07', y: 7 },
            { x: '2015-01-08', y: 9 },
            { x: '2015-01-09', y: 15 },
            { x: '2015-01-10', y: 4 },
            { x: '2015-01-11', y: 5 },
            { x: '2015-01-12', y: 5 },
            { x: '2015-01-13', y: 5 }
        ],
        [
            { x: '2015-01-05', y: 20 },
            { x: '2015-01-06', y: 13 },
            { x: '2015-01-07', y: 37 },
            { x: '2015-01-08', y: 2 },
            { x: '2015-01-09', y: 45 },
            { x: '2015-01-10', y: 23 },
            { x: '2015-01-11', y: 22 },
            { x: '2015-01-12', y: 21 },
            { x: '2015-01-13', y: 4 }
        ],
        [
            { x: '2015-01-05', y: 81 },
            { x: '2015-01-06', y: 31 },
            { x: '2015-01-07', y: 73 },
            { x: '2015-01-08', y: 54 },
            { x: '2015-01-09', y: 9 },
            { x: '2015-01-10', y: 2 },
            { x: '2015-01-11', y: 23 },
            { x: '2015-01-12', y: 45 },
            { x: '2015-01-13', y: 92 }
        ]
    ];

    $scope.chartConfig = {
        data: data[0],
        legendData: data,
        xScale: createUtcTimeScale(data[0]),
        yScale: createLinearScale(data[0]),
        x: x,
        y: y,
        legendLabel: legendLabel,
        legendColor: legendColor,
        legendClass: legendClass
    };
}]);
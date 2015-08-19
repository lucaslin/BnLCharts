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

    var data = [
     { x: '2015-01-05', y: 10 },
     { x: '2015-01-06', y: 23 },
     { x: '2015-01-07', y: 7 },
     { x: '2015-01-08', y: 9 },
     { x: '2015-01-09', y: 15 },
     { x: '2015-01-10', y: 4 },
     { x: '2015-01-11', y: 5 },
     { x: '2015-01-12', y: 5 },
     { x: '2015-01-13', y: 5 }
    ];

    $scope.chartConfig = {
        data: data,
        xScale: createUtcTimeScale(data),
        yScale: createLinearScale(data),
        x: x,
        y: y
    };
}]);
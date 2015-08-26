var app = angular.module('mainApp', ['bnlCharts']);

app.controller('MainCtrl', ['$scope', function ($scope) {

    function createUtcTimeScaleX(data) {
        var scale = d3.time.scale.utc();
        var minDate = data && data.length > 0 ? new Date((data[0].x)) : new Date();
        var maxDate = data && data.length > 0 ? new Date((data[data.length - 1].x)) : minDate;

        scale.domain([minDate, maxDate]);

        return scale;
    };

    function createLinearScaleY(data) {
        var scale = d3.scale.linear();

        var minY = 0;
        var maxY = 0;

        if (data) {
            minY = d3.min(data, function (d) { return d.y; });
            maxY = d3.max(data, function (d) { return d.y; });
        }

        minY = Math.min(0, minY);
        maxY = Math.max(1, maxY) + 1;

        scale.domain([minY, maxY]);

        return scale;
    };

    function getDateX(d, i) {
        return new Date(d.x);
    };

    function getLegendLabel(d, i) {
        return 'Series ' + (i + 1);
    };


    function getSeriesFill(d, i) {        
        switch (i) {
            case 0:
                //blue
                return 'rgba(33, 133, 197,1)';
            case 2:
                //green
                return 'rgba(45, 197, 3, 1)';
            case 1:
                //orange
                return 'rgba(197, 128, 33, 1)';
            default:
                return 'gray';
        }
    };

    var numberByDateTimeSingleSeries =
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
            ];

    var numberByDateTimeMultipleSeries =
        [
             [
                { x: '2015-01-05', y: 14 },
                { x: '2015-01-06', y: 27 },
                { x: '2015-01-07', y: 11 },
                { x: '2015-01-08', y: 13 },
                { x: '2015-01-09', y: 19 },
                { x: '2015-01-10', y: 8 },
                { x: '2015-01-11', y: 9 },
                { x: '2015-01-12', y: 9 },
                { x: '2015-01-13', y: 9 }
             ],
               [
                { x: '2015-01-05', y: 12 },
                { x: '2015-01-06', y: 25 },
                { x: '2015-01-07', y: 9 },
                { x: '2015-01-08', y: 11 },
                { x: '2015-01-09', y: 17 },
                { x: '2015-01-10', y: 6 },
                { x: '2015-01-11', y: 7 },
                { x: '2015-01-12', y: 7 },
                { x: '2015-01-13', y: 7 }
               ],
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
            ]
        ];



    $scope.numberByDateTimeSingleSeriesConfig = {
        data: numberByDateTimeSingleSeries,
        xScale: createUtcTimeScaleX(numberByDateTimeSingleSeries),
        yScale: createLinearScaleY(numberByDateTimeSingleSeries),
        x: getDateX,
        legendLabel: getLegendLabel,
        legendColor: getSeriesFill,
        getSeriesFill: getSeriesFill
    };

    $scope.numberByDateTimeMultipleSeriesConfig = {
        data: numberByDateTimeMultipleSeries,
        xScale: createUtcTimeScaleX(numberByDateTimeMultipleSeries[0]),
        yScale: createLinearScaleY(numberByDateTimeMultipleSeries[0]),
        x: getDateX,
        legendLabel: getLegendLabel,
        legendColor: getSeriesFill,
        getSeriesFill: getSeriesFill
    };











}]);
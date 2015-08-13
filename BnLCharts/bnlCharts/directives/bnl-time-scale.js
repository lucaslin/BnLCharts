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
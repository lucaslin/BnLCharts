angular.module('bnlCharts')
.directive('bnlLinearScale', [function () {

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
    };

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
    };
}]);
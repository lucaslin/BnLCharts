angular.module('bnlCharts')
.directive('bnlArea', function () {

    function defaultGetX(d, i)
    {
        if (d.x)
            return d.x;
        else
            return d;
    }

    function defaultGetY(d, i) {
        if (d.y)
            return d.y;
        else
            return d;
    }

    function defaultScale(value) {
        return value;
    }

    function defaultGetSeriesFill(d, i) {
        return 'gray';
    }

    function hasMultipleSeries(data) {
        return data && Array.isArray(data) && data.length > 0 && Array.isArray(data[0]);
    }    

    var render = function (data, getX, getY, element, scaleX, scaleY, getSeriesFill, width, height) {

        getX = getX ? getX : defaultGetX;
        getY = getY ? getY : defaultGetY;
        scaleX = scaleX ? scaleX : defaultScale;
        scaleY = scaleY ? scaleY : defaultScale;
        getSeriesFill = getSeriesFill ? getSeriesFill : defaultGetSeriesFill;

        var area = d3.svg.area()
            .x(function (d,i) { return scaleX(getX(d,i)); })
            .y0(height)
            .y1(function (d, i) { return scaleY(getY(d,i)); })
             .interpolate("linear");

        var select = d3.select(element).selectAll('.area').data(data);

        var dataHasMultipleSeries = hasMultipleSeries(data);       

        select.enter()
            .append("path")
            .classed("area-path", true)
            .attr(
            {
                d: dataHasMultipleSeries ? function (d) { return area(d); } : area(data),
                width: width,
                height: height,
                fill: dataHasMultipleSeries ? function (d, i) { return getSeriesFill(d, i); } : getSeriesFill(data, 0)
            });
    };

    return {
        link: function (scope, element, attrs, bnlChartCtrl) {

            scope.config = bnlChartCtrl.getConfig();

            scope.$on('bnl-chart-render', function (event, args) {

                var g = element[0];
                var svg = g.ownerSVGElement;

                var scaleX = scope.scaleX.copy(); 
                scaleX.range([0, scope.width]);

                var scaleY = scope.scaleY.copy();
                scaleY.range([scope.height, 0]);

                var data = scope.data;                

                render(data, scope.getX, scope.getY, g, scaleX, scaleY, scope.getSeriesFill, scope.width, scope.height);
            });
        },
        replace: true,
        restrict: 'E',
        require: '^bnlChart',
        scope: {
            data: '=',
            scaleX: '=',
            scaleY: '=',
            getX: '=',
            getY: '=',
            getSeriesFill: '='
        },
        templateNamespace: 'svg',
        template: '<g class="area"></g>'
    }
});
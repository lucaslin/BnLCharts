angular.module('bnlCharts')
.factory("bnlMeasureTextService", [function () {      

    return {
        // measures the text on a hidden SVG element with the supplied class name
        // return {width:,height:}
        measureSvgText: function (text, className) {
            if (!text || text.length === 0) {
                return { width: 0, height: 0 };
            }

            var svg = d3.select('body').append('svg');

            if (className) {
                svg.attr('class', className);
            }

            svg.append('text').attr({ x: -1000, y: -1000 }).text(text);

            var bounds = svg.node().getBBox();
            svg.remove();

            return { width: bounds.width, height: bounds.height };
        }
    };
}]);
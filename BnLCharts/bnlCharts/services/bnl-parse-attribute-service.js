angular.module('bnlCharts')
.factory("bnlParseAttributeService", [function () {

    return {
        parseMargin: function (text) {
            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            };

            if (text) {

                var parts = text.split(',');

                switch (parts.length) {
                    case 1:
                        var marginAll = Number(parts[0]);
                        if (!isNaN(marginAll)) {
                            margin.top = marginAll;
                            margin.right = marginAll;
                            margin.bottom = marginAll;
                            margin.left = marginAll;
                        }
                        break;
                    case 2:
                        var marginTopBottom = Number(parts[0]);
                        var marginLeftRight = Number(parts[1]);

                        if (!isNaN(marginTopBottom)) {
                            margin.top = marginTopBottom;
                            margin.bottom = marginTopBottom;
                        }

                        if (!isNaN(marginLeftRight)) {
                            margin.right = marginLeftRight;
                            margin.left = marginLeftRight;
                        }
                        break;
                    case 3:
                        var marginTop = Number(parts[0]);
                        var marginLeftRight = Number(parts[1]);
                        var marginBottom = Number(parts[2]);

                        if (!isNaN(marginTop)) {
                            margin.top = marginTop;
                        }

                        if (!isNaN(marginLeftRight)) {
                            margin.right = marginLeftRight;
                            margin.left = marginLeftRight;
                        }

                        if (!isNaN(marginBottom)) {
                            margin.bottom = marginBottom;
                        }

                        break;
                    default:

                        if (parts.length >= 4) {

                            var marginTop = Number(parts[0]);
                            var marginRight = Number(parts[1]);
                            var marginBottom = Number(parts[2]);
                            var marginLeft = Number(parts[3]);

                            if (!isNaN(marginTop)) {
                                margin.top = marginTop;
                            }

                            if (!isNaN(marginRight)) {
                                margin.right = marginRight;
                            }

                            if (!isNaN(marginBottom)) {
                                margin.bottom = marginBottom;
                            }

                            if (!isNaN(marginLeft)) {
                                margin.left = marginLeft;
                            }
                        }

                        break;
                }
            }

            return margin;
        }       
    };
}]);
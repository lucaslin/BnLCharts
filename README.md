# BnLCharts

BnlCharts is a javascript library providing AngularJS directives that componentize D3.  It provides directives for basic charts, cartesian axes, and legends.  It also provides directives for absolute and docked positioning of chart directives.

The Challenge
===
D3 is an awesome and powerful Javascript library.  It provides a fluent API (akin to jQuery) that allows developers to build almost any visualization of data.  The power of D3 comes through functional composition of transformation.  Features like scales, data/datum, identity and the enter/update/exit pattern use functions to access and transform data.

However, building real-world charts with D3 often leads to a blob of boilerplate code with a sprinkling of custom callback implementations.  Layout, domain, and range calculations are often hard-coded and become brittle math within the chart.

What is needed is a good way to separate the concerns of the D3 call structure, general layout calculations, and the specific transformation callbacks.  This 


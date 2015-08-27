# BnLCharts

BnlCharts is a javascript library providing AngularJS directives that componentize D3.  It provides directives for basic charts, cartesian axes, and legends.  It also provides directives for absolute and docked positioning of chart directives.

It is unlike/better than other D3 libraries because you can compose your charts in HTML and bind back to your data and transformation functions.

The Challenge
===
D3 is an awesome and powerful Javascript library.  It provides a fluent API (akin to jQuery) that allows developers to build almost any visualization of data.  The power of D3 comes through functional composition of transformations.  Features like scales, data/datum, identity and the enter/update/exit pattern use functions to access and transform data.

However, building real-world charts with D3 often leads to a blob of boilerplate code with a sprinkling of custom callback implementations.  Layout, domain, and range calculations are often hard-coded, brittle math.

What is needed is a good way to separate the concerns of the D3 call structure, general layout calculations, and the specific transformation callbacks.  Visual componentization provides both separation of concerns and re-use.  The challenge is to provide a declarative system in HTML without losing the functional power of D3.  Most wrappers around D3 remain functional, but cleave off most of the power of D3 by over-encapsulating and forcing callers to populate a large options structure.

This Solution
===
BnlCharts is pretty new (started 8/15) and still has a lot of maturing to do.  I think it has a novel and better approach given where D3 and Angular are today.  Technology shifts make make this library unnecessary, however I consider it an interesting design pattern for building a declarative system on top of a functional system.

Here's how this thing works.  There are some prerequisites for developers: A basic understanding of Angular and D3 are required to use BnlCharts, a much deeper understanding of D3 is required to build custom directives.

The <bnl-chart> directive puts an <svg> element on the page.  It has isolated scope so that charts don't interfere with one another.  It uses transclusion so that you can just put other directives inside it without having to modify it's template.  Once everything is linked, it broadcasts a couple of events: 'bnl-chart-prepare-data' and 'bnl-chart-render'.  It has one scope-bound attribute: config.  This attribute is where you provide an object containing your data and any transformation functions (like scale, color selection, etc.).

Within the <bnl-chart> directive you put other directives such as <bnl-area>, <bnl-x-axis>, etc.  Each part template is rooted with an SVG <g> element and has isolated scope.  Each part also defines their own scope-bound attributes.  For example, <bnl-x-axis> has a scale attribute where you can provide the D3 scale function.  Part directives will ensure that the config is available on scope for you to bind against. Parts often have other optional attributes that help you control aspects of how it is rendered.  For example: <bnl-x-axis> has a ticks attribute that lets you tell it what interval you want the ticks on.  

There are also layout directives such as <bnl-absolute-layout> and <bnl-docked-layout>.  Like <bnl-chart>, these directives use transclusion so that you can put other directives within them.  They enumerate their children and look for specfic layout attributes.  For example, <bnl-absolute-layout> looks for x, y, width, and height attributes. The layout directives use transform: translate(x,y) to position their children and set the their scope.width and scope.height.  Now each child directive can just draw within their bounds.





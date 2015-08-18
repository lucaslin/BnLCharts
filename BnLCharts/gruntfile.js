module.exports = function (grunt) {
    var jsSrc = [
        'bnlCharts/bnl-charts.js',
        'bnlCharts/directives/*.js'
    ];

    var distSrc = {
        js: 'dist/js/',
        css: 'dist/css/'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            debug: {
                options: {
                    stripBanners: {
                        block: true,
                        line: true
                    },
                    separator: grunt.util.linefeed + ';' + grunt.util.linefeed,
                },
                src: jsSrc,
                dest: distSrc.js + 'bnl-charts.dist.js'
            },
            prod: {
                options: {
                    stripBanners: false,
                    separator: ';',
                },
                src: jsSrc,
                dest: distSrc.js + 'bnl-charts.prod.dist.js'
            }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            prod: {
                src: distSrc.js + 'bnl-charts.prod.dist.js',
                dest: distSrc.js + 'bnl-charts.dist.min.js'
            }
        },

        clean: {
            prod: [distSrc.js + 'bnl-charts.prod.dist.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['concat:debug']);
    grunt.registerTask('prod', ['concat:prod', 'uglify', 'clean']);
};
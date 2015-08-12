module.exports = function (grunt) {
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
                src: [
                    'js/app/bnl-charts.js',
                    'js/app/*.js',
                    '!js/app/app.js'
                ],
                dest: 'js/app/dist/bnl-charts.dist.js'
            },
            prod: {
                options: {
                    stripBanners: false,
                    separator: ';',
                },
                src: [
                   'js/app/bnl-charts.js',
                   'js/app/*.js',
                   '!js/app/app.js'
                ],
                dest: 'js/app/dist/bnl-charts.prod.dist.js'
            }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            prod: {
                src: 'js/app/dist/bnl-charts.prod.dist.js',
                dest: 'js/app/dist/bnl-charts.dist.min.js'
            }
        },

        clean: {
            prod: ['js/app/dist/bnl-charts.prod.dist.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['concat:debug']);
    grunt.registerTask('prod', ['concat:prod', 'uglify', 'clean']);
    //grunt.registerTask('prod', ['concat:prod']);
};
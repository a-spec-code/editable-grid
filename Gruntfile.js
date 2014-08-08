module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('./package.json'),
        watchify: {
            dist: {
                src: './lib/demo-bootstrap.js',
                dest: './public/bootstrap-booty-grid.js',
                options: {
                    callback: function (b) {
                        b.transform('hamlify-js');
                        return b;
                    }
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8002,
                    base: 'public'
                }
            }
        },
        simplemocha: {
            options: {
                timeout: 2000,
                ui: 'bdd',
                reporter: 'spec'
            },
            all: {
                src: ['test/**/*.js']
            }
        },
        jshint2: {
            options: {
                jshintrc: '.jshintrc',
                force: false,
                cache: true,
                reporter: 'default',
                globals: {
                    module: true,
                    require: true,
                    it: true,
                    describe: true,
                    beforeEach: true,
                    afterEach: true,
                    global: true,
                    window: true
                }
            },
            all: ['index.js', 'Gruntfile.js', 'test/**/*.js', 'lib/**/*.js']
        },
        watch: {
            files: './less/grid.less',
            tasks: ['less']
        },
        less: {
            development: {
                files: {
                    'public/grid.css': './less/grid.less'
                }
            },
            production: {
                options: {
                    compact: true
                },
                files: {
                    './public/dist/booty_grid.min.css': './less/grid.less'
                }
            }
        },
        browserify: {
            dist: {
                dest: './dist/booty_grid.js',
                src: ['./lib/grid.js'],
                options: {
                    bundleOptions: {
                        standalone: 'BootyGrid'
                    },
                    transform: [ require('hamlify-js')]
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            production: {
                files: {
                    './public/dist/booty_grid.min.js': ['./dist/booty_grid.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-jshint2');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-watchify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');


    grunt.registerTask('default', ['watchify', 'less:development', 'connect', 'watch']);
    grunt.registerTask('test', ['simplemocha']);
    grunt.registerTask('lint', ['jshint2']);
    grunt.registerTask('build', [
        'watchify',
        'less:development',
        'browserify',
        'uglify:production',
        'less:production'
    ]);

};

var fs   = require('fs')
    sass = require('component-sass');



module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
              '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
              '<%= pkg.homepage ? "* " + pkg.homepage : "" %>\n' +
              '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
              ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n\n',

      minibanner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                  '<%= grunt.template.today("yyyy-mm-dd") %> - ' +
                  '<%= pkg.homepage ? "* " + pkg.homepage + " - " : "" %>' +
                  'Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                  ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */ '
    },
    uglify: {
      options: {
        banner: '<%= meta.minibanner %>\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    cssmin: {
      compress: {
        options: {
          keepSpecialComments: 0,
          banner: '<%= meta.minibanner %>\n'
        },
        files: {
          "build/<%= pkg.name %>.min.css": ["build/<%= pkg.name %>.css"]
        }
      }
    },
    component_build: {
      "ui-select": {
        output: './build/',
        styles: true,
        scripts: true,
        verbose: true,
        configure: function(builder) {
          builder.use(sass);
        }
        // , noRequire: true
      }
    },
    watch: {
      files: ['index.js', 'templates/*.html', 'index.scss', 'Gruntfile.js'],
      tasks: ['component_build', 'uglify', 'cssmin']
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-component-build');

  // Default task(s).
  grunt.registerTask('default', ['component_build', 'uglify', 'cssmin']);
  // grunt.registerTask('watch', ['watch']);

};
// gulpfile.js
var gulp = require('gulp'),
	imagemin = require('gulp-imagemin'), //图片压缩装置1
	pngquant = require('imagemin-pngquant'),  //图片深度压缩装置
	tinypng = require('gulp-tinypng-nokey'), //图片压缩装置2
	htmlmin = require('gulp-htmlmin'),     //html文件压缩装置
	uglify = require('gulp-uglify'),       //js文件压缩装置
	cleanCSS = require('gulp-clean-css'),  //css文件压缩装置
	babelES = require('gulp-babel'),  //es6编译装置
	cache = require('gulp-cache');    //智能读取缓存装置
var browserSync = require('browser-sync').create();  //浏览器实时刷新装置
var reload = browserSync.reload;       

//建立
// gulp.task('imgmin', function () {
  // return gulp.src('src/images*/**/*.{png,jpg,gif,ico}')
  // .pipe(cache(imagemin({
            // progressive: true,   //无损压缩
			// use: [pngquant()]   //使用pngquant深度压缩png图片的imagemin插件
        // })))
  // .pipe(gulp.dest('dist'));
// })
gulp.task('imgmin', function () {
  return gulp.src('src/images*/**/*')
  .pipe(tinypng())    //更屌的图片压缩！
  .pipe(gulp.dest('dist'));
})
gulp.task('html', function () {
	var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
  return gulp.src('src/**/*.html')
  .pipe(htmlmin(options))
  .pipe(gulp.dest('dist'));
})
gulp.task('js', function() {
   return gulp.src('src/script*/*.js')
		.pipe(babelES({  
      presets: ['es2015']  
    }))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});
gulp.task('css', function() {
  return  gulp.src('src/style*/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist'));
});
gulp.task('config', function() {
  return  gulp.src('src/config*/*.js')
        .pipe(gulp.dest('dist'));
});
gulp.task('lib', function() {
  return  gulp.src('src/lib*/**')
        .pipe(gulp.dest('dist'));
});
gulp.task('fonts', function() {
  return  gulp.src('src/fonts*/*')
        .pipe(gulp.dest('dist'));
});
gulp.task('build', ['imgmin', 'html','js','css','config','lib','fonts']);

//自动刷新
// gulp.task('imgmin:auto', function () {
  // return gulp.src('src/images*/**/*.{png,jpg,gif,ico}')
  // .pipe(cache(imagemin({
            // progressive: true,   //无损压缩
			// use: [pngquant()]   //使用pngquant深度压缩png图片的imagemin插件
        // })))
  // .pipe(gulp.dest('dist'))
  // .pipe(reload({stream: true}));
// })
gulp.task('imgmin:auto', function () {
  return gulp.src('src/images*/**/*')
  pipe(cache(tinypng()))    //更屌的图片压缩！
  .pipe(gulp.dest('dist'))
  .pipe(reload({stream: true}));
})
gulp.task('html:auto', function () {
	var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
  return gulp.src('src/**/*.html')
  .pipe(htmlmin(options))
  .pipe(gulp.dest('dist'))
  .pipe(reload({stream: true}));
})
gulp.task('js:auto', function() {
   return gulp.src('src/script*/*.js')
		.pipe(babelES({  
      presets: ['es2015']  
    }))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
		.pipe(reload({stream: true}));
});
gulp.task('css:auto', function() {
  return  gulp.src('src/style*/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist'))
		.pipe(reload({stream: true}));
});
gulp.task('config:auto', function() {
  return  gulp.src('src/config*/*.js')
        .pipe(gulp.dest('dist'))
		.pipe(reload({stream: true}));
});
gulp.task('lib:auto', function() {
  return  gulp.src('src/lib*/**')
        .pipe(gulp.dest('dist'))
		.pipe(reload({stream: true}));
});
gulp.task('fonts:auto', function() {
  return  gulp.src('src/fonts*/*')
        .pipe(gulp.dest('dist'))
		.pipe(reload({stream: true}));
});
gulp.task('auto', ['imgmin:auto', 'html:auto','js:auto','css:auto','config:auto','lib:auto','fonts:auto'] , function () {
	browserSync.init({
		server: {
			baseDir: "./dist"
		},
		notify: false
	})
    // 监听文件修改，当文件被修改则执行
	gulp.watch('src/**/*.html', ['html:auto']);
    gulp.watch('src/script*/*.js', ['js:auto']);
    gulp.watch('src/style*/*.css', ['css:auto']);
	gulp.watch('src/config*/*.js', ['config:auto']);
	gulp.watch('src/lib*/*', ['lib:auto']);
	gulp.watch('src/fonts*/*', ['fonts:auto']);
	gulp.watch('src/images*/**/*.{png,jpg,gif,ico}', ['imgmin:auto']);
});


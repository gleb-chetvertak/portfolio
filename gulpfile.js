var gulp = require('gulp'),
	sass = require('gulp-sass'),
	gcmq = require('gulp-group-css-media-queries'),
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglifyjs'),
	cssnano = require('gulp-cssnano'),
	rename = require('gulp-rename'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	imageminJpegRecompress = require('imagemin-jpeg-recompress'),
	pngquant = require('imagemin-pngquant'),
	cache = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function(){
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({outputStyle: "expanded"}).on('error', sass.logError))
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
	.pipe(gcmq())
	.pipe(gulp.dest('app/css'));
});

gulp.task('scripts', function(){
	return gulp.src([
		'app/libs/fontawesome/fontawesome.min.js',
		'app/libs/jquery/jquery-3.2.1.min.js'
		])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

gulp.task('css-libs', ['sass'], function(){
	return(gulp.src('app/css/libs.css'))
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('app/css'));
});

gulp.task('mainmincss', ['sass'], function(){
	return gulp.src('app/css/main.css')
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function(){
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

//For php
//
// gulp.task('browser-sync', function(){
// 	browserSync({
// 		proxy: 'animals.loc',
// 		notify: false
// 	});
// });

gulp.task('clean', function(){
	return del.sync('dist');
})

// gulp.task('img', function(){
// 	return gulp.src('app/img/**/*')
// 	.pipe(imagemin([
// 		imagemin.gifsicle({interlaced: true}),
//     	imagemin.jpegtran({progressive: true}),
//     	imagemin.optipng({optimizationLevel: 5}),
//     	imagemin.svgo({plugins: [{removeViewBox: true}]})
// 	]))
// 	.pipe(gulp.dest('dist/img'));
// });

gulp.task('img', function() {
  return gulp.src('app/img/**/*')
    .pipe(cache(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imageminJpegRecompress({
        loops: 5,
        min: 65,
        max: 70,
        quality:'medium'
      }),
      imagemin.svgo(),
      imagemin.optipng({optimizationLevel: 3}),
      pngquant({quality: '65-70', speed: 5})
    ],{
      verbose: true
    })))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function(){
	gulp.watch('app/sass/**/*.sass', ['mainmincss']);
	gulp.watch('app/*.html', browserSync.reload);
	// gulp.watch('app/**/*.php', browserSync.reload);
	// gulp.watch('app/**/*.css', browserSync.reload);
	gulp.watch('app/**/*.js', browserSync.reload);
});

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function(){

	var buildcss = gulp.src([
		'app/css/main.min.css',
		'app/css/libs.min.css'
		])
	.pipe(gulp.dest('dist/css'));

	var buildfonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'));

	var buildjs = gulp.src('app/js/**/*')
	.pipe(gulp.dest('dist/js'));

	var buildhtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));

	// var buildphp = gulp.src('app/**/*.php')
	// .pipe(gulp.dest('dist'));
});

gulp.task('clear', function(){
	return cache.clearAll();
});

gulp.task('default', ['watch']);
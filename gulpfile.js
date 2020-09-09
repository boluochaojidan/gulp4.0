var gulp = require('gulp'),
htmlMin = require('gulp-htmlmin'),
fileinclude = require('gulp-file-include'),
changed = require('gulp-changed'),
browserSync = require('browser-sync').create(),
del = require('del'),
gulpPath = require('path'),
plumber = require('gulp-plumber'),
uglify = require('gulp-uglify'),
gulpWebpack = require('webpack-stream'),
cleanCSS = require('gulp-clean-css'),
webpackConfig = require('./webpack.config'),
named = require('vinyl-named'),
sass = require('gulp-sass'),
imagemin = require('gulp-imagemin'),
preprocess = require('gulp-preprocess'),
cache = require('gulp-cache'),
clean = require('gulp-clean'),
spritesmith = require('gulp.spritesmith'),
proxyMiddleware = require('http-proxy-middleware'),
cdn = require("gulp-cdn");

const env = process.env.NODE_ENV
const mycase = (env === 'prod' || env === 'test') ? 1 : 0;

let target = 'dev'
switch (env) {
  case 'prod':
    target = 'dist'
    break;
  case 'test':
    target = 'test'
    break;
  default:
    target = 'dev'
}
console.log('当前环境：'+ env + '对应打包地址：'+ target)

gulp.task('htmlMin', function () {
  var options = {
    removeComments: false, //清除HTML注释
    collapseWhitespace: false, //压缩HTML
    collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    minifyJS: true, //压缩页面JS
    minifyCSS: true //压缩页面CSS
  };
  if (Number(mycase) === 1) {
    return gulp.src(['src/**/*.html', '!src/include/**.html'])
      .pipe(plumber())
      .pipe(preprocess({
        context: {
          // 此处可接受来自调用命令的 NODE_ENV 参数，默认为 development 开发测试环境
          NODE_ENV: target
        }
      }))
      .pipe(fileinclude({
        prefix: '@@', //引用符号
        basepath: './src/include', //引用文件路径
        indent: true //保留文件的缩进
      }))
      .pipe(cdn([{
        domain: "{{cdn}}",
        cdn: './'
      }]))
      .pipe(htmlMin(options))
      .pipe(gulp.dest(target))
  } else {
    return gulp.src(['src/**/*.html', '!src/include/**.html'])
      .pipe(changed('dev'))
      .pipe(plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
      }}))
      .pipe(preprocess({
        context: {
          // 此处可接受来自调用命令的 NODE_ENV 参数，默认为 development 开发测试环境
          NODE_ENV: target
        },
      }))
      .pipe(fileinclude({
        prefix: '@@', //引用符号
        basepath: './src/include', //引用文件路径
        indent: true //保留文件的缩进
      }))
      .pipe(cdn([{
        domain: "{{cdn}}",
        cdn: '.'
      }]))
      .pipe(htmlMin(options))
      .pipe(gulp.dest('dev'))
      .pipe(browserSync.reload({ //内容更改则触发reload
        stream: true
      }));
  }
});

//使用rev替换成md5文件名，这里包括html和css的资源文件也一起
gulp.task('rev', function() {
  //html，针对js,css,img
  return gulp.src([`${target}/rev/**/*.json`,`${target}/**/*.html`])
      .pipe(revCollector({replaceReved:true }))
      .pipe(gulp.dest(target));
});

//把css任务更改一下
gulp.task('sass', function () {
  if (Number(mycase) === 1) {
    return gulp.src('src/styles/**/*.scss') //css文件后缀改为scss 这个是必须的。
      .pipe(plumber())
      .pipe(sass()) //增加这行
      .pipe(cleanCSS())
      .pipe(rev())
      .pipe(gulp.dest(`${target}/css`))
      .pipe(rev.manifest('rev-css-manifest.json'))
      .pipe(gulp.dest(`${target}/rev`))
  } else {
    return gulp.src('src/styles/**/*.scss') //css文件后缀改为scss 这个是必须的。
      .pipe(plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
      }}))
      .pipe(changed('dev/css'))
      .pipe(sass()) //增加这行
      .pipe(cleanCSS())
      .pipe(gulp.dest('dev/css'))
      .pipe(browserSync.reload({
        stream: true
      }));
  }
});

gulp.task('libCss', function () {
  if (Number(mycase) === 1) {
    return gulp.src(['src/styles/lib/**/*.css'])
      .pipe(plumber())
      .pipe(cleanCSS())
      .pipe(gulp.dest(`${target}/css/lib`))
  } else {
    return gulp.src(['src/styles/lib/**/*.css'])
      .pipe(changed('dev/css/lib/**/'))
      .pipe(plumber())
      .pipe(cleanCSS())
      .pipe(gulp.dest(`${target}/css/lib`))
      .pipe(browserSync.reload({
          stream: true
      }));
  }
});

gulp.task('imageMin', function () {
  if (Number(mycase) === 1) {
    return gulp.src('src/images/**/*.{png,jpg,gif,jpeg,ico}')//后缀都用小写，不然不识别
      .pipe(plumber())
      .pipe(
        cache(
          imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
          })
        )
      )
      .pipe(gulp.dest(`${target}/images`))
  } else {
    return gulp.src('src/images/**/*.{png,jpg,gif,jpeg,ico}')//后缀都用小写，不然不识别
      .pipe(changed('dev/images/**/'))
      .pipe(plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
      }}))
      .pipe(
        cache(
          imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
          })
        )
      )
      .pipe(gulp.dest('dev/images'))
      .pipe(browserSync.reload({
        stream: true
      }));
  }
});

gulp.task('uglifyJs', function () {
  if (Number(mycase) === 1) {
    return gulp.src(['src/js/**/**/*.js', '!src/js/lib/**/*.js'])
      .pipe(plumber())
      .pipe(named(function(file) {
      return file.relative.slice(0, -gulpPath.extname(file.path).length)
      }))
      .pipe(gulpWebpack(webpackConfig))
      .pipe(uglify({
              compress: {
                  drop_console: true,  // 过滤 console
                  drop_debugger: true  // 过滤 debugger
              }
            })) //加入uglify()的处理
      .pipe(rev())
      .pipe(gulp.dest(`${target}/js`))
      .pipe(rev.manifest('rev-js-manifest.json'))
      .pipe(gulp.dest(`${target}/rev`))
  } else {
    return gulp.src(['src/js/**/**/*.js', '!src/js/lib/**/*.js'])
      .pipe(changed('dev/js'))
      .pipe(plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
      }}))
      .pipe(named(function(file) {
      return file.relative.slice(0, -gulpPath.extname(file.path).length)
      }))
      .pipe(gulpWebpack(webpackConfig))
      .pipe(uglify()) //加入uglify()的处理
      .pipe(gulp.dest('dev/js'))
      .pipe(browserSync.reload({
        stream: true
      }));
  }
});

//处理
gulp.task('libJs', function () {
  if (Number(mycase) === 1) {
    return gulp.src(['src/js/lib/**/*.js'])
      .pipe(plumber())
      .pipe(gulp.dest(`${target}/js/lib`))
      .pipe(browserSync.reload({
          stream: true
      }));
  } else {
    return gulp.src(['src/js/lib/**/*.js'])
      .pipe(changed(`dev/js/lib/*`))
      .pipe(plumber())
      .pipe(gulp.dest(`dev/js/lib`))
      .pipe(browserSync.reload({
          stream: true
      }));
  }
});

gulp.task("clean", function () {
  return gulp.src((Number(mycase) === 1 ? target : 'dev'), {allowEmpty: true})
    .pipe(clean());
});

var middleware = proxyMiddleware.createProxyMiddleware('/api', {
    //target: 'http://10.0.0.38',
    target: 'http://api.yyykkk.com:88',
    changeOrigin: true,
    pathRewrite: {
      '^/api': ''
    },
    logLevel: 'debug'
});

// 监听任务
gulp.task('watch', function () {
  // 建立浏览器自动刷新服务器
  browserSync.init({
    server: {
      // livereload: true,
      baseDir: "dev", // 设置服务器的根目录
      middleware: middleware
    },
    notify: false, //禁用浏览器的通知元素
    port: 4000,
  });

  var watchHtml = gulp.watch('src/**/**/*.html', gulp.series('htmlMin'));
  var watchCss = gulp.watch('src/styles/**/*.scss',  gulp.series('sass')); //这一块的监听需要把后缀改为scss
  var watchLibJs = gulp.watch('src/js/lib/**/*.js', gulp.series('libJs'));
  var watchJs = gulp.watch('src/js/**/*.js', gulp.series('uglifyJs'));
  var watchImg = gulp.watch('src/images/**/*', gulp.series('imageMin'));
  var watchSprite = gulp.watch('src/images/icons/**/*', gulp.series('sprite'));

  watchHtml.on('unlink', function(path) {
    del('dev/' + gulpPath.basename(path));
  });

  watchCss.on('unlink', function(path) {
    var cssName = gulpPath.basename(path).split('.scss')[0]
    del('dev/css/' + cssName + '.css');
  });

  watchImg.on('unlink', function(path) {
    del('dev/images/**/' + gulpPath.basename(path));
  });
  
  watchLibJs.on('unlink', function (path) {
    del('dev/js/lib/**/' + gulpPath.basename(path));
  });

  watchJs.on('unlink', function(path) {
    del('dev/js/**/' + gulpPath.basename(path));
  });

  watchSprite.on('unlink', function(path) {
    del('dev/images/icons/**/' + gulpPath.basename(path));
  });

});

gulp.task('sprite',function(){
   return gulp.src('src/images/icons/*.png')  //合成雪碧图的图片文件在images文件夹里，*表示所有png图片
      .pipe(spritesmith({
          imgName: 'sprite.png',  //合成后的图片命名
          cssName: 'sprite.css',  //合成后的图标样式
          padding: 5,  //雪碧图中两图片的间距
          algorithm: 'binary-tree',  //分为top-down、left-right、diagonal、alt-diagonal、binary-tree（可实际操作查看区别）
          cssTemplate: function (data) {
            var arr=[];
            data.sprites.forEach(function(sprite) {
              arr.push(".icon-"+sprite.name+
              "{" + "background-image: url('"+sprite.escaped_image+"');"+
              "background-size:"+(parseFloat(sprite.px.total_width) * 0.01)+"rem "+(parseFloat(sprite.px.total_height) * 0.01)+"rem;"+
              "background-position: "+(parseFloat(sprite.px.offset_x) * 0.01)+"rem "+(parseFloat(sprite.px.offset_y) * 0.01)+"rem;"+
              "width:"+(parseFloat(sprite.px.width) * 0.01)+"rem;"+
              "height:"+(parseFloat(sprite.px.height) * 0.01)+"rem;"+
              "}\n");
            });
            return arr.join("");
          }
      }))
      .pipe(gulp.dest(`${target}/css`)); // 图片、样式输出到该文件夹

});

gulp.task('default', gulp.series('clean', gulp.parallel('libJs', 'uglifyJs', 'sass', 'libCss', 'htmlMin', 'sprite', 'imageMin'), 'watch'));

gulp.task('test', gulp.series('clean', gulp.parallel('libJs', 'uglifyJs', 'sass', 'libCss', 'htmlMin', 'sprite', 'imageMin'), 'rev'));

gulp.task('build', gulp.series('clean', gulp.parallel('libJs', 'uglifyJs', 'sass', 'libCss', 'htmlMin', 'sprite', 'imageMin'), 'rev'));

//设置全局变量
var winHeight = $(document).height();
var winWidth = $(document).width();

//像素自适应
function changeFont(){
    winWidth = $(window).width();
    var fontSize;
    if (winWidth < 1920) {
        fontSize = winWidth / 19.2 + "px";
        $("html").css("font-size", fontSize);
    }else{
        fontSize = 100+"px";
        $("html").css("font-size", fontSize);
    }
}

$(window).ready(function () {

    //像素自适应
    changeFont();

    //实时监听屏幕尺寸变化
    window.onresize = function(){
        //监听字体改变
        changeFont(); 
    };

   //标签内自定义样式
    setClass(["s-width","s-marginTop","s-margin"],["width","margin-top","margin"]);
    function setClass(selfStyle,style){
        var attred = "";
        for(var map in selfStyle){
            if (style[map]!=null) {
                attred = "[" +selfStyle[map]+ "]";
                $(attred).each(function(){
                    $(this).css(style[map],$(this).attr(selfStyle[map]));
                    $(this).removeAttr(selfStyle[map]);
                });
            }
        }
    }

    // $(".header-nav li").click(function(){
    //     if(!$(this).hasClass("active")){
    //         $(this).addClass("active");
    //         $(this).siblings("li").removeClass("active");
    //     }
    // });


});
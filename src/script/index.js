// 首页
var wrapWidth = $(".wrap-box").width()/4;
var item = 0;
var isScroll = true;

$(window).ready(function () {

    changeActive(item);

    // 点击轮播切换按钮
    $(".wrap-box ol li").each(function(index,element){
        $(element).click(function(){
            if (index!=item) {
                changeActive(index);
                $(".index-wrap").eq(item).animate({opacity:0},300,function(){
                    $(this).css("z-index",10);
                    item=index;
                    $(".index-wrap").eq(item).animate({opacity:1},500,function(){
                        $(this).css("z-index",100);
                    })
                    liActive(item)
                })
            }
        });
    });
});


// 鼠标向下滚动
function bottomScroll(){
    if (!$(".index-wrap *").is(":animated")) {
        changeActive(item);
        $(".index-wrap").eq(item).animate({opacity:0},300,function(){
            $(this).css("z-index",10);
            $(this).removeClass("active")
            if (item==4) {
                item=-1
            }
            $(".index-wrap").eq(item+1).animate({opacity:1},500,function(){
                $(this).css("z-index",100);
                $(this).addClass("active")
                item++;
                isScroll = true;
                olActive()
            })
            liActive(item+1)
        });
    }
}

// 鼠标向上滚动
function topScroll(){
    if (!$(".index-wrap *").is(":animated")) {
        changeActive(item);
        $(".index-wrap").eq(item).animate({opacity:0},300,function(){
            $(this).css("z-index",10);
            $(this).removeClass("active")
            if (item==0) {
                item=5
            }
            $(".index-wrap").eq(item-1).animate({opacity:1},500,function(){
                $(this).css("z-index",100);
                $(this).addClass("active")
                item--;
                isScroll = true;
                olActive()
            })
            liActive(item-1)
        });
    }
}

// 页面滚动时交互
function changeActive(index){
    var index = index+1;
    $(".wrap"+index).addClass("active");
    $(".wrap"+index).siblings().removeClass("active");
}

function olActive(){
    $(".wrap-box ol li").each(function(index,element){
        if (index==item) {
            $(element).siblings("li").removeClass("active");
            $(element).addClass("active")
        }
    });
}

function liActive(index){
    $(".wrap-box ol > span").css("top",(index*42-7)+"px");

    if(index==0){
        $("#header").removeClass("active");
    }
    else{
        $("#header").addClass("active");
    }
}

 /*定义鼠标滚轮事件*/
var scrollFunc = function (e) {
    var direct = 0;
    if (isScroll&&!$(".index-wrap").is(":animated")) {
        isScroll = !isScroll;
        e = e || window.event;
        /*判断浏览器IE，谷歌滑轮事件*/
        if (e.wheelDelta) {
            if (e.wheelDelta > 0) { /*当滑轮向上滚动时*/
                topScroll();
            }
            if (e.wheelDelta < 0) { /*当滑轮向下滚动时*/
                bottomScroll()
            }
        } 
        /*Firefox滑轮事件*/
        else if (e.detail) {
            if (e.detail < 0) { /*当滑轮向上滚动时*/
                topScroll();
            }
            if (e.detail > 0) { /*当滑轮向下滚动时*/
                bottomScroll()
            }
        }
    }
}

/*给页面绑定滑轮滚动事件*/
if (window.addEventListener) {
    window.addEventListener('DOMMouseScroll', scrollFunc, false);
}
/*滚动滑轮触发scrollFunc方法*/
window.onmousewheel = document.onmousewheel = scrollFunc;
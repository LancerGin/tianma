//登陆后页面右上角显示用户信息
$.ajax({
    type: "GET",
    url: HTTP.url + "u/getLoginInfo",
    xhrFields: {withCredentials: true},
    crossDomain: true,
    contentType: "application/json",
    error: function (errorMsg) {
        console.log(errorMsg);
    },
    success: function (result) {
        var loc = window.location.pathname;
        if(result.code==="00"){
            var name = result.data.email;
            if(loc.indexOf("index") != -1){
                var usercenter = '<span style="font-size: 16px"></span>'+
                    '<a href="view/balance.html" target="_blank" title="" class="user-center">'+name+'</a>';
                $("#header .user-info").addClass("logged").html(usercenter);
            }else if(loc.indexOf("product") != -1||loc.indexOf("guide") != -1){
                var usercenter = '<span style="font-size: 16px"></span>'+
                    '<a href="balance.html" target="_blank" title="" class="user-center">'+name+'</a>';
                $("#header .user-info").addClass("logged").html(usercenter);
            }else{
                if($("#header-logged .user-center")){
                    $("#header-logged .user-center").text(name);
                }
            }
        }else if(result.code==="08"&&loc!=="/"&&loc.indexOf("index")===-1&&loc.indexOf("product")===-1&&loc.indexOf("guide")===-1){
            console.log(result.msg||"未登录");
            window.location.href="login.html";
        }
    }
});

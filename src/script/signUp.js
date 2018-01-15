function sendMessage(obj) {
    $.ajax({
        type:"POST",
        url:HTTP.url+"u/singUp",
        xhrFields: {withCredentials: true},
        crossDomain: true,
        data:JSON.stringify(obj),
        contentType:"application/json",
        error:function(errorMsg){
            console.log(errorMsg);
            //注册按钮启用并更新验证码
            $("#signUp").prop("disabled",false);
            $("#signUp").removeClass("disabled");
            getValidateCode();
        },
        beforeSend:function(){
            //注册按钮禁用
            $("#signUp").prop("disabled",true);
            $("#signUp").addClass("disabled");
        },
        success:function(result){
            //注册按钮启用并更新验证码
            $("#signUp").prop("disabled",false);
            $("#signUp").removeClass("disabled");
            getValidateCode();

            console.log(result);
            var id = result.data.id;
            if(result.code==="00"){
                layer.alert('注册成功', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4
                }, function(){
                    window.location.href = "finishSignUp.html?"+id;
                });
            }else if(result.code==="06"){
                layer.msg(result.msg);
                $("#identifying").focus();
            }else if(result.code==="07"){
                layer.msg(result.msg);
                $("#identifying").focus();
            }else{
                layer.msg(result.msg);
            }
        }

    });
}
//获取验证码
function getValidateCode(){
    $.ajax({
        type:"GET",
        url:HTTP.url+"u/getValidateCode?time=1",
        xhrFields: {withCredentials: true},
        crossDomain: true,
        error:function(errorMsg){
            console.log(errorMsg);
        },
        success:function(result){
            if(result.code==="00"){
                $("#identifying_img").attr("src","data:image/png;base64,"+result.data);
            }else{
                layer.msg(result.msg);
            }

        }

    });
}
$().ready(function() {
    getValidateCode();
    //点击刷新重新获取
    $("#refresh>span").on("click",function(){
        getValidateCode();
    });
    //勾选同意声明后启用注册按钮
    $("#agreement").on("click",function(){
        if($(this).prop("checked")===true){
            $("#signUp").prop("disabled",false);
            $("#signUp").removeClass("disabled");
        }else{
            $("#signUp").prop("disabled",true);
            $("#signUp").addClass("disabled");
        }
    }).trigger("click");
    // 在键盘按下并释放及提交后验证提交表单
    $("#signUpForm").validate({
        //验证规则
        rules: {
            username: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 8,
                maxlength:20
            },
            confirm_password: {
                required: true,
                minlength: 8,
                maxlength:20,
                equalTo: "#password"
            }
        },
        //提示信息
        messages: {
            username: {
                required: "用户名不能为空",
                email: "请输入邮箱注册"
            },
            password: {
                required: "请输入密码",
                minlength: "密码长度为8-20位",
                maxlength: "密码长度为8-20位"
            },
            confirm_password: {
                required: "请输入密码",
                minlength: "密码长度为8-20位",
                maxlength: "密码长度为8-20位",
                equalTo: "密码不一致"
            }
        },
        // remote: {
        //     url: "",                    //后台处理程序,用户名是否重复
        //     type: "post",               //数据发送方式
        //     dataType: "json",           //接受数据格式
        //     data: {                     //要传递的数据
        //         username: function() {
        //             return $("#username").val();
        //         }
        //     }
        // },
        //错误信息标签存放位置
        errorPlacement: function(error, element) {
            element.parent().parent().next().children(".asterisk").hide();
            error.appendTo(element.parent().parent().next());
        },
        //单条验证成功回调
        success: function(label) {
            label.addClass("valid").html('<span class="glyphicon glyphicon-ok-circle success"></span>');
        },
        invalidHandler : function(){
            return false;//阻止表单提交
        },
        //验证通过后回调
        submitHandler: function() {
            var obj = {
                name:"test",
                email: $("#username").val(),
                pwd: $("#password").val(),
                validateCode: $("#identifying").val(),
                vip:1,
                organize:"索贝数码"
            };
            //向后台发送注册信息
            sendMessage(obj);
            return false;//阻止表单提交
        }
    });
});

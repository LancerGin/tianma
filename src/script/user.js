var LOADING;
//开启layer的加载提示
function loadingStart(){
    LOADING = layer.load(2, {
        time: 5*1000,            //设定最长等待5秒
        shade: [0.2,'#fff'] //0.1透明度的白色背景
    });
}
//关闭layer的加载提示
function loadingEnd(){
    layer.close(LOADING);
}
//显示提示信息
function showMsg(info){
    layer.msg(info);
}

var v;//validate验证对象

var User = new Vue({
    el:"#user_container",
    data:{
        userID:null,     //用户ID
        toChangePassword:false,     //展开修改密码组件的判断条件
        username:"",    //用户名
        organize:{
            editActive:false,       //打开修改所属机构输入框的判断条件
            name:""
        },    //所属机构
        oldPwd:"",    //原始密码
        newPwd:"",     //新密码
        confirmPwd:""  //确认密码
    },
    mounted:function(){
        this.getUserInfo();
    },
    methods: {
        //查询当前用户信息
        getUserInfo: function () {
            loadingStart();
            this.$http.get(HTTP.url+"u/getUser",{credentials: true})
                .then(function(response){
                    console.log("查询当前用户信息-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    //用户ID
                    var userID = response.data.data.id;
                    this.$set(this,'userID',userID);
                    //账户名
                    var username = response.data.data.email;
                    this.$set(this,'username',username);
                    //所属机构
                    var organize = response.data.data.organize;
                    this.$set(this.organize,'name',organize);
                })
                .catch(function(response) {
                    console.log("查询当前用户信息-请求错误：",response)
                });
        },
        //登出
        logout:function(){
            loadingStart();
            this.$http.get(HTTP.url+"u/logout",{credentials: true})
                .then(function(response){
                    console.log("登出-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    if(response.data.code==="00"){
                        showMsg("已退出当前账号，即将前往登录页面!");
                        setTimeout(function(){
                            window.location.href="login.html";
                        },2000);
                    }else{
                        showMsg(response.data.msg);
                    }

                })
                .catch(function(response) {
                    console.log("登出-请求错误：",response)
                });
        },
        //打开修改用户所属机构的输入框
        openEdit:function(){
            this.organize.editActive=true;
            $(".organize>p").hide();
            //编辑所属机构时，隐藏“修改密码”那个按钮。。。防止误操作？
            if(!this.toChangePassword){
                $("#changePWD").css({
                    animation:'close .5s forwards'
                });
            }
        },
        //关闭修改用户所属机构的输入框
        closeEdit:function(){
            this.organize.editActive=false;
            $(".organize>p").show();
            //编辑所属机构后，展示“修改密码”按钮
            if(!this.toChangePassword) {
                $("#changePWD").css({
                    opacity: '0',
                    animation: 'open .5s forwards .5s'
                });
            }
        },
        //修改用户所属机构
        changeOrganize: function () {
            loadingStart();
            this.$http.post(HTTP.url+"u/userUpdate",{
                id:this.userID,  //用户id
                organize: this.organize.name  //用户所属机构
            },{credentials: true})
                .then(function(response){
                    console.log("修改用户所属机构-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    if(response.data.code==="00"){
                        showMsg("修改成功");
                        this.closeEdit();
                    }else{
                        showMsg(response.data.msg);
                    }

                })
                .catch(function(response) {
                    console.log("修改用户所属机构-请求错误：",response)
                });
        },
        //打开修改密码的面板
        openForm:function(){
            this.toChangePassword = true;
            $("#changePWD").css({
                position: 'absolute',
                animation:'close .5s forwards'
            });
            $(".pwd").css({
                position: 'relative',
                animation:'show .5s forwards .5s'
            });
        },
        //关闭修改密码的面板
        closeForm:function(){
            this.toChangePassword = false;
            $(".pwd").css({
                animation:'hide .5s forwards'
            });
            $("#changePWD").css({
                position: 'relative',
                opacity:'0',
                animation:'open .5s forwards .5s'
            });
            this.$set(this,"oldPwd","");
            this.$set(this,"newPwd","");
            this.$set(this,"confirmPwd","");
            v.resetForm();
            $(".asterisk").show();
        },
        //修改密码
        changePassword: function () {
            loadingStart();
            this.$http.post(HTTP.url+"u/pwdChange",{
                id:this.userID,  //用户id
                originalPwd: this.oldPwd,  //原始密码
                newPwd:this.newPwd    //新密码
            },{credentials: true})
                .then(function(response){
                    console.log("修改密码-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    if(response.data.code==="00"){
                        showMsg("修改密码成功");
                        this.closeForm();
                    }else{
                        showMsg(response.data.msg);
                    }

                })
                .catch(function(response) {
                    console.log("修改密码-请求错误：",response)
                });
        }
    }
});
$().ready(function() {
    // 在键盘按下并释放及提交后验证提交表单
    v = $("#changePwdForm").validate({
        //验证规则
        rules: {
            password_old: {
                required: true,
                minlength: 8,
                maxlength:20
            },
            password_new: {
                required: true,
                minlength: 8,
                maxlength:20
            },
            confirm_password: {
                required: true,
                minlength: 8,
                maxlength:20,
                equalTo: "#password_new"
            }
        },
        //提示信息
        messages: {
            password_old: {
                required: "请输入原始密码",
                minlength: "密码长度为8-20位",
                maxlength: "密码长度为8-20位"
            },
            password_new: {
                required: "请输入新密码",
                minlength: "密码长度为8-20位",
                maxlength: "密码长度为8-20位"
            },
            confirm_password: {
                required: "请确认新密码",
                minlength: "密码长度为8-20位",
                maxlength: "密码长度为8-20位",
                equalTo: "密码不一致"
            }
        },
        //错误信息标签存放位置
        errorPlacement: function(error, element) {
            element.parent().parent().next().children(".asterisk").hide();
            error.appendTo(element.parent().parent().next());
        },
        //单条验证成功回调
        success: function(label) {
            label.addClass("valid").html('<span class="glyphicon glyphicon-ok success"></span>');
        },
        invalidHandler : function(){
            return false;//阻止表单提交
        },
        //验证通过后回调
        submitHandler: function() {
            //向后台发送修改密码的信息
            User.changePassword();
            return false;//阻止表单提交
        }
    });
});

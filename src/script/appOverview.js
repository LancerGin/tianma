var LOADING;
//开启layer的加载提示
function loadingStart(){
    LOADING = layer.load(2, {
        time: 5*1000,               //设定最长等待5秒
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
//APP对象
var APP = new Vue({
    el:"#container",
    data:{
        isActive:null,      //高亮展示哪个应用的版本情况
        searchValue:"",     //搜索框输入值
        noMatchEdition:false,  //搜索结果为空的时候此值为true
        appList:[],         //应用列表
        appDetails:[]       //应用版本情况
    },
    mounted:function(){
        loadingStart();
        //获取应用列表
        this.getApp();
    },
    methods:{
        //点击应用查看它的版本情况
        lookEdition:function (app) {
            this.showEdition(app);
        },
        //根据输入框的值搜索版本
        searchEdition:function(){
            var editionList = this.appDetails;
            var hideNum = 0;
            for(let i=0;i<editionList.length;i++){
                //不区分大小写，有包含输入字段的都显示
                if(editionList[i].edition_num.toUpperCase().match(this.searchValue.toUpperCase())){
                    editionList[i].show = true;
                }else{
                    editionList[i].show = false;
                    hideNum++;
                }
            }
            if(hideNum === editionList.length){
                this.noMatchEdition = true;
            }else{
                this.noMatchEdition = false;
            }
        },
        //给某个应用添加版本
        addEdition:function(){
            loadingStart();
            var id = this.isActive;
            var appList = this.appList;
            for(let i=0;i<appList.length;i++){
                if(appList[i].uid===id){
                    this.$http.post(HTTP.url+"version/add",{
                        appId:id,
                        icon:"",
                        verName:appList[i].name,
                        verNumber:""
                    },{credentials: true})
                        .then(function(response){
                            //未登录就跳转到登录页面
                            if(response.data.code==="08"){
                                console.log(response.data.msg||"未登录");
                                window.location.href="login.html";
                            }
                            console.log("创建版本-请求成功：",response.data);
                            loadingEnd();
                            window.location.href = "appSetting.html?"+response.data.data.id;
                        })
                        .catch(function(response) {
                            showMsg("创建版本-请求错误：");
                            console.log("创建版本-请求错误：",response)
                        });
                }
            }
        },
        //根据版本状态进入不同设置页面
        toSet:function(editionID){
            window.location.href = "appSetting.html?"+editionID;
        },
        toLookProgress:function(editionID){
            window.location.href = "appSetting.html?"+editionID+"#step=6";
        },
        toDownload:function(editionID){
            window.location.href = "appSetting.html?"+editionID+"#step=7";
        },
        //展示某应用的版本详情
        showEdition:function(app){
            this.$set(this,"isActive",app.uid);
            var versionList = app.versionBeanList;
            var editionArr = [];
            for(let i=0;i<versionList.length;i++){
                editionArr.push({
                    uid:versionList[i].id,//版本ID
                    navActive:null, //高亮选中的导航ID
                    edition_psname:"", //版本预览图顶部的标题（选中某导航这里就会显示此导航对应版块的名称）
                    edition_view:"", //版本预览图中间的详图（选中某导航这里就会显示此导航对应版块的详图）
                    edition_navs:versionList[i].footerBeanList,//版本预览图底部的导航栏（选中某导航高亮）
                    edition_num:versionList[i].verNumber,//版本号
                    status:versionList[i].stutas,  //版本状态（编辑中、打包中、打包完成）
                    show:true
                });
            }
            this.$set(this,"appDetails",editionArr);

            for(let i=0;i<editionArr.length;i++){
                if(editionArr[i].edition_navs.length>0){
                    //配置了导航栏的情况下
                    this.lookNav(editionArr[i].edition_navs[0],editionArr[i].uid); //默认第一个导航高亮选中
                }
            }
        },
        //应用版本预览图中，点击导航显示对应的版块详图和标题
        lookNav: function(nav,editionID){
            var editionArr = this.appDetails;
            for(let i=0;i<editionArr.length;i++){
                if(editionID===editionArr[i].uid){
                    editionArr[i].navActive = nav.id;
                    editionArr[i].edition_psname = nav.pluginSonBean?nav.pluginSonBean.psname:"";
                    editionArr[i].edition_view = nav.pluginSonBean?nav.pluginSonBean.url:"";
                }
            }
        },
        //获取应用列表
        getApp:function(){
            // this.$http.options.xhr = { withCredentials: true };
            this.$http.post(HTTP.url+"app/searchAll",{},{credentials: true})
                .then(function(response){
                    console.log("获取应用-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    var list = response.data.data||[];
                    if(list.length>0){
                        var newList = [];
                        for(let i=0;i<list.length;i++){
                            newList.push({
                                uid:list[i].appId,
                                name:list[i].appName,
                                versionBeanList:list[i].versionBeanList
                            });
                        }
                        this.$set(this,"appList",newList);
                        //默认展示第一个应用的版本详情
                        if(this.isActive===null){
                            this.showEdition(newList[0]);
                        }
                    }
                })
                .catch(function(response) {
                    console.log("获取应用-请求错误：",response)
                });
        },
        //弹出新建应用弹窗
        addApp:function () {
            var _this = this;
            var add = layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 2,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :'新建应用',
                content: '<form class="form-horizontal" role="form"><div class="form-group">'+
                '<label for="new_app" class="col-sm-3 control-label">应用名称：</label><div class="col-sm-7">'+
                '<input type="text" class="form-control" id="new_app" name="new_app" placeholder="请输入名称(长度1~6位)" maxlength="6">'+
                '</div></div></form>',
                btn: ['新建', '取消'],
                yes: function(index, layero){
                    var name = $("#new_app").val();
                    if(name===""){
                        showMsg("应用名称不能为空！");
                    }else{
                        _this.confirmAddApp(name);
                        layer.close(index);
                    }
                },
                no: function(index, layero){
                    layer.close(index);
                }
            });
            $("#new_app").on('keydown', function (e) {
                var key = e.which;
                if (key == 13) {
                    e.preventDefault();
                    var name = $("#new_app").val();
                    if(name===""){
                        showMsg("应用名称不能为空！");
                    }else{
                        _this.confirmAddApp(name);
                        layer.close(add);
                    }
                }
            });
        },
        //弹出修改应用名称弹窗
        editApp:function (app) {
            var _this = this;
            var edit = layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 2,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :'编辑应用名称',
                content: '<form class="form-horizontal" role="form"><div class="form-group">'+
                '<label for="edit_app" class="col-sm-3 control-label">应用名称：</label><div class="col-sm-7">'+
                '<input type="text" class="form-control" id="edit_app" name="edit_app" placeholder="请输入名称(长度1~6位)" maxlength="6" value="'+app.name+'">'+
                 '<div class="col-sm-12 advice">(应用名称长度为1~6位)</div>'+
                '</div></div></form>',
                btn: ['保存', '取消'],
                yes: function(index, layero){
                    var newname = $("#edit_app").val();
                    if(newname===""){
                        showMsg("应用名称不能为空！");
                    }else{
                        _this.confirmEditApp(app.uid,newname);
                        layer.close(index);
                    }
                },
                no: function(index, layero){
                    layer.close(index);
                }
            });
            $("#edit_app").on('keydown', function (e) {
                var key = e.which;
                if (key == 13) {
                    e.preventDefault();
                    var newname = $("#edit_app").val();
                    if(newname===""){
                        showMsg("应用名称不能为空！");
                    }else{
                        _this.confirmEditApp(app.uid,newname);
                        layer.close(edit);
                    }
                }
            });
        },
        //弹出删除应用弹窗
        removeApp:function(app){
            var _this = this;
            layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 4,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :false,
                content: '<span class="glyphicon glyphicon-exclamation-sign"></span><h2>消息</h2><p>是否删除此应用及所含版本？</p>',
                btn: ['删除', '取消'],
                yes: function(index, layero){
                    //确认删除
                    _this.confirmRemoveApp(app.uid);
                    layer.close(index);
                },
                no: function(index, layero){
                    layer.close(index);
                }
            });
        },
        //确认新建应用
        confirmAddApp:function(name){
            loadingStart();
            this.$http.post(HTTP.url+"app/add",JSON.stringify({
                "appName":name
            }),{credentials: true})
                .then(function(response){
                    console.log("新建应用-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    if(response.data.code==="00"){
                        showMsg("新建应用成功");
                        var newApp = {
                            uid:response.data.data.appId,
                            name:response.data.data.appName
                        };
                        //新建成功后获取最新的应用列表
                        this.getApp();
                        //新建成功后展示新建的应用的版本详情
                        this.showEdition(newApp);
                    }else{
                        showMsg(response.data.msg);
                    }

                })
                .catch(function(response) {
                    console.log("新建应用-请求错误：",response)
                });
        },
        //确认修改应用名称
        confirmEditApp:function(id,name){
            loadingStart();
            this.$http.post(HTTP.url+"app/update",JSON.stringify({
                "appId":id,
                "appName":name
            }),{credentials: true})
                .then(function(response){
                    console.log("修改应用名称-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    if(response.data.code==="00"){
                        showMsg("修改成功");
                        //修改成功后获取最新的应用列表
                        this.getApp();
                    }else{
                        showMsg(response.data.msg);
                    }
                })
                .catch(function(response) {
                    console.log("修改应用名称-请求错误：",response)
                });
        },
        //确认删除应用
        confirmRemoveApp:function(id){
            loadingStart();
            this.$http.post(HTTP.url+"app/deleteApp",JSON.stringify({
                "appId":id
            }),{credentials: true})
                .then(function(response){
                    console.log("删除应用-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    if(response.data.code==="00"){
                        showMsg("删除成功");
                        //删除成功后获取最新的应用列表
                        this.getApp();
                    }else{
                        showMsg(response.data.msg);
                    }
                })
                .catch(function(response) {
                    console.log("删除应用-请求错误：",response)
                });
        }
    }
});

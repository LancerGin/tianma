
var form = layui.form;
var layer = layui.layer;
var upload = layui.upload;
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
var SetCenter = new Vue({
    el: "#container",
    data: {
        backUrl:'appSetting.html?'+parseInt(location.href.split("?")[1])+'#step=5',
        editionID:parseInt(location.href.split("?")[1]), //版本ID
        editionNAME:'',   //版本名称
        editionNUM:'',   //版本号
        isActive: null,  //展示导航栏的详细配置
        navList:[],
        // navList: [
        //     {
        //         nid:1,
        //         editActive:false,
        //         name:"新闻资讯",
        //         icon:"../images/visual/news.png",
        //         selectIcon:"../images/visual/news0.png",
        //         // section:{
        //         //     id:null,
        //         //     psname:"NO.1资讯",
        //         //     url:"../images/visual/a1.PNG"
        //         // }
        //         section:{
        //             id:null,
        //             psname:"",
        //             url:""
        //         }
        //     },
        //     {
        //         nid:2,
        //         editActive:false,
        //         name:"直播",
        //         icon:"../images/visual/live.png",
        //         selectIcon:"../images/visual/live0.png",
        //         // section:{
        //         //     id:null,
        //         //     psname:"直播模块",
        //         //     url:"../images/visual/a2.PNG"
        //         // }
        //         section:{
        //             id:null,
        //             psname:"",
        //             url:""
        //         }
        //     },
        //     {
        //         nid:3,
        //         editActive:false,
        //         name:"视频",
        //         icon:"../images/visual/video.png",
        //         selectIcon:"../images/visual/video0.png",
        //         // section:{
        //         //     id:null,
        //         //     psname:"视频模块",
        //         //     url:"../images/visual/a3.PNG"
        //         // }
        //         section:{
        //             id:null,
        //             psname:"",
        //             url:""
        //         }
        //     },
        //     {
        //         nid:4,
        //         editActive:false,
        //         name:"活动",
        //         icon:"../images/visual/activity.png",
        //         selectIcon:"../images/visual/activity0.png",
        //         // section:{
        //         //     id:null,
        //         //     psname:"活动页面",
        //         //     url:"../images/visual/a4.PNG"
        //         // }
        //         section:{
        //             id:null,
        //             psname:"",
        //             url:""
        //         }
        //     },
        //     {
        //         nid:5,
        //         editActive:false,
        //         name:"我的",
        //         icon:"../images/visual/my.png",
        //         selectIcon:"../images/visual/my0.png",
        //         // section:{
        //         //     id:null,
        //         //     psname:"朋友圈",
        //         //     url:"../images/visual/a5.PNG"
        //         // }
        //         section:{
        //             id:null,
        //             psname:"",
        //             url:""
        //         }
        //     }
        // ],         //导航栏列表
        navDetails:{},        //导航栏的详细配置
        assemblyArr:[],                  //组件列表
        sectionArr:[],      //版块列表
        section:{}          //版块
    },
    mounted: function () {
        //初始化选择组件的下拉菜单
        this.assemblyChange();
        //初始化选择链接版块的下拉菜单
        this.sectionChange();
        //初始化上传非选中图标
        this.changeIcon();
        //初始化上传选中图标
        this.changeSelectIcon();
        //获取版本信息
        this.getEditionData();
        //查询导航栏
        this.searchNavs();
    },
    methods: {
        //获取版本信息
        getEditionData:function(){
            this.$http.post(HTTP.url+"version/searchVersionById",{
                id:this.editionID
            },{credentials: true})
                .then(function(response){
                    console.log("获取版本信息-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    var result = response.data.data;
                    //版本的名称和版本号
                    var verName = result.verName;
                    var verNumber = result.verNumber;
                    this.$set(this,"editionNAME",verName);
                    this.$set(this,"editionNUM",verNumber);
                    //此版本已添加的组件
                    var assemblyArr = response.data.data.versionVsPluginBeanList;
                    var assembly_added = [];
                    for(let i=0;i<assemblyArr.length;i++){
                        assembly_added.push(assemblyArr[i].pluginBean);
                    }
                    this.$set(this,"assemblyArr",assembly_added);
                    //更新组件的下拉列表
                    this.showAssemblyArr();
                })
                .catch(function(response) {
                    console.log("获取版本信息-请求错误：",response)
                });
        },
        //查询导航栏
        searchNavs:function(){
            loadingStart();
            this.$http.post(HTTP.url+"footer/searchByVid",{
                vId:this.editionID
            },{credentials: true})
                .then(function(response){
                    console.log("底部导航查询-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    var result = response.data.data;
                    var footerSets = result;
                    var navs = [];
                    if(footerSets.length!==0){
                        for(let i=0;i<footerSets.length;i++){
                            navs.push({
                                id:footerSets[i].id,
                                nid:i+1,
                                editActive:false,
                                name:footerSets[i].title,
                                icon:footerSets[i].fIcon,
                                selectIcon:footerSets[i].showIcon,
                                status:footerSets[i].status,
                                section:{
                                    id:footerSets[i].pluginSonBean?footerSets[i].pluginSonBean.id:null,
                                    psname:footerSets[i].pluginSonBean?footerSets[i].pluginSonBean.psname:'',
                                    url:footerSets[i].pluginSonBean?footerSets[i].pluginSonBean.url:''
                                }
                            });
                        }
                        this.$set(this,"navList",navs);
                    }
                    //默认查看第一条导航栏的详细配置信息
                    this.lookNav(this.navList[0]);
                })
                .catch(function(response) {
                    console.log("底部导航查询-请求错误：",response)
                });
        },
        //查看导航栏模块
        lookNav:function(nav){
            //当前点击的导航栏模块高亮
            this.$set(this,"isActive",nav.nid);
            //当前点击的导航栏模块的设置信息
            this.$set(this,"navDetails",nav);
            this.lookSection(nav.section);
            console.log(nav);
        },
        //添加导航栏模块
        addNav:function(){
            var navArr = this.navList;
            if(navArr.length===6){
                layer.msg('底部最多支持6个模块', {
                    time: 2000, //2s后自动关闭
                    btnAlign: 'c',
                    btn: ['确定']
                });
            }else{
                var num = navArr[navArr.length-1].nid||0;
                var id = num +1;
                var newNav = {
                    nid:id,
                    editActive:false,
                    name:"自定义",
                    icon:"../images/visual/my.png",
                    selectIcon:"../images/visual/my0.png",
                    section:{
                        id:null,
                        psname:"",
                        url:""
                    }
                };
                this.navList.push(newNav);
            }
        },
        //打开修改导航栏模块名称的输入框
        openEdit:function(nav){
            // //打开一个输入框修改名称时，先关闭其他未关闭的输入框
            // var navArr = this.navList;
            // for(let i=0;i<navArr.length;i++){
            //     navArr[i].editActive=false;
            // }
            nav.editActive=true;
        },
        //关闭修改导航栏模块名称的输入框
        closeEdit:function(nav){
            if(nav.name===""){
                showMsg("导航栏名称不能为空！");
            }else if(nav.name.length>4){
                showMsg("导航栏名称长度最多4位！");
            }else{
                nav.editActive=false;
            }
        },
        //删除导航栏模块
        removeNav:function(nav){
            var navArr = this.navList;
            if(navArr.length===2){
                layer.msg('底部最少支持2个模块', {
                    time: 2000, //2s后自动关闭
                    btnAlign: 'c',
                    btn: ['确定']
                });
            }else{
                var newArr = [];
                for(let i=0;i<navArr.length;i++){
                    if(navArr[i].nid!==nav.nid){
                        newArr.push(navArr[i])
                    }
                }
                this.$set(this,"navList",newArr);
                //默认查看第一条导航栏的详细配置信息
                this.lookNav(this.navList[0]);
                layer.msg('删除成功', {
                    time: 2000, //2s后自动关闭
                    btnAlign: 'c',
                    btn: ['确定']
                });
            }
        },
        //选中图标上传
        changeIcon:function(){
            var _this = this;
            var uploadInst = upload.render({
                elem: '#test1'
                ,url: HTTP.url+'file/uploadPic/uploadOnly'
                ,data:{
                    vId:_this.editionID
                }
                ,before: function(obj){
                    loadingStart();
                    //预读本地文件示例，不支持ie8
                    obj.preview(function(index, file, result){
                        $('#demo1').attr('src', result); //图片链接（base64）
                    });
                }
                ,done: function(res){
                    loadingEnd();
                    //如果上传失败
                    if(res.code > 0){
                        //演示失败状态，并实现重传
                        var demoText = $('#demoText1');
                        demoText.html('<span style="color: #FF5722;margin-right: 130px;">上传失败</span> <a class="layui-btn layui-btn-mini demo-reload">重试</a>');
                        demoText.find('.demo-reload').on('click', function(){
                            uploadInst.upload();
                        });
                        return showMsg('上传失败');
                    }
                    //上传成功
                    showMsg('上传成功');
                    var navArr = _this.navList;
                    for(let i=0;i<navArr.length;i++){
                        if(navArr[i].nid===_this.isActive){
                            navArr[i].selectIcon = res.data.url;
                        }
                    }
                }
                ,error: function(){
                    loadingEnd();
                    //演示失败状态，并实现重传
                    var demoText = $('#demoText1');
                    demoText.html('<span style="color: #FF5722;margin-right: 130px;">上传失败</span> <a class="layui-btn layui-btn-mini demo-reload">重试</a>');
                    demoText.find('.demo-reload').on('click', function(){
                        uploadInst.upload();
                    });
                }
            });
        },
        //非选中图标上传
        changeSelectIcon:function(){
            var _this = this;
            var uploadInst = upload.render({
                elem: '#test2'
                ,url: HTTP.url+'file/uploadPic/uploadOnly'
                ,data:{
                    vId:_this.editionID
                }
                ,before: function(obj){
                    loadingStart();
                    //预读本地文件示例，不支持ie8
                    obj.preview(function(index, file, result){
                        $('#demo2').attr('src', result); //图片链接（base64）
                    });
                }
                ,done: function(res){
                    //未登录就跳转到登录页面
                    if(res.code==="08"){
                        console.log(res.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    //如果上传失败
                    if(res.code > 0){
                        //演示失败状态，并实现重传
                        var demoText = $('#demoText2');
                        demoText.html('<span style="color: #FF5722;margin-right: 130px;">上传失败</span> <a class="layui-btn layui-btn-mini demo-reload">重试</a>');
                        demoText.find('.demo-reload').on('click', function(){
                            uploadInst.upload();
                        });
                        return showMsg('上传失败');
                    }
                    //上传成功
                    showMsg('上传成功');
                    var navArr = _this.navList;
                    for(let i=0;i<navArr.length;i++){
                        if(navArr[i].nid===_this.isActive){
                            navArr[i].icon = res.data.url;
                        }
                    }
                }
                ,error: function(){
                    loadingEnd();
                    //演示失败状态，并实现重传
                    var demoText = $('#demoText2');
                    demoText.html('<span style="color: #FF5722;margin-right: 130px;">上传失败</span> <a class="layui-btn layui-btn-mini demo-reload">重试</a>');
                    demoText.find('.demo-reload').on('click', function(){
                        uploadInst.upload();
                    });
                }
            });
        },
        //展示此版本添加的组件列表
        showAssemblyArr:function(){
            var assemblyArr = this.assemblyArr;
            var str = '<option value="">-请选择组件-</option>';
            $('#assemblyArr').html('');
            $('#assemblyArr').siblings().remove();
            for(let i=0;i<assemblyArr.length;i++){
                str+='<option value="'+assemblyArr[i].id+'">'+assemblyArr[i].name+'</option>';
            }
            $('#assemblyArr').html(str);
            form.render();
        },
        //选择组件
        assemblyChange:function(){
            var _this = this;
            form.on('select(assembly)', function(data){
                var assemblyArr = _this.assemblyArr;
                var selectedV = parseInt(data.value); //得到被选中的值
                for(let i=0;i<assemblyArr.length;i++){
                    if(assemblyArr[i].id===selectedV){
                        var sectionArr = assemblyArr[i].pluginSonBeanList;
                        _this.$set(_this,"sectionArr",sectionArr);
                        _this.showSectionArr(sectionArr);
                    }
                }
            });
        },
        //选择组件后展示其含有的链接版块
        showSectionArr:function(sectionArr){
            var len = sectionArr.length;
            var str = '<option value="">-请选择版块-</option>';
            $('#sectionArr').html('');
            $('#sectionArr').siblings().remove();
            for(let i=0;i<len;i++){
                str+='<option value="'+sectionArr[i].id+'">'+sectionArr[i].psname+'</option>';
            }
            $('#sectionArr').html(str);
            form.render();
        },
        //选择链接版块
        sectionChange:function(){
            var _this = this;
            form.on('select(section)', function(data){
                var sectionArr = _this.sectionArr;
                var selectedV = parseInt(data.value); //得到被选中的值
                for(let i=0;i<sectionArr.length;i++){
                    if(sectionArr[i].id===selectedV){
                        var section = sectionArr[i];
                        _this.setSectionForNav(section);
                    }
                }
            });
        },
        //选择版块后给当前导航栏模块设置关联此版块
        setSectionForNav:function(section){
            var navArr = this.navList;
            var section = section; //当前选择的版块
            for(let i=0;i<navArr.length;i++){
                if(navArr[i].nid===this.isActive){
                    navArr[i].section = section;
                    this.lookSection(section);
                }
            }
        },
        //查看链接版块的预览图
        lookSection:function(section){
            this.$set(this,"section",section);
        },
        //保存
        saveSets:function(){
            var couldSave = true;
            var navs = this.navList;
            for(let i=0;i<navs.length;i++) {
                if (navs[i].editActive) {
                    showMsg('您正在编辑导航栏名称，请确认');
                    couldSave = false;
                    break;
                }
            }
            if(couldSave){
                var footerSets = [];
                var vId = this.editionID;
                for(let i=0;i<navs.length;i++){
                    if(navs[i].id){
                        footerSets.push({
                            "id":navs[i].id,
                            "psId":parseInt(navs[i].section.id),
                            "vId":vId,
                            "status":navs[i].status,
                            "showIcon":navs[i].selectIcon,
                            "title":navs[i].name,
                            "fIcon":navs[i].icon
                        });
                    }else{
                        footerSets.push({
                            "psId":parseInt(navs[i].section.id),
                            "vId":vId,
                            "status":0,
                            "showIcon":navs[i].selectIcon,
                            "title":navs[i].name,
                            "fIcon":navs[i].icon
                        });
                    }
                }
                loadingStart();
                this.$http.post(HTTP.url+"footer/updateSets",{
                    vId:vId,
                    footerSets:footerSets
                },{credentials: true})
                    .then(function(response){
                        console.log("保存底部导航栏-请求成功：",response.data);
                        //未登录就跳转到登录页面
                        if(response.data.code==="08"){
                            console.log(response.data.msg||"未登录");
                            window.location.href="login.html";
                        }
                        loadingEnd();
                        if(response.data.code==="00"){
                            showMsg("保存成功");
                            setTimeout(function(){
                                window.location.href = "appSetting.html?"+vId+"#step=6";
                            },500);
                        }else{
                            showMsg(response.data.msg||"保存失败")
                        }

                    })
                    .catch(function(response) {
                        console.log("保存底部导航栏-请求错误：",response)
                    });
            }

        }

    }
});


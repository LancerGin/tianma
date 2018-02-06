var form = layui.form;
var layer = layui.layer;
var upload = layui.upload;
var element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
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
//tab切换的提示信息
function showTips(info,DOMid){
    layer.tips(info,DOMid, {
        tips: [1, '#14A7FF'],
        time: 4000
    });
}

var EDITION = new Vue({
    el: "#container",
    data:{
        //版本的ID
        id:parseInt(location.href.split("?")[1].split("#")[0]),
        //所属应用ID
        appID:null,
        //版本的状态，0 表示未绑定组件、  1 表示准备就绪可打包、
        // 2 表示已经提交打包申请，进入打包流程、  3 表示打包完成
        //根据不同状态显示对应模块
        status:null,
    //第一步"设置名称版本号"
        finishStep1:false,
        verName:"",
        verNumber:"",
        verDomain:"",
        siteArr:[],
        verSite:"",
    //第二步"设置图标"
        finishStep2:false,
        icon:"",
    //第三步"设置启动页"
        finishStep3:false,
        startupImg:"",
    //第四步"选择组件"
        finishStep4:false,
        assembly_tobeadd: [],        //待添加组件
        assembly_added: [],          //已添加组件
    //第五步"配置组件"
        finishStep5:false,
        url:"visual.html",
    //第六步"打包购买"
        finishStep6:false,
        boughtService:false,   //是否已经购买服务
        packProgress:null,     // 进入打包流程后，打包的进度
        applyTime:'',          // 提交申请时间
        startPackTime:'',      // 改变状态为“处理中”的时间
        finishPackTime:'',     // 打包完成时间
        estimateFinishTime:'2020年01月30日',   // 提交申请后的预计打包完成时间
    //第七步"下载安装"
        packageBean:{
            androidPkg:'',
            bgPkg:'',
            iosPkg:''
        },
        buy:{
            status:"01"
        }
    },
    mounted: function () {
        this.getEditionData();
        this.siteChange();
        form.render();
    },
    methods: {
        //点击无效tab项的时候提示相关信息
        showTips: function(DOMid){
            if(!this.finishStep1){
                showTips("请先设置版本名称和版本号，并保存",DOMid);
            }else if(this.finishStep1&&!this.finishStep2){
                showTips("请先上传此版本的应用图标",DOMid);
            }else if(this.finishStep2&&!this.finishStep3){
                showTips("请先上传此版本的启动页",DOMid);
            }else if(this.finishStep3&&!this.finishStep4){
                showTips("请先选择组件，并保存",DOMid);
            }else if(this.finishStep4&&!this.finishStep5){
                showTips("请在可视化配置中心检查是否每个导航栏均绑定了组件版块",DOMid);
            }
        },
        //获取版本信息
        getEditionData: function () {
            loadingStart();
            this.$http.post(HTTP.url + "version/searchVersionById", {
                id: this.id
            }, {credentials: true})
                .then(function (response) {
                    console.log("获取版本信息-请求成功：", response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    var result = response.data.data;
                    var appID = response.data.data.appId;
                    this.$set(this, "appID", appID);
                    this.searchService(); //获取应用ID后查询此应用下是否购买服务

                //1."设置名称版本号" 里面的信息
                    var verName = result.verName;
                    var verNumber = result.verNumber;
                    this.$set(this, "verName", verName);
                    this.$set(this, "verNumber", verNumber);
                    var verDomain = result.domain; //域名
                    var verSite = result.siteCode; //站点
                    this.$set(this, "verDomain", verDomain);
                    this.$set(this, "verSite", verSite);

                //2."设置图标" 里面的信息
                    var icon = result.icon;
                    this.$set(this, "icon", icon);

                //3."设置启动页" 里面的信息
                    var startupImg = result.startupImg;
                    this.$set(this, "startupImg", startupImg);

                //4."选择组件" 里面的信息(此版本已添加的组件)
                    var assemblyArr = response.data.data.versionVsPluginBeanList;
                    var assembly_added = [];
                    for (let i = 0; i < assemblyArr.length; i++) {
                        assembly_added.push(assemblyArr[i].pluginBean);
                    }
                    this.$set(this, "assembly_added", assembly_added);
                    this.getAssembly();

                //6."打包及购买" 里面的信息


                //7."下载及安装" 里面的信息
                    var packageBean = result.packageBean;
                    if(packageBean){
                        this.$set(this, "packageBean", packageBean);
                    }

                //版本流程状态
                    var status = result.stutas;
                    this.changeStatus(status); //改变版本状态
                    var _this =this;
                    if (status === 0) {

                    }else if (status === 1) {
                        this.$set(this,"finishStep1",true);
                        // setTimeout(function(){
                        //     _this.tabChange(2);
                        // },10);
                    }else if (status === 2) {
                        this.$set(this,"finishStep1",true);
                        this.$set(this,"finishStep2",true);
                        setTimeout(function(){
                            _this.tabChange(3);
                        },10);
                    }else if (status === 3) {
                        this.$set(this,"finishStep1",true);
                        this.$set(this,"finishStep2",true);
                        this.$set(this,"finishStep3",true);
                        setTimeout(function(){
                            _this.tabChange(4);
                        },10);
                    }else if (status === 4) {
                        this.$set(this,"finishStep1",true);
                        this.$set(this,"finishStep2",true);
                        this.$set(this,"finishStep3",true);
                        this.$set(this,"finishStep4",true);
                        setTimeout(function(){
                            _this.tabChange(5);
                        },10);
                    }else if (status === 5) {
                        this.$set(this,"finishStep1",true);
                        this.$set(this,"finishStep2",true);
                        this.$set(this,"finishStep3",true);
                        this.$set(this,"finishStep4",true);
                        this.$set(this,"finishStep5",true);
                        setTimeout(function(){
                            _this.tabChange(6);
                        },10);
                    }else if (status === 6) {
                        this.$set(this,"finishStep1",true);
                        this.$set(this,"finishStep2",true);
                        this.$set(this,"finishStep3",true);
                        this.$set(this,"finishStep4",true);
                        this.$set(this,"finishStep5",true);
                        this.$set(this,"finishStep6",true);
                        setTimeout(function(){
                            _this.tabChange(6);
                        },10);
                        //当版本进入打包流程需要查询流程信息
                        this.searchPack();
                    }else if (status === 7) {
                        this.$set(this,"finishStep1",true);
                        this.$set(this,"finishStep2",true);
                        this.$set(this,"finishStep3",true);
                        this.$set(this,"finishStep4",true);
                        this.$set(this,"finishStep5",true);
                        this.$set(this,"finishStep6",true);
                        setTimeout(function(){
                            _this.tabChange(7);
                        },10);
                        //当版本打包完成也需要查询流程信息
                        this.searchPack();
                    }

                    loadingEnd();
                    //初始化上传应用图标的功能
                    this.changeIcon();
                    //初始化上传启动页的功能
                    this.changeStartupImg();
                })
                .catch(function (response) {
                    console.log("获取版本信息-请求错误：", response)
                });
        },
        //切换选项卡
        tabChange:function(num){
            element.tabChange('step', num);
            location.hash = 'step='+num;
            // $("#nav ul.layui-tab-title li:nth-child("+num+")").trigger("click");
        },
    //第一步"设置名称版本号"
        //修改版本信息
        save:function(){
            if(this.verName==="") {
                showMsg('版本名称不能为空！');
            }else if(this.verNumber===""){
                showMsg('版本号不能为空！');
            }else if(this.verDomain===""){
                showMsg('请填写域名地址！');
            }else if(!this.verSite){
                this.verSite="00000000000000000000000000000000";//32个0
                this.confirmSave();
            }else{
                this.confirmSave();
            }
        },
        confirmSave:function(){
            loadingStart();
            this.$http.post(HTTP.url+"version/update",{
                id:this.id,
                verName:this.verName,
                verNumber:this.verNumber,
                domain:this.verDomain,
                siteCode:this.verSite
            },{credentials: true})
                .then(function(response){
                    console.log("修改版本信息-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    if(response.data.code==="00"){
                        showMsg('修改成功');
                        var result = response.data.data;
                        //第一步成功保存后，允许设置第二个步骤,并跳转到第二步
                        if(!this.finishStep1){
                            this.$set(this,"finishStep1",true);
                        }
                        var _this =this;
                        setTimeout(function(){
                            _this.tabChange(2);
                        },10);
                    }else{
                        showMsg(response.data.msg||"修改失败");
                        $("#verNumber").focus();
                    }
                })
                .catch(function(response) {
                    console.log("修改版本信息-请求错误：",response)
                });
        },
        //输入域名获取对应的站点列表
        getSite:function(){
            var verDomain = this.verDomain;
            if(verDomain==="") {
                showTips("域名不能为空!","#verDomain");
                $('#siteArr').html('<option value="">-请先输入域名-</option>');
                form.render();
            }else if(!IsURL(verDomain)){
                showTips("域名格式不正确!","#verDomain");
                $('#siteArr').html('<option value="">-请先输入域名-</option>');
                form.render();
            }else{
                $('#siteArr').html('<option value="00000000000000000000000000000000">默认站点</option>');
                form.render();
                this.$http.get(HTTP.url+"backUp/siteCode?domain="+verDomain,{credentials: true})
                    .then(function(response){
                        console.log("获取站点列表-请求成功：",response.data);
                        //未登录就跳转到登录页面
                        if(response.data.code==="08"){
                            console.log(response.data.msg||"未登录");
                            window.location.href="login.html";
                        }
                        if(response.data.code==="00"){
                            var list = response.data.data.list;
                            this.$set(this,"siteArr",list);
                            this.showSiteArr();
                        }else{
                            showTips(response.data.msg,"#verDomain");
                        }
                    })
                    .catch(function(response) {
                        console.log("获取站点列表-请求错误：",response)
                    });
            }
        },
        //展示此域名下的站点列表
        showSiteArr:function(){
            var siteArr = this.siteArr;
            var str = '<option value="">-请选择站点-</option>';
            $('#siteArr').html('');
            $('#siteArr').siblings().remove();
            for(let i=0;i<siteArr.length;i++){
                str+='<option value="'+siteArr[i].site_id+'">'+siteArr[i].site_name+'</option>';
            }
            $('#siteArr').html(str);
            form.render();
            showTips("请选择站点",".lay-select");
            this.siteChange();
        },
        //选择某一个站点
        siteChange:function(){
            var _this = this;
            form.on('select(verSite)', function(data){
                var selectedV = parseInt(data.value); //得到被选中的值
                _this.$set(_this,"verSite",selectedV);
            });
        },
    //第二步"设置图标"
        //上传图标
        changeIcon:function(){
            var _this = this;
            var uploadInst = upload.render({
                elem: '#icon'
                ,url: HTTP.url+'file/uploadPic/verIcon'
                ,data:{
                    vId:_this.id
                }
                ,method:'post'
                ,accept:'images'
                ,before: function(obj){
                    loadingStart();
                }
                ,done: function(res) {
                    //未登录就跳转到登录页面
                    if (res.code === "08") {
                        console.log(res.msg || "未登录");
                        window.location.href = "login.html";
                    }
                    loadingEnd();

                    if (res.code === "00") {
                        //上传成功
                        showMsg('上传成功');
                        _this.$set(_this, "icon", res.data.url);
                        //第二步成功保存后，允许设置第三个步骤,但不跳转到第三步？
                        if (!this.finishStep2) {
                            _this.$set(_this, "finishStep2", true);
                        }
                        // setTimeout(function(){
                        //     _this.tabChange(3);
                        // },10);
                    } else {
                        //如果上传失败
                        return showMsg('上传失败');
                    }
                }
                ,error: function(){
                    loadingEnd();
                }
            });
        },
        //使用默认图标
        userDefaultIcon: function(imgStr){
            this.$http.post(HTTP.url+"version/update",{
                id:this.id,
                icon:imgStr
            },{credentials: true})
                .then(function(response){
                    console.log("使用默认图标-请求成功：",response.data);
                    if(response.data.code==="00"){
                        this.$set(this,"icon",response.data.data.icon);
                        this.pack();
                    }else if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }else{
                        showMsg(response.data.msg||"使用默认图标失败");
                    }
                })
                .catch(function(response) {
                    console.log("使用默认图标-请求错误：",response)
                });
        },
    //第三步"设置启动页"
        //上传启动页图片
        changeStartupImg:function(){
            console.log("nimahi?");
            var _this = this;
            var uploadInst = upload.render({
                elem: '#startPage'
                ,url: HTTP.url+'file/uploadPic/verStartUp'
                ,data:{
                    vId:_this.id
                }
                ,method:'post'
                ,accept:'images'
                ,before: function(obj){
                    //预读本地文件示例，不支持ie8
                    obj.preview(function(index, file, result){
                        $('#startupImg').attr('src', result); //图片链接（base64）
                    });
                    loadingStart();
                }
                ,done: function(res){
                    //未登录就跳转到登录页面
                    if(res.code==="08"){
                        console.log(res.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();

                    if(res.code ==="00"){
                        //上传成功
                        showMsg('上传成功');
                        _this.$set(_this,"startupImg",res.data.url);
                        //第三步成功保存后，允许设置第四个步骤,但不跳转到第四步？
                        if(!this.finishStep3) {
                            _this.$set(_this, "finishStep3", true);
                        }
                        // setTimeout(function(){
                        //     _this.tabChange(4);
                        // },10);
                    }else{
                        //演示失败状态，并实现重传
                        var demoText = $('#uploadText');
                        demoText.html('<span style="color: #FF5722;margin-right: 1.4rem;">上传失败</span> <a class="layui-btn layui-btn-mini demo-reload">重试</a>');
                        demoText.find('.demo-reload').on('click', function(){
                            uploadInst.upload();
                        });
                        return showMsg('上传失败');
                    }

                }
                ,error: function(){
                    loadingEnd();
                    //演示失败状态，并实现重传
                    var demoText = $('#uploadText');
                    demoText.html('<span style="color: #FF5722;margin-right: 1.4rem;">上传失败</span> <a class="layui-btn layui-btn-mini demo-reload">重试</a>');
                    demoText.find('.demo-reload').on('click', function(){
                        uploadInst.upload();
                    });
                }
            });
        },
        //使用默认启动页
        userDefaultStartupImg: function(imgStr){
            this.$http.post(HTTP.url+"version/update",{
                id:this.id,
                startupImg:imgStr
            },{credentials: true})
                .then(function(response){
                    console.log("使用默认启动页-请求成功：",response.data);
                    if(response.data.code==="00"){
                        this.$set(this,"startupImg",response.data.data.startupImg);
                        this.pack();
                    }else if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }else{
                        showMsg(response.data.msg||"使用默认启动页失败");
                    }
                })
                .catch(function(response) {
                    console.log("使用默认启动页-请求错误：",response)
                });
        },
    //第四步"选择组件"
        //获取所有组件
        getAssembly:function(){
            this.$http.post(HTTP.url+"plugin/searchAll",{},{credentials: true})
                .then(function(response){
                    console.log("获取组件-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    var assemblyArr = response.data.data;
                    this.cleanAssembly(assemblyArr);
                })
                .catch(function(response) {
                    console.log("获取组件-请求错误：",response)
                });
        },
        //获取组件后，把版本中已经添加的组件从“待添加组件”中清除掉
        cleanAssembly:function(assemblyArr){
            var assembly_added = this.assembly_added;
            var assembly_tobeadd = assemblyArr;
            var temp = []; //临时数组
            var newTobeAdd = [];
            for (var i = 0; i < assembly_added.length; i++) {
                temp[assembly_added[i].code] = true;
            }
            for (let j=0;j<assembly_tobeadd.length;j++){
                if (!temp[assembly_tobeadd[j].code]) {
                    newTobeAdd.push(assembly_tobeadd[j]);
                }
            }
            this.$set(this,"assembly_tobeadd",newTobeAdd);
        },
        //添加组件
        addAssembly:function(code){
            var assembly_added = this.assembly_added;
            var assembly_tobeadd = this.assembly_tobeadd;
            var newTobeAdd = [];
            for (let i=0;i<assembly_tobeadd.length;i++){
                if(assembly_tobeadd[i].code===code){
                    assembly_added.push(assembly_tobeadd[i]);
                }else{
                    newTobeAdd.push(assembly_tobeadd[i]);
                }
            }
            this.$set(this,"assembly_tobeadd",newTobeAdd);
        },
        //删除组件
        removeAssembly:function(code){
            var assembly_added = this.assembly_added;
            var assembly_tobeadd = this.assembly_tobeadd;
            var newAdded = [];
            for (let i=0;i<assembly_added.length;i++){
                if(assembly_added[i].code===code){
                    assembly_tobeadd.push(assembly_added[i]);
                }else{
                    newAdded.push(assembly_added[i]);
                }
            }
            this.$set(this,"assembly_added",newAdded);
        },
        //保存添加的组件
        saveAssembly:function(){
            loadingStart();
            var assembly_added = this.assembly_added;
            var versionVsPluginBeanIdList = [];
            for (let i=0;i<assembly_added.length;i++){
                versionVsPluginBeanIdList.push(assembly_added[i].id);
            }
            this.$http.post(HTTP.url+"version/appendPlugins",{
                vId:this.id,
                versionVsPluginBeanIdList: versionVsPluginBeanIdList
            },{credentials: true})
                .then(function(response){
                    console.log("保存添加的组件-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    if(response.data.code==="00"){
                        showMsg('保存成功');
                        //第四步成功保存后，允许设置第五个步骤,并跳转到第五步
                        if(!this.finishStep4) {
                            this.$set(this, "finishStep4", true);
                        }
                        var _this =this;
                        setTimeout(function(){
                            _this.tabChange(5);
                        },10);
                        //获取最新版本信息及状态
                        this.getEditionData();
                    }else{
                        showMsg(response.data.msg||"保存失败");
                    }

                })
                .catch(function(response) {
                    console.log("保存添加的组件-请求错误：",response)
                });
        },
    //第五步"配置组件"
        //进入可视化配置中心
        goToVisual:function(){
            window.location.href=this.url+"?"+this.id;
        },
    //第六步"打包购买"
        //查询应用是否购买服务
        searchService: function(){
            this.$http.post(HTTP.url+"order/searchByCndts",{
                appId:this.appID
            },{credentials: true})
                .then(function(response){
                    console.log("查询应用是否购买服务-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    var serviceList = response.data.data;
                    if(!serviceList||serviceList.length===0){
                        this.$set(this,"boughtService",false); //没有购买
                    }else if(serviceList.length>0){
                        this.$set(this,"boughtService",true);  //已经购买
                    }
                })
                .catch(function(response) {
                    console.log("查询应用是否购买服务-请求错误：",response)
                });
        },
        //查询打包流程信息
        searchPack: function(){
            this.$http.post(HTTP.url+"trail/searchByVId",{
                vId:this.id,
                valid:true
            },{credentials: true})
                .then(function(response){
                    console.log("查询打包流程-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    var result =  response.data.data;
                    var maxStatus = 0;
                    for(let i=0;i<result.length;i++){
                        let s = result[i].status;
                        switch(s)
                        {
                            case 1:
                                var applyTime = result[i].time;
                                this.$set(this,"applyTime",applyTime);
                                this.$set(this,"estimateFinishTime",getTwoWeekslater(applyTime)); //预计完成时间为两周后
                                break;
                            case 2:
                                var startPackTime = result[i].time;
                                this.$set(this,"startPackTime",startPackTime);
                                break;
                            case 3:
                                var finishPackTime = result[i].time;
                                this.$set(this,"finishPackTime",finishPackTime);
                                $(".layui-tab-title li").last().removeClass("hide");
                                break;
                            default:
                                console.log(s);
                        }
                        if(s>=maxStatus){
                            maxStatus = s;
                        }
                    }
                    //改变进度
                    this.$set(this,"packProgress",maxStatus);
                    //改变进度条长度
                    this.timelineLength();

                })
                .catch(function(response) {
                    console.log("查询打包流程-请求错误：",response)
                });
        },
        //进度条样式
        timelineLength:function(){
            var status = this.packProgress;
            var width = '0';
            switch(status)
            {
                case 1:
                    width = '0';
                    break;
                case 2:
                    width = '50%';
                    break;
                case 3:
                    width = '100%';
                    break;
                default:
                    console.log(status);
            }
            $(".blue").css("width",width);
        },
        //确定打包
        pack:function(){
            loadingStart();
            this.$http.post(HTTP.url+"trail/add",{
                vId:this.id,
                status: 1, //表示用户提交打包申请
                description:"www.mangrove.com",
                pkg:{
                    androidPkg:"www.mangrove.com",
                    bgPkg:"www.mangrove.com",
                    iosPkg:"www.mangrove.com"
                }
            },{credentials: true})
                .then(function(response){
                    console.log("申请打包-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    var code = response.data.code;

                    if(code==="00"){
                        //进入打包流程，显示打包进度模块，查询打包进度信息
                        this.changeStatus(6);//改变版本状态
                        this.searchPack();
                    }else if(code==="v041"){
                        //启动页未上传
                        var imgStr = response.data.data;
                        this.noStartupImg(imgStr);
                    }else if(code==="v042"){
                        //版本图标未上传
                        var imgStr = response.data.data;
                        this.noIcon(imgStr);
                    }else if(code==="v046"){
                        //版本导航栏未绑定模块功能
                        this.noFooterPS();
                    }else if(code==="v044"){
                        //应用中存在未购买的组件
                        var orderID = response.data.data.data.id;
                        this.unpaid(orderID);
                    }

                })
                .catch(function(response) {
                    console.log("申请打包-请求错误：",response)
                });
        },
        //确定终止打包
        endPack:function(){
            loadingStart();
            this.$http.post(HTTP.url+"trail/add",{
                vId:this.id,
                status: 4, //表示用户申请终止打包
                description:"www.mangrove.com",
                pkg:{
                    androidPkg:"www.mangrove.com",
                    bgPkg:"www.mangrove.com",
                    iosPkg:"www.mangrove.com"
                }
            },{credentials: true})
                .then(function(response){
                    console.log("申请终止打包-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    var _this = this;
                    //打包终止后页面恢复到打包前状态
                    layer.open({
                        type: 1,
                        closeBtn: 0, //不显示关闭按钮
                        anim: 4,
                        btnAlign: 'c',
                        shadeClose: false, //不开启遮罩关闭
                        area:'480px',
                        title :false,
                        content: '<span class="glyphicon glyphicon-ban-circle"></span><p>打包任务已经终止</p>',
                        btn: ['确定'],
                        yes: function(index, layero){
                            layer.close(index);
                            _this.changeStatus(5);//改变版本状态
                        }
                    });

                })
                .catch(function(response) {
                    console.log("申请终止打包-请求错误：",response)
                });
        },
        //启动页未上传
        noStartupImg:function(imgStr){
            var _this = this;
            layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 4,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :false,
                content: '<span class="glyphicon glyphicon-exclamation-sign"></span><h2>消息</h2><p>未上传启动页，是否使用默认图片？</p>',
                btn: ['确定', '去上传'],
                yes: function(index, layero){
                    //上传默认启动页
                    _this.userDefaultStartupImg(imgStr);
                    layer.close(index);
                },
                btn2: function(index, layero){
                    //切换到 “设置启动页”
                    _this.tabChange(3);
                    layer.close(index);
                }
            });
        },
        //版本图标未上传
        noIcon:function(imgStr){
            var _this = this;
            layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 4,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :false,
                content: '<span class="glyphicon glyphicon-exclamation-sign"></span><h2>消息</h2><p>未上传版本图标，是否使用默认图案？</p>',
                btn: ['确定', '去上传'],
                yes: function(index, layero){
                    //上传默认图标
                    _this.userDefaultIcon(imgStr);
                    layer.close(index);
                },
                btn2: function(index, layero){
                    //切换到 “设置名称图标”
                    _this.tabChange(2);
                    layer.close(index);
                }
            });
        },
        //版本导航栏未绑定模块功能
        noFooterPS:function(){
            var _this = this;
            layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 4,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :false,
                content: '<span class="glyphicon glyphicon-exclamation-sign"></span><h2>消息</h2><p>版本导航栏未绑定模块功能</p>',
                btn: ['去配置', '取消'],
                yes: function(index, layero){
                    //进入可视化配置中心
                    _this.goToVisual();
                    layer.close(index);
                },
                no: function(index, layero){
                    layer.close(index);
                }
            });
        },
        //应用中存在未购买的组件
        unpaid:function(orderID){
            var _this = this;
            layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 4,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :false,
                content: '<span class="glyphicon glyphicon-exclamation-sign"></span><h2>消息</h2><p>应用中存在未购买的组件</p>',
                btn: ['去付款', '取消'],
                yes: function(index, layero){
                    //跳转购买页面
                    window.location.href="pay.html?"+orderID;
                    layer.close(index);
                },
                no: function(index, layero){
                    layer.close(index);
                }
            });

        },
        //我要打包
        // wantPack:function(){
        //     var _this = this;
        //     layer.open({
        //         type: 1,
        //         closeBtn: 0, //不显示关闭按钮
        //         anim: 4,
        //         btnAlign: 'c',
        //         shadeClose: true, //开启遮罩关闭
        //         area:'480px',
        //         title :false,
        //         content: '<span class="glyphicon glyphicon-exclamation-sign"></span><h2>消息</h2><p>确定要打包？</p>',
        //         btn: ['确定', '取消'],
        //         yes: function(index, layero){
        //             _this.pack();
        //             layer.close(index);
        //         },
        //         no: function(index, layero){
        //             layer.close(index);
        //         }
        //     });
        // },
        //我要终止打包
        wantEndPack:function(){
            var _this = this;
            layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 4,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :false,
                content: '<span class="glyphicon glyphicon-exclamation-sign"></span><h2>消息</h2><p>确定终止此次打包？</p>',
                btn: ['确定终止', '取消'],
                yes: function(index, layero){
                    _this.endPack();
                    layer.close(index);
                },
                no: function(index, layero){
                    layer.close(index);
                }
            });
        },
    //第七步"下载安装"
        //确认购买
        buy:function(){

        },
        //点击购买专业集成服务
        wantBuy:function(){

        },
    //改变版本状态后
        changeStatus:function(code){
            this.$set(this,"status",code);
        }
    }
});

$(function(){

    //Hash地址的定位
    var layid = location.hash.replace(/^#step=/, '');
    element.tabChange('step', layid);

    element.on('tab(step)', function(){
        location.hash = 'step='+ $(this).attr('lay-id');
    });

});

function getTwoWeekslater(dateString){
    var d=new Date(dateString);
    d.setDate(d.getDate()+15);
    var year = d.getFullYear();
    var month = d.getMonth()+1;
    var day = d.getDate();
    return year+"年"+month+"月"+day+"日"
}

function IsURL(url){
    var reg=/^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
    return reg.test(url)
}

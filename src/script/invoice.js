
var layer = layui.layer;
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
//发票历史记录表格，更新数据后需要重绘。
var table;

var Invoice = new Vue({
    el: "#invoice_container",
    data: {
        userID: null,     //用户ID
        toEditInvoice: false,     //展开编辑开票信息组件的判断条件
        toEditMail: false,        //展开编辑邮寄信息组件的判断条件
        availableBalance: 0,    //可开票金额
        invoiceValue:0,        //开票金额
        invoiceTypeList:[
            {
                type:0,
                name:"企业增值税普通发票"
            },
            {
                type:1,
                name:"企业增值税专用发票"
            },
            {
                type:2,
                name:"组织增值税普通发票"
            },
            {
                type:3,
                name:"个人增值税普通发票"
            }
        ],       //发票类型
        invoiceID:null,     //发票信息的id
        invoiceInfo: {
            // type: 1,
            // typeName:"企业增值税普通发票",
            // title: "成都索贝数码科技股份有限公司",
            // identifyNum:"91510100709253064R",
            // accountBank:"中国光大银行成都光华支行",
            // accountNum:"8782712003949058995",
            // registeredAddress:"四川省成都市高新区新园南二路2号"
        },    //发票信息
        mailID:null,     //邮寄信息的id
        mailInfo: {
            // address: "四川省成都市高新区新园南二路2号",
            // linkman: "张瑜婷",
            // phoneNum:"13981157223",
            // postalcode:"610041"
        },     //邮寄信息
        invoiceModel:{
            // type: 1,
            // typeName:"企业增值税普通发票",
            // title: "成都索贝数码科技股份有限公司",
            // identifyNum:"91510100709253064R",
            // accountBank:"中国光大银行成都光华支行",
            // accountNum:"8782712003949058995",
            // registeredAddress:"四川省成都市高新区新园南二路2号"
        },     //编辑面板的表单绑定内容
        mailModel: {
            // address: "四川省成都市高新区新园南二路2号",
            // linkman: "张瑜婷",
            // phoneNum:"13981157223",
            // postalcode:"610041"
        },     //编辑面板的表单绑定内容
        invoiceList:[]    //表格中的发票列表
    },
    mounted: function () {
        this.getUserInfo();
        //初始化开票记录表格
        this.initTable('#invoiceTable');
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
                    //用户ID
                    var userID = response.data.data.id;
                    this.$set(this,'userID',userID);
                    //可开票金额
                    var availableBalance = response.data.data.iAvailable;
                    this.$set(this,'availableBalance',availableBalance);
                    //获取最新开票信息
                    this.getInvoiceInfo();
                    //获取最新邮寄信息数据
                    this.getMailInfo();
                    //获取最新开票历史记录
                    this.getInvoiceList();
                })
                .catch(function(response) {
                    console.log("查询当前用户信息-请求错误：",response)
                });
        },
        //查询开票信息
        getInvoiceInfo: function () {
            this.$http.post(HTTP.url+"info/searchLastBillInfo",{
                "uId":this.userID      //用户id
            },{credentials: true})
                .then(function(response){
                    console.log("查询开票信息-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    var result = response.data.data;
                    //发票信息的ID
                    var invoiceID = response.data.data.id;
                    this.$set(this,'invoiceID',invoiceID);

                    var invoiceTypeList = this.invoiceTypeList;
                    var typeName = "";
                    for(let i = 0;i<invoiceTypeList.length;i++){
                        if(invoiceTypeList[i].type===result.type){
                            typeName = invoiceTypeList[i].name;
                        }
                    }
                    var invoiceInfo = {
                        type: result.type,
                        typeName:typeName,
                        title: result.title,
                        identifyNum:result.taxCode,
                        accountBank:result.bankName,
                        accountNum:result.bankCount,
                        registeredAddress:result.registerAddr
                    };
                    var invoiceModel = {
                        type: result.type,
                        typeName:typeName,
                        title: result.title,
                        identifyNum:result.taxCode,
                        accountBank:result.bankName,
                        accountNum:result.bankCount,
                        registeredAddress:result.registerAddr
                    };
                    this.$set(this,'invoiceInfo',invoiceInfo); //发票信息
                    this.$set(this,'invoiceModel',invoiceModel); //编辑面板的表单绑定内容
                })
                .catch(function(response) {
                    console.log("查询开票信息-请求错误：",response)
                });
        },
        //查询邮寄信息
        getMailInfo: function () {
            this.$http.post(HTTP.url+"info/searchLastMail",{
                "uId":this.userID      //用户id
            },{credentials: true})
                .then(function(response){
                    console.log("查询邮寄信息-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    var result = response.data.data;
                    //邮寄信息的ID
                    var mailID = response.data.data.id;
                    this.$set(this,'mailID',mailID);

                    var mailInfo = {
                        address: result.mailAddr,
                        linkman: result.contactName,
                        phoneNum:result.contactNo,
                        postalcode:result.postCode
                    };
                    var mailModel = {
                        address: result.mailAddr,
                        linkman: result.contactName,
                        phoneNum:result.contactNo,
                        postalcode:result.postCode
                    };
                    this.$set(this,'mailInfo',mailInfo); //邮寄信息
                    this.$set(this,'mailModel',mailModel); //编辑面板的表单绑定内容
                })
                .catch(function(response) {
                    console.log("查询邮寄信息-请求错误：",response)
                });
        },
        //查询开票历史记录
        getInvoiceList: function () {
            this.$http.post(HTTP.url+"invoice/searchByCndts",{
                "uId":this.userID      //用户id
            },{credentials: true})
                .then(function(response){
                    console.log("查询开票历史记录-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    var result = response.data.data;
                    var invoiceList = [];
                    for(let i=0;i<result.length;i++){
                        invoiceList.push({
                            time:result[i].createTime,
                            money:result[i].value,
                            title:result[i].billInfoBean.title,
                            status:result[i].status
                        });
                    }
                    this.$set(this,'invoiceList',invoiceList);
                    //重绘开票记录表格
                    table.destroy();
                    var _this = this;
                    setTimeout(function(){
                        _this.initTable('#invoiceTable');
                    },10);
                })
                .catch(function(response) {
                    console.log("查询开票历史记录-请求错误：",response)
                });
        },
        //开票历史的表格初始化
        initTable: function(DOMid){
            table=$(DOMid).DataTable({
                "info": false,  //左下角信息
                "paging": true,   //开启分页
                "ordering": true,   //开启排序
                "lengthChange": false,   //每页显示多少条
                "pageLength": 20,
                "lengthMenu": [ 5, 10, 20, 50],
                "searching": false,    //本地搜索
                "language":{
                    "emptyTable":     "暂无数据",
                    "info":           "Showing _START_ to _END_ of _TOTAL_ entries",
                    "infoEmpty":      "Showing 0 to 0 of 0 entries",
                    "infoFiltered":   "(filtered from _MAX_ total entries)",
                    "infoPostFix":    "",
                    "thousands":      ",",
                    "lengthMenu":     "每页显示 _MENU_ 条",
                    "loadingRecords": "Loading...",
                    "processing":     "Processing...",
                    "search":         "搜索:",
                    "zeroRecords":    "无符合搜索条件的数据",
                    "paginate": {
                        "first":      "首页",
                        "last":       "末页",
                        "next":       "下一页",
                        "previous":   "上一页"
                    },
                    "aria": {
                        "sortAscending":  ": activate to sort column ascending",
                        "sortDescending": ": activate to sort column descending"
                    }
                }
            });
        },
        //打开编辑开票信息的面板
        editInvoiceInfo: function () {
            $(".card1").css({
                display:'none'
            });
            $(".card2").css({
                display:'block',
                animation:'open 1s forwards'
            });
        },
        //打开编辑邮寄信息的面板
        editMailInfo: function () {
            $(".card1").css({
                display:'none'
            });
            $(".card3").css({
                display:'block',
                animation:'open 1s forwards'
            });
        },
        back: function () {
            $(".card2").css({
                display:'none'
            });
            $(".card3").css({
                display:'none'
            });
            $(".card1").css({
                display:'block',
                animation:'open 1s forwards'
            });
        },
        //提交开票信息
        submitInvoice:function(){
            console.log(this.invoiceModel);
            loadingStart();
            this.$http.post(HTTP.url+"info/addBillInfo",{
                "uId":this.userID,      //用户id
                "type":this.invoiceModel.type,      //发票类型
                "title":this.invoiceModel.title,      //抬头
                "taxCode":this.invoiceModel.identifyNum,     // 纳税人识别号
                "bankName":this.invoiceModel.accountBank,  // 开户行
                "bankCount":this.invoiceModel.accountNum,   // 开户账号
                "registerAddr":this.invoiceModel.registeredAddress  // 注册地址
            },{credentials: true})
                .then(function(response){
                    console.log("提交开票信息-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    showMsg("保存成功");
                    loadingEnd();
                    //获取最新开票信息
                    this.getInvoiceInfo();
                    this.back();
                })
                .catch(function(response) {
                    console.log("提交开票信息-请求错误：",response)
                });
        },
        //提交邮寄信息
        submitMail:function(){
            console.log(this.mailModel);
            loadingStart();
            this.$http.post(HTTP.url+"info/addMail",{
                "uId":this.userID,      //用户id
                "mailAddr":this.mailModel.address,  //邮寄地址
                "contactName":this.mailModel.linkman,  //联系人
                "contactNo":this.mailModel.phoneNum,  //电话
                "postCode":this.mailModel.postalcode  //邮政编码
            },{credentials: true})
                .then(function(response){
                    console.log("提交邮寄信息-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    showMsg("保存成功");
                    loadingEnd();
                    //获取最新邮寄信息数据
                    this.getMailInfo();
                    this.back();
                })
                .catch(function(response) {
                    console.log("提交邮寄信息-请求错误：",response)
                });
        },
        //未填写发票信息
        noInvoiceInfo:function(){
            var _this = this;
            layer.open({
                id:"noInvoiceInfo",
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 4,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :false,
                content: '<span class="glyphicon glyphicon-exclamation-sign"></span><h2>消息</h2><p>未填写完整的发票信息</p>',
                btn: ['去填写', '取消'],
                yes: function(index, layero){
                    //编辑开票信息
                    _this.editInvoiceInfo();
                    layer.close(index);
                },
                btn2: function(index, layero){
                    layer.close(index);
                }
            });
        },
        //未填写邮寄信息
        noMailInfo:function(){
            var _this = this;
            layer.open({
                id:"noMailInfo",
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 4,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :false,
                content: '<span class="glyphicon glyphicon-exclamation-sign"></span><h2>消息</h2><p>未填写邮寄地址</p>',
                btn: ['去填写', '取消'],
                yes: function(index, layero){
                    //编辑邮寄信息
                    _this.editMailInfo();
                    layer.close(index);
                },
                btn2: function(index, layero){
                    layer.close(index);
                }
            });
        },
        //弹出开发票弹窗
        drawBill:function (lastNum) {
            var theNum = lastNum?lastNum:""; //从预览返回的时候在输入框显示上一次输入的开票金额
            var availableBalance = this.availableBalance;
            var _this = this;
            layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 2,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'480px',
                title :'发票',
                content: '<form class="form-horizontal" role="form"><div class="form-group">'+
                '<label for="invoiceValue" class="col-sm-12 control-label">请输入本次开票金额</label><div class="col-sm-12">'+
                '<input type="text" class="form-control" id="invoiceValue" name="invoiceValue" value="'+theNum+'" placeholder=""><div class="col-sm-12 tips">'+
                '* 本次最多可开 <span>'+availableBalance+'</span> 元'+
                '</div></div></div></form>',
                btn: ['下一步', '取消'],
                yes: function(index, layero){
                    var invoiceValue = $("#invoiceValue").val();
                    if(invoiceValue===""){
                        showMsg("开票金额不能为空！");
                    }else if(!(/(^[1-9]\d*$)/.test(invoiceValue))){
                        showMsg("输入金额格式不正确！");
                    }else{
                        var invoiceNum = parseInt(invoiceValue);
                        if(invoiceNum>availableBalance){
                            showMsg("可开票金额不足！");
                        }else{
                            _this.viewDrawBill(invoiceNum);
                            layer.close(index);
                        }
                    }
                },
                no: function(index, layero){
                    layer.close(index);
                }
            });
        },
        //发票确认
        viewDrawBill:function(invoiceNum){
            var _this = this;
            layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                anim: 2,
                btnAlign: 'c',
                shadeClose: true, //开启遮罩关闭
                area:'680px',
                title :'发票确认',
                content: '<form id="billComfirm" class="form-horizontal" role="form">'+
                            '<div class="form-group">'+
                                '<div class="col-sm-3 control-label">本次开票金额</div><div class="col-sm-9">'+invoiceNum+' 元</div>'+
                            '</div>'+
                            '<div class="form-group">'+
                                '<div class="col-sm-3 control-label">发票类型</div><div class="col-sm-9">'+_this.invoiceInfo.typeName+'</div>'+
                            '</div>'+
                            '<div class="form-group">'+
                                '<div class="col-sm-3 control-label">发票抬头</div><div class="col-sm-9">'+_this.invoiceInfo.title+'</div>'+
                            '</div>'+
                            '<div class="form-group">'+
                                '<div class="col-sm-3 control-label">纳税人识别号</div><div class="col-sm-9">'+_this.invoiceInfo.identifyNum+'</div>'+
                            '</div>'+
                            '<div class="form-group">'+
                                '<div class="col-sm-3 control-label">收件人</div><div class="col-sm-9">'+_this.mailInfo.linkman+'</div>'+
                            '</div>'+
                            '<div class="form-group">'+
                                '<div class="col-sm-3 control-label">电话号码</div><div class="col-sm-9">'+_this.mailInfo.phoneNum+'</div>'+
                            '</div>'+
                            '<div class="form-group">'+
                                '<div class="col-sm-3 control-label">邮寄地址</div><div class="col-sm-9">'+_this.mailInfo.address+'</div>'+
                            '</div>'+
                        '</form>',
                btn: ['确定', '返回修改'],
                yes: function(index, layero){
                    _this.$set(_this,"invoiceValue",invoiceNum);
                    _this.comfirmDrawBill();
                    layer.close(index);
                },
                btn2: function(index, layero){
                    _this.drawBill(invoiceNum);//返回修改，弹出输入开票金额的弹窗并显示上一步输入的开票金额
                    layer.close(index);
                }
            });
        },
        //提交申请开票
        comfirmDrawBill: function(){
            loadingStart();
            this.$http.post(HTTP.url+"invoice/add",{
                "uId":this.userID,  //用户id
                "bId":this.invoiceID,  //发票信息的ID
                "mId":this.mailID,  //邮寄信息的ID
                "value":parseInt(this.invoiceValue)  //开票金额
            },{credentials: true})
                .then(function(response){
                    console.log("开发票-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    showMsg("申请开票成功");
                    loadingEnd();
                    //获取最新数据
                    this.getUserInfo();
                })
                .catch(function(response) {
                    console.log("开发票-请求错误：",response)
                });
        }
    }
});
$().ready(function() {
    // 在键盘按下并释放及提交后验证提交表单
    $("#invoiceInfoForm").validate({
        //验证规则
        rules: {
            title: {
                required: true
            },
            identifyNum: {
                required: true
            },
            accountBank: {
                required: true
            },
            accountNum: {
                required: true
            },
            registeredAddress: {
                required: true
            }
        },
        //提示信息
        messages: {
            title: {
                required: "请输入发票抬头"
            },
            identifyNum: {
                required: "请输入纳税人识别号"
            },
            accountBank: {
                required: "请输入开户银行"
            },
            accountNum: {
                required: "请输入开户账号"
            },
            registeredAddress: {
                required: "请输入注册场所地址"
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
            //向后台发送开票信息
            Invoice.submitInvoice();
            return false;//阻止表单提交
        }
    });

    $("#mailInfoForm").validate({
        //验证规则
        rules: {
            address: {
                required: true
            },
            linkman: {
                required: true
            },
            phoneNum: {
                required: true
            },
            postalcode: {
                required: true
            }
        },
        //提示信息
        messages: {
            address: {
                required: "请输入邮寄地址"
            },
            linkman: {
                required: "请输入联系人姓名"
            },
            phoneNum: {
                required: "请输入手机号码"
            },
            postalcode: {
                required: "请输入邮政编码"
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
            //向后台发送开票信息
            Invoice.submitMail();
            return false;//阻止表单提交
        }
    });
});
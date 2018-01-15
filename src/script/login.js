
// 获取验证码
function getCode(){
	$.ajax({
		type:"get",
		url:HTTP.url+'u/getValidateCode?time=1',
		dataType:"json",
		xhrFields:{withCredentials:true},
		crossDomain: true,
		// contentType: "application/json",
		success:function(res){
			if(res.code!="00"){
				alert("获取验证码失败！");
				return false;
			}
			var usercode = "data:image/png;base64,"+res.data;
			$(".code img").attr("src",usercode);
		},
		error:function(err){
			console.error(err)
		}
	})
}

// 登陆
function login(parmas){
	$.ajax({
		type:"post",
		url: HTTP.url+'u/login',
		data:JSON.stringify(parmas),
		dataType:"json",
		contentType:"application/json",
		xhrFields:{withCredentials:true},
		crossDomain: true,
		beforeSend:function(){
			$("#login").addClass("disabled").text("正在登陆，请稍后...");
		},
		success:function(res){
			if(res.code!="00"){
				$(".error-line").show();
				$(".error-line span").text("登陆失败！"+res.msg)
				$("#login").removeClass("disabled").text("登陆");
				getCode();
				return false;
			}
			$("#login").text("登陆成功，正在跳转...");

			setTimeout(function(){
				// window.location.href = "../index.html"
                window.location.href = "appOverview.html"
			},500)
		},
		error:function(err){
			$("#login").removeClass("disabled").text("登陆");
			$(".error-line").show();
			$(".error-line span").text(err.statusText)
			getCode();
			console.error(err)
		}
	})
}

$(document).ready(function () {

	getCode();

	$("#login").click(function(event){
		var username = $("input[name='username']").val();
		var password = $("input[name='password']").val();
		var code = $("input[name='code']").val();
		var emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
		if(username==""){
			$("input[name='username']").focus();
			$(".error-line").show();
			$(".error-line span").text("请输入邮箱地址")
			return false;
		}
		else if(!emailReg.test(username)){
			$("input[name='username']").focus();
			$(".error-line").show();
			$(".error-line span").text("输入邮箱格式不正确")
			return false;
		}
		else if(password==""){
			$("input[name='password']").focus();
			$(".error-line").show();
			$(".error-line span").text("请输入密码")
			return false;
		}
		else if(code==""){
			$("input[name='code']").focus();
			$(".error-line").show();
			$(".error-line span").text("请输入验证码")
			return false;
		}

		var parmas = {
			email:username,
			pwd:password,
			validateCode:code
		}
		login(parmas)
	});

	$(".code p").click(function(){
		getCode();
	})

	$(document).keydown(function(event){ 
		if(event.keyCode==13){
			$("#login").click();
		}
	})
   
});
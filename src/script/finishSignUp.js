$("#finishSignUp").on("click",function(){
    var obj = {
        id:parseInt(location.href.split("?")[1]),
        organize: $("#institution").val()
    };
    sendMessage(obj);
});
function sendMessage(obj) {
    $.ajax({
        type:"POST",
        url:HTTP.url+"u/userUpdate",
        data:JSON.stringify(obj),
        contentType:"application/json",
        error:function(errorMsg){
            console.log(errorMsg);
        },
        success:function(result){
            console.log(result);
            window.location.href = "login.html";
        }

    });
}
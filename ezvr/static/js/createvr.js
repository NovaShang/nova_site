var token;
var bucketname;
var fileControl;
var urn;
var _fileUploadData;
var projectname;
$(Document).ready(function() {
    fileControl = document.getElementById("select-file");
    $("#start-button").click(start)
})

var start = function() {
    if ($("#name")[0].value == "") {
        alert("请输入项目名称");
        return;
    }
    projectname = $("#name")[0].value;
    if ($("#select-file")[0].files.length == 0) {
        alert("请选择文件");
        return;
    }
    $("#current-status").text("正在获取Token");
    getToken();
}

function getToken() {
    $.ajax({
        url: "/ezvr/gettoken",
        type: "GET",
        success: function(data) {
            token = data.access_token;
            $("#current-status").text("正在正在创建Bucket");
            createBucket()
        },
        error: function(resp) {
            $("#current-status").text("获取TOKEN失败，请检查网络并刷新重试。");
        }
    })
}

function createBucket() {
    bucketname = new GUID().newGUID();
    $.ajax({
        url: "https://developer.api.autodesk.com/oss/v2/buckets",
        type: "POST",
        contentType: "application/json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + token)
        },
        data: '{"bucketKey":"' + bucketname + '","policyKey":"transient"}',
        success: function(data) {
            $("#current-status").text("正在读取文件");
            startRead()
        },
        error: function(resp) {
            $("#current-status").text("创建BUCKET失败，请检查网络并刷新重试。");
        }
    })
}

function startRead() {
    var file = fileControl.files[0];
    if (file) {
        var reader = new FileReader();
        var blob = file.slice(0, file.size);
        reader.readAsArrayBuffer(blob);

        reader.onprogress = updateProgress;
        reader.onload = loaded;
        reader.onerror = function(resp) {
            $("#current-status").text("读取文件失败");
        };
    }
}

function updateProgress(evt) {
    if (evt.lengthComputable) {
        var loaded = (evt.loaded / evt.total);
        if (loaded < 1) {
            $("#current-status").text("读取文件 " + loaded);
        }
    }
}



function loaded(evt) {
    _fileUploadData = evt.target.result;

    $("#current-status").text("正在上传文件");

    var fileObj = fileControl.files[0];

    var jqxhr = $.ajax({
        url: "https://developer.api.autodesk.com/oss/v2/buckets/" + bucketname + '/objects/' + fileObj.name,
        type: 'PUT',
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": 'application/stream'
        },
        data: _fileUploadData, // global var set by FileUploader.js in the "loaded(evt)" function
        processData: false,
        success: function(data) {
            urn = data.objectId;
            urn = Base64.encode(urn).replace("=", "");
            $("#current-status").text("请求转换SVF");
            convertsvf();
        },
        error: function(resp) {
            $("#current-status").text("上传文件失败，请检查网络并刷新重试。");
        }
    });
}

function convertsvf() {
    $.ajax({
        url: "https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
        type: "POST",
        contentType: "application/json;charset=utf-8",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + token)
        },
        data: '{\n"input": {\n"urn":"{0}"\n},\n"output": {\n"formats": [\n{\n "type": "svf",\n"views": [\n"2d",\n"3d"\n]\n}\n]\n}\n}'.replace("{0}", urn),
        success: function(data) {
            $("#current-status").text("开始转换SVF");
            addtodb();
        },
        error: function(resp) {
            $("#current-status").text("请求转换SVF失败，请检查网络并刷新重试。");
        }
    })
}

function addtodb() {
    $.ajax({
        url: "/ezvr/addvrmodel/",
        type: "POST",
        headers: { "X-CSRFToken": getCookie("csrftoken") }  ,
        data: { "projectname": projectname, "urn": urn, "bucket": bucketname },
        success: function(data) {
            $("#current-status").text("所有工作完成");
            top.location = "/ezvr/mymodels/"
        },
        error: function(resp) {
            $("#current-status").text("写入数据库失败");
        }
    })
}

function getCookie(name)  {   
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");   
    if (arr = document.cookie.match(reg))      return unescape(arr[2]);   
    else      return null; 
} 
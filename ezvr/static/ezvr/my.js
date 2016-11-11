
var token;
var bucketname = new GUID().newGUID();
// var bucketname = bucketguid.newGUID;

var fileControl;
var urn;

$(Document).ready(function(){
    fileControl = document.getElementById("ui_filePicker");
    $("#bn_uploadFile").click(getToken)

})



function getToken(){
    $.ajax({
        url:"https://developer.api.autodesk.com/authentication/v1/authenticate",
        type:"POST",
        contentType:'application/x-www-form-urlencoded',
        data:"client_id=AEufTrqqxHwWoGK4tWsoWVsLGGbd8tvc&client_secret=qlZ2DWmmlKO1yw9u&grant_type=client_credentials&scope=bucket:create%20bucket:read%20data:read%20data:write",
        success:function(data){
            token = data.access_token;
            createBucket()
        }
    })
}

function createBucket(){
    $.ajax({
        url:"https://developer.api.autodesk.com/oss/v2/buckets",
        type:"POST",
        contentType:"application/json",
        beforeSend:function(xhr){
        xhr.setRequestHeader("Authorization", "Bearer "+ token)
        },
        data:'{"bucketKey":"'+bucketname+'","policyKey":"transient"}',
        success:function(data){
            // alert("bucket name: "+bucketname)
            // fileControl.addEventListener("change", startRead);
            startRead()

        }
    })
}




function startRead()
{
    var file = fileControl.files[0];
        if (file) {
            /*
            else {
                getAsText(file);
                alert("Name: "+file.name +"\n"+"Last Modified Date :"+file.lastModifiedDate);
            }*/
            getAsBinary(file);
        }
    // evt.stopPropagation();
    // evt.preventDefault();
}

function getAsBinary(readFile) {

    var reader = new FileReader();

   // reader.readAsBinaryString(readFile);
    
    var blob = readFile.slice(0, readFile.size);
    reader.readAsArrayBuffer (blob);

    // Handle progress, success, and errors
    reader.onprogress = updateProgress;
    reader.onload = loaded;
    reader.onerror = errorHandler;
}

function updateProgress(evt) {
    if (evt.lengthComputable) {
        // evt.loaded and evt.total are ProgressEvent properties
        var loaded = (evt.loaded / evt.total);

        if (loaded < 1) {
            $("#txt_fileLoadStatus").text("Reading File: " + loaded);
        }
    }
}

function loaded(evt) {
        // Obtain the read file data
    _fileUploadData = evt.target.result;

    //alert("file Loaded successfully");
    $("#txt_fileLoadStatus").text("File Read Successfully");
    $("#bn_uplaodFile").removeAttr("disabled");

    var fileObj = $('#ui_filePicker')[0].files[0];

    var jqxhr = $.ajax({
        url: "https://developer.api.autodesk.com/oss/v2/buckets/" + bucketname + '/objects/' + fileObj.name,
        type: 'PUT',
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": 'application/stream'
        },
        data: _fileUploadData,      // global var set by FileUploader.js in the "loaded(evt)" function
        processData: false,
        success:function(data){
            alert(data.objectId);
            urn = data.objectId;
            urn=Base64.encode(urn).replace("=","");
            convertsvf();
        }
    })
    .done(function(ajax_data) {
        $("#txt_resUploadFile").html(JSON.stringify(ajax_data, null, '   '));
    })
    .fail(function(jqXHR, textStatus) {
        $("#txt_resUploadFile").html(ajaxErrorStr(jqXHR));
    });
}

function errorHandler(evt) {
    if (evt.target.error.name == "NotReadableError") {
        // The file could not be read
    }
    $("#txt_fileLoadStatus").text("Could Not Read File");
}

function convertsvf(){
        $.ajax({
        url:"https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
        type:"POST",
        contentType:"application/json;charset=utf-8",
        beforeSend:function(xhr){
        xhr.setRequestHeader("Authorization", "Bearer "+ token)
        },
        data:'{\n"input": {\n"urn":"{0}"\n},\n"output": {\n"formats": [\n{\n "type": "svf",\n"views": [\n"2d",\n"3d"\n]\n}\n]\n}\n}'.replace("{0}",urn),
        success:function(data){
            alert("success");
        }
    })
}

// 
// Client ID AEufTrqqxHwWoGK4tWsoWVsLGGbd8tvc
// Client Secret qlZ2DWmmlKO1yw9u
var token;
var urn;


$(Document).ready(function() {
        urn = $("#urn").text();
        $("#urn").hide();
        getToken();
    }

)

function getToken() {
    $.ajax({
        url: "/ezvr/gettoken",
        type: "GET",
        success: function(data) {
            token = data.access_token;
            queryprogress()
            window.setInterval(queryprogress, 5000);
            Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', accessToken: token }, function onInitialized() {
                Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
            });
        },
        error: function(resp) {
            $("#current-progress").text("获取TOKEN失败，请检查网络并刷新重试。");
        }
    })
}


function onDocumentLoadSuccess(doc) {

    // A document contains references to 3D and 2D viewables.
    var viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), { 'type': 'geometry' }, true);
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }

    // Choose any of the avialble viewables
    var initialViewable = viewables[0];
    var svfUrl = doc.getViewablePath(initialViewable);
    var modelOptions = {
        sharedPropertyDbPath: doc.getPropertyDbPath()
    };

    var viewerDiv = document.getElementById('MyViewerDiv');
    viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv);
    viewer.start(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onLoadModelSuccess(model) {
    console.log('onLoadModelSuccess()!');
    console.log('Validate model loaded: ' + (viewer.model === model));
    console.log(model);
}

/**
 * viewer.loadModel() failure callback.
 * Invoked when there's an error fetching the SVF file.
 */
function onLoadModelError(viewerErrorCode) {
    console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
}

function queryprogress() {
    $.ajax({
        url: "https://developer.api.autodesk.com/modelderivative/v2/designdata/" + urn + "/manifest",
        type: "GET",
        contentType: "application/json;charset=utf-8",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + token)
        },
        success: function(data) {
            $("#current-progress").text(data.progress);
        },
        error: function(resp) {
            $("#current-progress").text("获取模型状态失败，请检查网络并刷新重试。");
        }
    })
}
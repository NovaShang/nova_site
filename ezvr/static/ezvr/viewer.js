        var viewerApp;
 
        var documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6MzRhZDBhN2EtMDEzMy1hMjUyLTExNTktNjNiYWNiNDFkNGM4L1Jldml0TmF0aXZlLnJ2dA';

$(Document).ready(
        $.ajax({
            url:"https://developer.api.autodesk.com/authentication/v1/authenticate",
            type:"POST",
            contentType:'application/x-www-form-urlencoded',
            data:"client_id=AEufTrqqxHwWoGK4tWsoWVsLGGbd8tvc&client_secret=qlZ2DWmmlKO1yw9u&grant_type=client_credentials&scope=bucket:create%20bucket:read%20data:read%20data:write",
            success:function(data){
                
       var options = {
            env: 'AutodeskProduction',
            getAccessToken: function(onGetAccessToken) {
                //
                // TODO: Replace static access token string below with call to fetch new token from your backend
                // Both values are provided by Forge's Authentication (OAuth) API.
                //
                // Example Forge's Authentication (OAuth) API return value:
                // {
                //    "access_token": "<YOUR_APPLICATION_TOKEN>",
                //    "token_type": "Bearer",
                //    "expires_in": 86400
                // }
                //
                var accessToken = data.access_token;
                var expireTimeSeconds = 60 * 30;
                onGetAccessToken(accessToken, expireTimeSeconds);
            }

        };
                        Autodesk.Viewing.Initializer(options, function onInitialized(){
            viewerApp = new Autodesk.Viewing.ViewingApplication('MyViewerDiv');
            viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
            viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
            }
        })


)        
        

        function onDocumentLoadSuccess(doc) {

            // We could still make use of Document.getSubItemsWithProperties()
            // However, when using a ViewingApplication, we have access to the **bubble** attribute,
            // which references the root node of a graph that wraps each object from the Manifest JSON.
            var viewables = viewerApp.bubble.search({'type':'geometry'});
            if (viewables.length === 0) {
                console.error('Document contains no viewables.');
                return;
            }

            // Choose any of the avialble viewables
            viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
        }

        function onDocumentLoadFailure(viewerErrorCode) {
            console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
        }

        function onItemLoadSuccess(viewer, item) {
            console.log('onItemLoadSuccess()!');
            console.log(viewer);
            console.log(item);

            // Congratulations! The viewer is now ready to be used.
            console.log('Viewers are equal: ' + (viewer === viewerApp.getCurrentViewer()));
        }

        function onItemLoadFail(errorCode) {
            console.error('onItemLoadFail() - errorCode:' + errorCode);
        }

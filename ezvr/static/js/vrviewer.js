var urn;
var token;
var vl, vr;
var _alpha = 0,
    _beta = 0,
    _gamma = 0;
var _deg2rad = Math.PI / 180;
var _wasFlipped;
var _baseDir = 0;
var _upVector;
var left_ready, right_ready;

$(document).ready(
    function() {
        urn = $("#urn").text();
        $("#urn").hide();
        getToken();
    })

function getToken() {
    $.ajax({
        url: "/ezvr/gettoken",
        type: "GET",
        success: function(data) {
            token = data.access_token;
            Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', accessToken: token }, function onInitialized() {
                Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
            });
        },
        error: function(resp) {
            alert("获取Token失败，请检查网络");
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

    var viewerDivLeft = document.getElementById('viewer-left');
    var viewerDivRight = document.getElementById('viewer-right');

    vl = new Autodesk.Viewing.Private.GuiViewer3D(viewerDivLeft);
    vr = new Autodesk.Viewing.Private.GuiViewer3D(viewerDivRight);
    $(".adsk-viewing-viewer").css("width", "50%");

    vl.start(svfUrl, modelOptions, onLoadModelSuccessL, onLoadModelError);
    vr.start(svfUrl, modelOptions, onLoadModelSuccessR, onLoadModelError);
}

function onLoadModelSuccessL(model) {
    if (right_ready) {
        onLoadModelSuccess(model)
    }
    left_ready = true;

}

function onLoadModelSuccessR(model) {
    if (left_ready) {
        onLoadModelSuccess(model)
    }
    right_ready = true;

}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}



function onLoadModelSuccess(model) {
    console.log('onLoadModelSuccess()!');
    vl.toolbar.setVisible(false);
    vr.toolbar.setVisible(false);


    var vec = vl.model.getUpVector();
    _upVector = new THREE.Vector3(vec[0], vec[1], vec[2]);

    var _InitialPosition = vl.navigation.getPosition();

    var _ObjectPosition = vl.navigation.getTarget();

    var new_position = new THREE.Vector3(_ObjectPosition.x, _ObjectPosition.y, _ObjectPosition.z + 2)

    var direction = new THREE.Vector3(1, 0, 0);

    var new_target = new_position.clone().add(direction)

    var zAxis = _upVector.clone();
    var axis = new_target.clone().sub(new_position).normalize();
    axis.cross(zAxis);

    var camUp = new_position.clone().sub(new_target).normalize();
    camUp.cross(axis).normalize();

    positioning(vl, new_position, new_target, camUp);

    var newposr = offsetCameraPos(vl, new_position, new_target, true)
    positioning(vr, newposr, new_target, camUp);

    vl.getCamera().isPerspective = true;
    vr.getCamera().isPerspective = true;
    vl.setActiveNavigationTool("firstperson");

    window.addEventListener("deviceorientation", getAngle, false);

    window.setInterval(setCam, 30)

}

function onLoadModelError(viewerErrorCode) {
    console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
}

function getAngle(e) {
    _alpha = e.alpha;
    _beta = e.beta;
    _gamma = e.gamma;

}

function setCam() {
    var ab = Math.abs(_beta);
    var flipped = (ab < 90 && _gamma < 0) || (ab > 90 && _gamma > 0);
    var vert = ((flipped ? _gamma : _gamma) + (ab < 90 ? 90 : -90)) * _deg2rad;


    // When the orientation changes, reset the base direction
    if (_wasFlipped != flipped) {
        // If the angle goes below/above the horizontal, we don't
        // flip direction (we let it go a bit further)
        if (Math.abs(_gamma) < 45) {
            flipped = _wasFlipped;
        } else {
            // Our base direction allows us to make relative horizontal
            // rotations when we rotate left & right
            _wasFlipped = flipped;
            _baseDir = _alpha;
        }
    }

    // alpha is the compass direction the device is
    // facing in degrees. This equates to the
    // left - right rotation in landscape
    // orientation (with 0-360 degrees)
    var horiz = (_alpha - _baseDir) * _deg2rad;

    // Save the latest horiz and vert values for use in zoom
    _lastHoriz = horiz;
    _lastVert = vert;
    orbitViews(vert, horiz);



}

function orbitViews(vert, horiz) {
    // We'll rotate our position based on the initial position
    // and the target will stay the same

    // if (vert < 0 && !Autodesk.Viewing.isIOSDevice()) {
    //     horiz = horiz + Math.PI;
    // }

    var pos = vl.navigation.getPosition();

    var x = Math.cos(horiz);
    var y = Math.sin(horiz);
    var z = Math.tan(vert);
    var dir = new THREE.Vector3(x, y, z);
    var trg = dir; //pos.clone().add(dir);

    var zAxis = _upVector.clone();
    var axis = trg.clone().sub(pos).normalize();
    axis.cross(zAxis);

    var camUp = pos.clone().sub(trg).normalize();
    camUp.cross(axis).normalize();
    positioning(vl, pos, trg, camUp)
    var rpos = offsetCameraPos(vl, pos, trg, true)
    positioning(vr, rpos, trg, camUp)
}


function offsetCameraPos(source, pos, trg, leftToRight) {
    // Use a small fraction of the distance for the camera offset
    //var disp = pos.distanceTo(trg) * 0.04;
    var disp = 0.1;

    // Clone the camera and return its X translated position
    var clone = source.autocamCamera.clone();
    clone.translateX(leftToRight ? disp : -disp);
    return clone.position;
}

function positioning(viewer, pos, trg, up) {
    // Make sure our up vector is correct for this model
    viewer.navigation.setWorldUpVector(_upVector, true);
    viewer.navigation.setView(pos, trg);
    viewer.navigation.setCameraUpVector(up);
}

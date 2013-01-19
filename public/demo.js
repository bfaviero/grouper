var socket;
var groupid, username;
var latitude = 0, longitude = 0;
$(function() {
    var updateGeo = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            });
            console.log(""+latitude+" "+longitude);
        }
        return navigator.geolocation;
    }
    updateGeo();
    $("#localgroups").on('click', function(e) {
        updateGeo();
        var request = $.ajax({url: "/search", type: "post", data: "lat="+latitude+"&lon="+longitude});
        request.done(function (response, textStatus, jqXHR){
            console.log(response);
            var obj = jQuery.parseJSON(response);
            $("#groups").empty();
            for(var i=0;i<obj.length;i++) {
                $("#groups").append("<option value="+obj[i]._id+">"+obj[i].name+"</option>");
            }
        });
        // callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            alert("Error!");
            // log the error to the console
            console.error(
                "The following error occured: "+
                textStatus, errorThrown
            );
        });
    });

    $("#gengroups").on('click', function(e) {
        var request = $.ajax({url: "/search", type: "post", data: "name="+$("#groupsearch").val()});
        request.done(function (response, textStatus, jqXHR){
            var obj = jQuery.parseJSON(response);
            $("#groups").empty();
            for(var i=0;i<obj.length;i++) {
                $("#groups").append("<option value="+obj[i]._id+">"+obj[i].name+"</option>");
            }
        });

        // callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            alert("Error!");
            // log the error to the console
            console.error(
                "The following error occured: "+
                textStatus, errorThrown
            );
        });
    });
    $("#create").on('click', function(e) {
        // Fake lat, lon now - add later
        var request = $.ajax({url: "/create", type: "post", data: "lat="+latitude+"&lon="+longitude+"&name="+$("#groupsearch").val()});
        request.done(function (response, textStatus, jqXHR){
            $("#groups").val($("#groups").append("<option value="+response._id+">"+response.name+"</option>").val());
            // set selected
        });

        // callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            alert("Error!");
            // log the error to the console
            console.error(
                "The following error occured: "+
                textStatus, errorThrown
            );
        });
        
    });
    $("#connect").on('click', function(e) {
        socket = io.connect("http://localhost");
        socket.on('connect', function() {
            groupid = $("#groups :selected").val();
            username = $("#username").val();
            socket.emit('connect', {group: groupid, name: username}); // auth later
        });
        socket.on('connectresponse', function(data) {
            if (data.id < 0) {
                $("#status").text("Status: Error Connecting").attr('class','error');
            }
            else {
                $("#connect").attr('disabled', 'disabled');
                $("#status").text("Username: "+username).attr('class','connected');
            }
        });
        socket.on('message', function(data) {
            console.log("message");
            $("#messages").append("<li>"+data.username+": "+data.body+"</li>");
        });
        socket.on('messageresponse', function(data) {
            if (!data.success) {
                alert("BAD BAD BAD");
            } else {
                console.log("yay");
            }
        });
    });
    $("#send").on('click', function(e) {
        console.log("sending");
        if (updateGeo()) {
            socket.emit('message', {group: groupid, name: username, body: $("#body").val(), type: 'text', lat: latitude, lon: longitude});
        }
        else {
            socket.emit('message', {group: groupid, name: username, body: $("#body").val(), type: 'text'});
        }
    });
});

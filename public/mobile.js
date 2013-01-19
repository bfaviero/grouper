var socket;
var groupid, username;
var latitude = 0, longitude = 0, havegeo;
$(function() {
    var updateGeo = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                console.log('geo success');
                havegeo = true;
            },
            function() {
                console.log('geo fail');
                havegeo = false;
            });
            return havegeo;
            console.log(""+latitude+" "+longitude);
        }
    }
    updateGeo();
    $("#usernameform").submit(function(e) {
        $("#joinbutton").click();
    });
    $("#joinbutton").on('click', function(e) {
        username = $("#username").val();
        if (!(username && username.length)) {
            alert("Enter a username to continue");
            return false;
        }
        console.log(username);
    });
    $("#localgroups").on('click', function(e) {
        e.preventDefault();
        if (updateGeo()) {
            var request = $.ajax({url: "/search", type: "post", data: "lat="+latitude+"&lon="+longitude});
            request.done(function (response, textStatus, jqXHR){
                console.log(response);
                var obj = jQuery.parseJSON(response);
                $("#localgrouplist").empty();
                for(var i=0;i<obj.length;i++) {
                    $("#localgrouplist").append("<li value="+obj[i]._id+">"+obj[i].name+"</li>");
                }
                $("#localgrouplist").listview("refresh");
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
        }
        else {
            alert("Error: Need Geolocation data to search for nearby");
        }
    });
    $("#searchform").submit(function() {
        var data = $("#groupsearch").val();
        if (data && data.length) {
            var request = $.ajax({url: "/search", type: "post", data: "name="+data});
            request.done(function (response, textStatus, jqXHR){
                console.log("logging");
                var obj = jQuery.parseJSON(response);
                $("#searchgrouplist").empty();
                for(var i=0;i<obj.length;i++) {
                    $("#searchgrouplist").append("<li value="+obj[i]._id+">"+obj[i].name+"</li>");
                }
                $("#searchgrouplist").listview("refresh");
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
        }
        else {
            $("#status").text("Error: No search term provided").attr('class', 'error');
        }
        return false;
    });
});

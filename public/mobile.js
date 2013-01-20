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
    console.log($.cookie("email"));
    console.log($.cookie("token"));
    if (document.URL.indexOf("#") > -1) {
        location.href = '/';
    }
    if ($.cookie("username")) {
        $("#username").attr('value',$.cookie("username"));
    }
    if ($.cookie("email") && $.cookie("token")) {
        console.log("hi there");
        $("<h3>Hello, "+$.cookie("email")+"</h3>"+
            "<p id='align'><a id='logout' data-role='button' data-inline='true' data-mini='true' data-icon='arrow-r' data-iconpos='right' href='/'>Logout</a>"+
            "<a id='updatelink' data-role='button' data-icon='arrow-r' data-iconpos='right' href='#update'>Update Info</a></p>").insertBefore("#usernamelabel");
    }
    $("#updatelink").click(function(e) {
        $("#updateemail").attr('value',($.cookie("email")));
    });
    $("#logout").click(function(e) {
        var request = $.ajax({url: "/logout", type: "post", data: "email="+$.cookie("email")+"&token="+$.cookie("token")});
        request.done(function (response, textStatus, jqXHR){
            console.log(response);
            $.removeCookie('email');
            $.removeCookie('token');
            location.reload();
        });
        // callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            alert("Logout Failed.");
            return false;
        });
    });
    updateGeo();
    $("#usernameform").submit(function(e) {
        $("#joinbutton").click();
    });
    $("#joinbutton").on('click', function(e) {
        username = $("#username").val();
        if (!(username && username.length)) {
            alert("Enter a username to continue");
            return false;
        } else {
            $.cookie("username", username);
            console.log(username);
            if (updateGeo()) {
                var request = $.ajax({url: "/search", type: "post", data: "lat="+latitude+"&lon="+longitude});
                request.done(function (response, textStatus, jqXHR){
                    console.log(response);
                    var obj = jQuery.parseJSON(response);
                    $("#localgrouplist").empty();
                    for(var i=0;i<obj.length;i++) {
                        $("#localgrouplist").append("<li><a value="+obj[i]._id+" href='#groupchat'>"+obj[i].name+"</a></li>");
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
                return false;
            }
        }
    });
    $("#loginbutton").click(function(e) {
        var request = $.ajax({url: "/login", type: "post", data: "email="+$("#loginemail").val()+"&password="+$("#loginpassword").val()});
        request.done(function (response, textStatus, jqXHR){
            console.log(response);
            var obj = jQuery.parseJSON(response);
            $.cookie("email", obj.email);
            $.cookie("token", obj.token);
            window.location="/";
            //location.reload();
        });
        // callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            alert("Login Failed.");
            return false;
        });
    });
    $("#registerbutton").click(function(e) {
        if ($("#registerpassword").val() === $("#registerpassword2").val()) {
            var request = $.ajax({url: "/register", type: "post", data: "email="+$("#registeremail").val()+"&password="+$("#registerpassword").val()});
            request.done(function (response, textStatus, jqXHR){
                console.log(response);
                var obj = jQuery.parseJSON(response);
                $.cookie("email", obj.email);
                $.cookie("token", obj.token);
            });
            // callback handler that will be called on failure
            request.fail(function (jqXHR, textStatus, errorThrown){
                alert("Registration Failed.");
                return false;
            });
        } else {
            alert("Passwords don't match up");
            return false;
        }
    });
    $("#localgroups").on('click', function(e) {
        e.preventDefault();
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

    $("#send").submit(function(e) {
        e.preventDefault();
        console.log("sending");
        if (updateGeo()) {
            socket.emit('message', {group: groupid, name: username, body: $("#body").val(), type: 'text', lat: latitude, lon: longitude});
        }
        else {
            socket.emit('message', {group: groupid, name: username, body: $("#body").val(), type: 'text'});
        }
        $("#body").val("");
        return false;
    });

    $("#chattitle").on('click', function(e) {$("#messages").empty();});

    $("#localgrouplist").on('click', 'li div div a', function(e) {
        e.preventDefault();
        console.log("zomg");
        groupid = $(this).attr('value');
        $("#chattitle").text($(this).text());
        socket = io.connect("http://localhost");
        socket.on('connect', function() {
            username = $("#username").val();
            socket.emit('connect', {group: groupid, name: username}); // auth later
        });
        socket.on('connectresponse', function(data) {
            // Do something?
        });
        socket.on('message', function(data) {
            console.log("message");
            var d = new Date(data.date);
            var ampm = d.getHours() >=12 ? "pm" : "am";
            var seconds=d.getSeconds()<10?"0"+d.getSeconds():d.getSeconds();
            $("#messages").append("<li>"+data.username+" ("+(d.getMonth()+1)+"/"+(d.getDate())+"/"+(d.getFullYear()%100)+" "+((d.getHours()+12)%12)+":"+d.getMinutes()+":"+seconds+" "+ampm+"): "+data.body+"</li>");
        });
        socket.on('messageresponse', function(data) {
            if (!data.success) {
                alert("Message failed to send");
            } else {
                console.log("yay");
            }
        });
    });
});

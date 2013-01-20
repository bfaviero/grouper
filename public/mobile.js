var socket;
var groupid, username;
var latitude = 42.3616447, longitude = -71.0899869, havegeo;
var groupmap, peermap, person, curPop;
var addMarkerIcon = function(icon, map, lat, lon, html, open) {
    console.log(html);
    var loc = new google.maps.LatLng(lat, lon);
    var marker = new google.maps.Marker({ position: loc, map: map});
    var popup;
    if (true) {
        popup = new google.maps.InfoWindow({
            content: html,
            maxwidth: $(window).width()*.2,
            optimised: false,
            zIndex: 1});
    }
    else {
        popup = new google.maps.InfoWindow({
            content: html,
            maxwidth: $(window).width()*.2,
            optimised: false,
            zIndex: 5});
    }
    google.maps.event.addListener(marker, 'click', function() {
        if (curPop) {
            curPop.close();
        }
        popup.open(map, marker);
        curPop = popup;
    });
    if (open) {
        new google.maps.event.trigger( marker, 'click' );
    }
    return marker;
}
var addMarker = function(map, lat, lon, html) {
    var icon = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/micons/red.png", new google.maps.Size(32, 32), new google.maps.Point(0, 0), new google.maps.Point(16, 32));
    addMarkerIcon(icon, map, lat, lon, html);
}
var rsz = function() {
    $("#peermapcanvas").width($(window).width()*.9+"px");
    $("#peermapcanvas").height($(window).height()*.4+"px");
    $("#groupmapcanvas").width($(window).width()*.9+"px");
    $("#groupmapcanvas").height($(window).height()*.4+"px");
    person = new google.maps.LatLng(latitude, longitude);
    if (groupmap) {
        google.maps.event.trigger(groupmap,"resize");
        google.maps.event.trigger(groupmap,"bounds_changed");
        groupmap.setCenter(person);
    }
    if (peermap) {
        google.maps.event.trigger(peermap,"resize");
        google.maps.event.trigger(peermap,"bounds_changed");
        peermap.setCenter(person);
    }
}
$(window).resize(rsz);
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
    if ($.cookie("email") === "null") {
        $.removeCookie("email");
    }
    if ($.cookie("token") === "null") {
        $.removeCookie("token");
    }
    updateGeo();
    console.log(latitude);
    console.log(longitude);
    person = new google.maps.LatLng(latitude, longitude);
    groupmap = new google.maps.Map($("#groupmapcanvas")[0], {zoom: 30, center: person, mapTypeControl: true, navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, mapTypeId: google.maps.MapTypeId.ROADMAP});
    peermap = new google.maps.Map($("#peermapcanvas")[0], {zoom: 30, center: person, mapTypeControl: true, navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, mapTypeId: google.maps.MapTypeId.ROADMAP});
    //alert(latitude);
    //alert(longitude);
    /*
    var opts = {
	center:person,
	radius:200,
	strokeColor:"",
	strokeOpacity:0.8,
	strokeWeight:2,
	fillColor:"#0000FF",
  	fillOpacity:0.1};
    var groupcircle= new google.maps.Circle(opts);
    var peercircle= new google.maps.Circle(opts);
    groupcircle.setMap(groupmap);
    peercircle.setMap(peermap);
    */
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
        setTimeout(rsz, 500);
        addMarkerIcon(icon, groupmap, latitude, longitude, "<div>My Location</div>", true);
        var icon = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/micons/purple.png", new google.maps.Size(64, 32), new google.maps.Point(0, 0), new google.maps.Point(16, 32));
        username = $("#username").val();
        if (!(username && username.length)) {
            alert("Enter a username to continue");
            return false;
        } else {
            $.cookie("username", username);
            console.log(username);
            updateGeo();
            //if (updateGeo()) {
            if (true) {
                var request = $.ajax({url: "/search", type: "post", data: "lat="+latitude+"&lon="+longitude});
                request.done(function (response, textStatus, jqXHR){
                    console.log(response);
                    var obj = jQuery.parseJSON(response);
                    $("#localgrouplist").empty();
                    for(var i=0;i<obj.length;i++) {
                        icon = "<img src='http://png-1.findicons.com/files/icons/1580/devine_icons_part_2/128/home.png' class='ui-li-icon ui-li-thumb'>"
                        if (obj[i].pinned) {
                        icon = "<img src='http://a.dryicons.com/images/icon_sets/stickers_icon_set/png/128x128/lock.png' class='ui-li-icon ui-li-thumb'>"
                        }
                        var str="<a id='groupchatconnect' pinned="+obj[i].pinned+" groupid='"+obj[i]._id+"' href='#groupchat'>"+icon+" "+obj[i].name+"</a>";
                        $("#localgrouplist").append("<li>"+str+"</li>");
                        var lonlat=obj[i].loc;
                        //addMarker(groupmap, lonlat[1], lonlat[0], "<div>Lat: "+lonlat[1]+"</div><div>Lon: "+lonlat[0]+"</div>"+"<a id='groupchatconnect' groupid='"+obj[i]._id+"' href='#groupchat'>"+obj[i].name+"</a>");
                        addMarker(groupmap, lonlat[1], lonlat[0], str);
                        console.log(lonlat);
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
                $("#localgrouplist").append("<li>Error: Need Geolocation data to search for nearby</li><li>Try refreshing or using the search tab</li>");
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

    //$("#chattitle").on('click', function(e) {$("#messages").empty();});
    $("#chattitle").on('click', function(e) {
        setTimeout(rsz, 500);
        var icon = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/micons/purple.png", new google.maps.Size(64, 32), new google.maps.Point(0, 0), new google.maps.Point(16, 32));
        addMarkerIcon(icon, peermap, latitude, longitude, "<div>My Location</div>", true);
    });
    $("#pagecreate").on('click', function(e) {
        if (!updateGeo()) {
            alert("Geo location info needed to create a group. Try reloading the page");
            return false;
        }
    });
    $("#creategroup").on('click', function(e) {
        if (!updateGeo()) {
            alert("Geo location info needed to create a group. Try reloading the page");
        }
        else {
            var name = $("#creategroupname").val();
            var pub = $("#radio2").is(":checked");
            var priv = $("#radio1").is(":checked");
            var pass = $("#creategrouppass").val();
            if (!(name && name.length)) {
                alert("Please enter the group name");
            }
            else {
                if (pub) {
                    if ($.cookie("email") && $.cookie("token")) {
                        var request = $.ajax({url: "/create", type: "post", data: "email="+$.cookie("email")+"&token="+$.cookie("token")+"&lat="+latitude+"&lon="+longitude+"&name="+name});
                        request.done(function (response, textStatus, jqXHR){
                            console.log(response);
                            alert("\""+name+"\" Created Successfully");
                            location.reload();
                        });
                        // callback handler that will be called on failure
                        request.fail(function (jqXHR, textStatus, errorThrown){
                            alert("Group Creation Failed");
                            return false;
                        });
                    }
                    else {
                        alert("Error: Must be logged in to create a public group");
                        location.href = '#login';
                    }
                }
                else if (priv) {
                    if (!(pass && pass.length)) {
                        alert("Please enter a password for the group");
                    }
                    else {
                        var request;
                        if ($.cookie("email") && $.cookie("token")) {
                            request = $.ajax({url: "/create", type: "post", data: "email="+$.cookie("email")+"&token="+$.cookie("token")+"&lat="+latitude+"&lon="+longitude+"&name="+name+"&pin="+pass});
                        }
                        else {
                            request = $.ajax({url: "/create", type: "post", data: "lat="+latitude+"&lon="+longitude+"&name="+name+"&pin="+pass});
                        }
                        request.done(function (response, textStatus, jqXHR){
                            console.log(response);
                            alert("\""+name+"\" Created Successfully");
                            location.reload();
                        });
                        // callback handler that will be called on failure
                        request.fail(function (jqXHR, textStatus, errorThrown){
                            alert("Group Creation Failed. Try another group name?");
                            return false;
                        });
                    }
                }
                else {
                    alert("uh oh something went wrong");
                }
            }
        }
        return false;
    });

    $(".gohome").on('click', function(e) {
        console.log('homing missile');
        location.href = '/';
        return false;
    });

    //$("#groupchatconnect").on('click', conn);
    var conn = function(e) {
        e.preventDefault();
        groupid = $(this).attr('groupid');
        var title = $(this).text();
        var pinned = $(this).attr('pinned');
        socket = io.connect("http://localhost");
        socket.on('connect', function() {
            username = $("#username").val();
            var obj={group: groupid, name: username};
            console.log("pinned?");
            if (pinned && pinned !== "false") {
                console.log($(this).attr('pinned'));
                var pinval = prompt("Enter the pin","");
                console.log(pinval);
                obj[pin]=pinval;
            }
            if ($.cookie("email") && $.cookie("token")) {
                obj[email] = $.cookie("email");
                obj[token] = $.cookie("token");
            }
            console.log(obj);
            socket.emit('connect',obj);
        });
        socket.on('connectresponse', function(data) {
            console.log(data);
            if (data.id < 0) {
                alert("Error connecting. Refresh and try again");
            } else {
                console.log("hi there");
                console.log("hi there");
                console.log(title);
                $(".chattitle").text("Connected: "+title);
            }
        });
        socket.on('message', function(data) {
            console.log("message");
            var d = new Date(data.date);
            var ampm = d.getHours() >=12 ? "pm" : "am";
            var seconds=d.getSeconds()<10?"0"+d.getSeconds():d.getSeconds();
            var minutes=d.getMinutes()<10?"0"+d.getMinutes():d.getMinutes();

            $("#messages").prepend(
                //"<li class='ui-li ui-li-static ui-btn-up-c ui-li-has-count ui-corner-top'>"+data.username+": "+data.body+" <span class='ui-li-count ui-btn-up-c ui-btn-corner-all'>"+((d.getHours()+12)%12)+":"+minutes+":"+seconds+" "+ampm+"</span></li>"
                //"<li class='ui-li ui-li-static ui-btn-up-c ui-li-has-count ui-corner-top'><div class='ui-grid-a'><div class='ui-block-a'>"+data.username+": "+data.body+"</div><div class='ui-block-b'></div>"+((d.getHours()+12)%12)+":"+minutes+":"+seconds+" "+ampm+"</div><span class='ui-li-count ui-btn-up-c ui-btn-corner-all'></span></li>" 
            //"<li class='ui-li ui-li-static ui-btn-up-c ui-li-has-count ui-corner-top'><table data-role='table' data-mode='reflow' class='ui-responsive table-stroke ui-table ui-table-reflow'><tbody><tr><td valign='top'><p style='margin: 0px; padding: 0px;'>name</p> <p style='font-weight: 200; font-size: 12px; margin: 0px; padding: 0px;'>"+((d.getHours()+12)%12)+":"+minutes+"</p></td><td style='font-weight: normal;'>content</td></tr></li>"
        "<li class='ui-li ui-li-static ui-btn-up-c ui-li-has-count ui-corner-top'><table data-role='table' data-mode='reflow' class='ui-responsive table-stroke ui-table ui-table-reflow'><thead style='visibility:hidden;'><tr style='visibility:hidden; padding:0px; margin:0px;'><th style='width:20%;'></th><th style='width:80%;'></th></tr></thead><tbody><tr><td valign='top'><p style='margin: 0px; font-size=10; padding: 0px;'><strong>"+data.username+"</strong></p> <p style='font-weight: 200; font-size: 12px; margin: 0px; padding: 0px; line-height: 1.5;'>"+((d.getHours()+12)%12)+":"+minutes+":"+seconds+"</p></td><td style='text-align:left; font-weight: normal;''>"+data.body+"</td></tr></tbody></table></li>"
        );
        });
        socket.on('messageresponse', function(data) {
            if (!data.success) {
                alert("Message failed to send");
            } else {
                console.log("yay");
            }
        });
    }
    $("#groupmapcanvas").on('click', 'div > a#groupchatconnect', conn);
    $("#localgrouplist").on('click', 'li div div a', conn);
});

var socket;
var groupid, username;
var latitude, longitude, havegeo;

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
                person = new google.maps.LatLng(latitude, longitude);
                groupmap = new google.maps.Map($("#groupmapcanvas")[0], {zoom: 19, center: person, mapTypeControl: true, navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, mapTypeId: google.maps.MapTypeId.SATELLITE});
                peermap = new google.maps.Map($("#peermapcanvas")[0], {zoom: 19, center: person, mapTypeControl: true, navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, mapTypeId: google.maps.MapTypeId.SATELLITE});
                plotmap();
            },
            function() {
                console.log('geo fail');
                havegeo = false;
                alert("This doesn't work with your phone.")
            }
            );
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

    if ($.cookie("email") && $.cookie("token")) {
        console.log("hi there");

        $('#emailholder').prepend("<div id='userinfo' class='sq'><h3>Hello, "+$.cookie("email")+"</h3>"+
            "<p id='align'><a id='logout' data-role='button' data-inline='true' data-mini='true' data-icon='arrow-r' data-iconpos='right' href='/'>Logout</a>"+
            "<a id='updatelink' data-role='button' data-icon='arrow-r' data-iconpos='right' href='#update'>Update Info</a></p></div>");
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


    $('.homebtn').on('click', function(event) {
        window.location = 'http://talkgrouper.com';
    });


    var plotmap = function() {
        var icon = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/micons/blue.png", new google.maps.Size(64, 32), new google.maps.Point(0, 0), new google.maps.Point(16, 32));
        
        var customMarker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: groupmap,
            title:"My Location",
            icon: icon
         });

        var request = $.ajax({url: "/search", type: "post", data: "lat="+latitude+"&lon="+longitude});
        request.done(function (response, textStatus, jqXHR){
            console.log(response);
            var obj = jQuery.parseJSON(response);
            $("#localgrouplist").empty();

            for(var i=0;i<obj.length;i++) {
                var icon = "<img src='http://png-1.findicons.com/files/icons/1743/ecqlipse/128/wifi.png' class='ui-li-icon ui-li-thumb'>"
                if (obj[i].pinned) {
                    icon = "<img src='http://a.dryicons.com/images/icon_sets/stickers_icon_set/png/128x128/lock.png' class='ui-li-icon ui-li-thumb'>"
                }
                var str="<a style='opacity:.9;' class='groupchatconnect' id='groupchatconnect' pinned="+obj[i].pinned+" groupid='"+obj[i]._id+"' href='#groupchat'>"+icon+" "+obj[i].name+"</a>";
                $("#localgrouplist").append("<li style='opacity:1;'>"+str+"</li>");
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




    $(document).on('ready', function(event) {
        if ($.cookie("username")) {
        $("#username").attr('value',$.cookie("username"));  
        
        }
        updateGeo();

        setTimeout(rsz, 500);
        
        
            
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
        console.log("sendinggg");
        var file = $('#picinput')[0].files[0];
        console.log($("#body").val());
        if (file)
        {
            var reader = new FileReader();
            reader.onloadend = function() {
                var result = this.result
                if (updateGeo()) {
                    socket.emit('message', {group: groupid, name: username, body: ($("#body").val()+"|"+result), type: 'image', lat: latitude, lon: longitude});
                }
                else {
                    socket.emit('message', {group: groupid, name: username, body: $("#body").val()+"|"+result, type: 'image'});
                }
                $("#body").val("");
                var file = $('#picinput').val("");
            }
            reader.readAsDataURL(file);
        }
        else {
            if (updateGeo()) {
                socket.emit('message', {group: groupid, name: username, body: $("#body").val(), type: 'text', lat: latitude, lon: longitude});
            }
            else {
                socket.emit('message', {group: groupid, name: username, body: $("#body").val(), type: 'text'});
            }
            $("#body").val("");
        }
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
        username = $("#username").val();

        if (!(username && username.length)) {
            alert("Enter a username to continue");
            return false;
        } else {
            $.cookie("username", username);
            console.log(username);
            console.log('set');
  
        

        e.preventDefault();
        groupid = $(this).attr('groupid');
        var title = $(this).text();
        var pinned = $(this).attr('pinned');
        socket = io.connect("http://talkgrouper.com");
        socket.on('connect', function() {
            username = $("#username").val();
            var obj={group: groupid, name: username};
            console.log("pinned?");
            if (pinned && pinned !== "false") {
                console.log($(this).attr('pinned'));
                var pinval = prompt("Enter the pin","");
                console.log(pinval);
                obj.pin=pinval;
                console.log(obj);
            }
            if ($.cookie("email") && $.cookie("token")) {
                obj.email = $.cookie("email");
                obj.token = $.cookie("token");
            }
            console.log(obj);
            socket.emit('connect',obj);
        });
        socket.on('connectresponse', function(data) {
            console.log(data);
            if (data.id < 0) {
                alert("Error connecting. Refresh and try again");
            } else {
                $(".chattitle").text("Connected: "+title);
            }
        });
        socket.on('message', function(data) {
            console.log("message");
            var d = new Date(data.date);
            var ampm = d.getHours() >=12 ? "pm" : "am";
            var seconds=d.getSeconds()<10?"0"+d.getSeconds():d.getSeconds();
            var minutes=d.getMinutes()<10?"0"+d.getMinutes():d.getMinutes();
            var body = "";
            if (data.type == 'text')
            {
                body = data.body;
            }
            else if (data.type == 'image')
            {
                console.log(data.body);
                var elems = data.body.split("|");
                console.log(elems);
                body = "<img class='messageimg' src='"+elems[1]+"' /><br />"+elems[0];
            }
            else
            {
                alert("Invalid data type " + data.type);
            }

            if (body.length)
            {
                $("#messages").prepend(
                    "<li class='ui-li ui-li-static ui-btn-up-c ui-li-has-count ui-corner-top'><p style='display:inline; margin:0px;' id='nameinchat' >"+data.username+":&nbsp;</p><span style='margin:0px; display:block; float:right; position:relative;' id='timeinchat' class='ui-li-count ui-btn-up-c ui-btn-corner-all'>"+((d.getHours()+12)%12)+":"+minutes+":"+seconds+" "+ampm+"</span><p style='font-weight:normal; margin:0px; ' id='chatinchat'> "+body+"</p> </div><div style='clear:both;'></div></li>"
                );
            }
        });
        socket.on('messageresponse', function(data) {
            if (!data.success) {
                alert("Message failed to send");
            } else {
                console.log("yay");
            }
        });
    }
    }
    $("#groupmapcanvas").on('click', 'div > a#groupchatconnect', conn);
    $("#localgrouplist").on('click', 'li div div a', conn);
});

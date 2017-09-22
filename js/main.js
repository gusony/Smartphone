        window.mac = Math.random().toString().slice(2);
        window.d_name = null;

        var interval = 250;
        var accur = 10;
        var eps = 0.001;

        var acc  = {};
        var gyro = {};
        var orient = {};
        var GEO ={latitude:0, longitude:0, altitude:0, accuracy:0, altitudeAccuracy:0, heading:0, speed:0};
        var offset = { ax: 0, ay: 0, az: 0 };
        var output = {};

        var AxDom = $('#Ax > span');
        var AyDom = $('#Ay > span');
        var AzDom = $('#Az > span');
        var RxDom = $('#Rx > span');
        var RyDom = $('#Ry > span');
        var RzDom = $('#Rz > span');
        var OxDom = $('#Ox > span');
        var OyDom = $('#Oy > span');
        var OzDom = $('#Oz > span');
        var mag_Dom =    $('#Magdec > span');
        var lat_Dom =    $('#G_lat > span');
        var lon_Dom =    $('#G_lon > span');
        var alt_Dom =    $('#G_alt > span');
        var acc_Dom =    $('#G_acc > span');
        var altacc_Dom = $('#G_altacc > span');
        var hea_Dom =    $('#G_hea > span');
        var spe_Dom =    $('#G_spe > span');
        
        window.ondevicemotion = function(event) {
            var ax = event.accelerationIncludingGravity.x || 0;
            var ay = event.accelerationIncludingGravity.y || 0;
            var az = event.accelerationIncludingGravity.z || 0;
            acc.x = Math.round(ax*accur) / accur;
            acc.y = Math.round(ay*accur) / accur;
            acc.z = Math.round(az*accur) / accur;

            var ra = event.rotationRate.alpha;  
            var rb = event.rotationRate.beta;
            var rg = event.rotationRate.gamma;
            gyro.x = Math.round(rg*accur) / accur;
            gyro.y = Math.round(ra*accur) / accur;
            gyro.z = Math.round(rb*accur) / accur;
        }

        function handleOrientation(event) {
            var oa = event.alpha;
            var ob = event.beta;
            var og = event.gamma;
	        if(event.webkitCompassHeading)
	            orient.oc = Math.ceil(event.webkitCompassHeading) || "No support";  // oc: orientation compass
	        else
                orient.oc = event.alpha || "No support";
			
            orient.x = Math.round(oa*accur) / accur;
            orient.y = Math.round(ob*accur) / accur;
            orient.z = Math.round(og*accur) / accur;
            
			var compassdisc = document.getElementById("compassDiscImg");
            compassdisc.style.webkittransform = "rotate("+ (360-orient.oc) +"deg)";
            compassdisc.style.moztransform = "rotate("+ (360-orient.oc ) +"deg)";
            compassdisc.style.transform = "rotate("+ (360- orient.oc) +"deg)";
        }
        window.addEventListener('deviceorientation', handleOrientation);
		
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                GEO.latitude         = position.coords.latitude         || "No support";
                GEO.longitude        = position.coords.longitude        || "No support";
                GEO.altitude         = position.coords.altitude         || "No support";
                GEO.accuracy         = position.coords.accuracy         || "No support";
                GEO.altitudeAccuracy = position.coords.altitudeAccuracy || "No support";
                GEO.heading          = position.coords.heading          || "No support";
                GEO.speed            = position.coords.speed            || "No support";
             });
        } 
        else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
			
        // Dom updater
        function domUpdater() {
            AxDom.text(acc.x);
            AyDom.text(acc.y);
            AzDom.text(acc.z);

            RxDom.text(gyro.x);
            RyDom.text(gyro.y);
            RzDom.text(gyro.z);

            OxDom.text(orient.x);
            OyDom.text(orient.y);
            OzDom.text(orient.z);

            lat_Dom.text(GEO.latitude);
            lon_Dom.text(GEO.longitude);
            alt_Dom.text(GEO.altitude);
            acc_Dom.text(GEO.accuracy);
            altacc_Dom.text(GEO.altitudeAccuracy);
            hea_Dom.text(GEO.heading);
            spe_Dom.text(GEO.speed);

            mag_Dom.text(orient.oc);

            requestAnimationFrame(domUpdater);
        }
        requestAnimationFrame(domUpdater);
/*        
        $('#adjust').click(function() {
            offset.ax = -gsensor.ax;
            offset.ay = -gsensor.ay;
            offset.az = -gsensor.az;
        });

        $('#reset').click(function() {
            offset.ax = 0;
            offset.ay = 0;
            offset.az = 0;
        });
*/
        // IoTtalk updater
        function iotUpdater() {
            if( window.d_name ){
                csmPush('Acceleration', [acc.x, acc.y, acc.z]);
                csmPush('Gyroscope', [gyro.x, gyro.y, gyro.z]);
                csmPush('Orientation', [orient.x, orient.y, orient.z, orient.oc]);
            }    
            setTimeout(iotUpdater, interval);
        }
        setTimeout(iotUpdater, interval);

        // Register
        var profile = {
            'dm_name': 'Smartphone',
            'df_list': ['Acceleration','Gyroscope','Orientation', 'Vibration'],
	    };
	    csmRegister(profile, iotUpdater);
        
		function vibrationhandler(value){
     console.log(value);
            if(value >0)
                navigator.vibrate(1000);
            setTimeout(csmPull("Vibration",vibrationhandler) , interval);
        }

        // Detach when browser close
        function detach() {
            window.d_name = null;
	        csmDelete();
        }
        window.onunload = detach;
        window.onbeforeunload = detach;
        window.onclose = detach;
        window.onpagehide = detach;

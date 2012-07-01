var canvas;

var framePeriod = 30; // Number of ms to display each frame

var canvasWidth = 640;
var canvasHeight = 480;

var width = 0; // m
var height = 0; // m

var widthMToPixels = 0;
var heightMToPixels = 0;

var gravitationalAcceleration = -9.81; // m/s^2
var initSpeed = 0; // m/s
var initAngle = 0; // Radians

// Position and velocity functions of time
var position_x;
var position_y;
var velocity_x;
var velocity_y;

var displayVelocity = false;

var hasInfo = false;

$(document).ready(function() {
    
    canvas = document.getElementById('graph');
    
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        
        /*
        ctx.beginPath();
        ctx.moveTo(200, 100);
        ctx.quadraticCurveTo(300, 400, 400, 100);
        ctx.stroke();
        */
        
        var arrow = [
            [ 2, 0 ],
            [ -10, -4 ],
            [ -10, 4]
        ];
        
        function drawFilledPolygon(shape) {
            ctx.beginPath();
            ctx.moveTo(shape[0][0],shape[0][1]);
        
            for(p in shape)
                if (p > 0) ctx.lineTo(shape[p][0],shape[p][1]);
        
            ctx.lineTo(shape[0][0],shape[0][1]);
            ctx.fill();
        };
    
        
        function translateShape(shape,x,y) {
            var rv = [];
            for(p in shape)
                rv.push([ shape[p][0] + x, shape[p][1] + y ]);
            return rv;
        };
        function rotateShape(shape,ang) {
            var rv = [];
            for(p in shape)
                rv.push(rotatePoint(ang,shape[p][0],shape[p][1]));
            return rv;
        };
        function rotatePoint(ang,x,y) {
            return [
                (x * Math.cos(ang)) - (y * Math.sin(ang)),
                (x * Math.sin(ang)) + (y * Math.cos(ang))
            ];
        };
        
        function drawLineArrow(x1,y1,x2,y2) {
            ctx.beginPath();
            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);
            ctx.stroke();
            var ang = Math.atan2(y2-y1,x2-x1);
            drawFilledPolygon(translateShape(rotateShape(arrow,ang),x2,y2));
        };
        
        
        // Animate button click handler
        $('#animate').click(function() {
            //drawLineArrow(10, 10, 300, 300);
            // Clear the canvas
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            // Get the data from the form
            width = $('#width').val();
            height = $('#height').val();
            gravitationalAcceleration = $('#gravity').val();
            initSpeed = $('#initspeed').val();
            initAngle = $('#angle').val() * Math.PI / 180; // Convert argument from degrees to radians
            displayVelocity = $('#display-velocity').is(':checked');
            
            hasInfo = true;
            
            // Calculate conversion factors (meters to pixels)
            widthMToPixels = canvasWidth / width;
            heightMToPixels = canvasHeight / height;
            
            // Define functions for position and velocity
            position_x = function(time) { return initSpeed * Math.cos(initAngle) * time; }
            position_y = function(time) { return (0.5 * gravitationalAcceleration * time * time) + (initSpeed * Math.sin(initAngle) * time); }
            velocity_x = initSpeed * Math.cos(initAngle); // Does not depend on time
            velocity_y = function(time) { return (gravitationalAcceleration * time) + (initSpeed * Math.sin(initAngle)); }
            
            // Calculate maximum height
            timeAtMaxHeight = -1 * initSpeed * Math.sin(initAngle) / gravitationalAcceleration;
            max_x = position_x(timeAtMaxHeight);
            max_y = position_y(timeAtMaxHeight);
            
            // Calculate range
            range = -1 * initSpeed * initSpeed * Math.sin(2 * initAngle) / gravitationalAcceleration;
            
            // Total time projectile is in the air (in ms)
            totalTime = -2 * initSpeed * Math.sin(initAngle) / gravitationalAcceleration;
            
            // Display unchanging info
            $('#peak_x').text(max_x);
            $('#peak_y').text(max_y);
            $('#peak_t').text(timeAtMaxHeight);
            $('#range').text(range);
            $('#total-time').text(totalTime);
            
            function draw(time, animate) {
                $('#time').val(time);
                $('#xpos').text(position_x(time));
                $('#ypos').text(position_y(time));
                
                var v_x = velocity_x;
                var v_y = velocity_y(time);
                var speed = Math.sqrt(v_x*v_x + v_y*v_y);
                var angle = Math.atan(v_y / v_x) * 180 / Math.PI;
                
                $('#speed').text(speed);
                $('#instantangle').text(angle);
                $('#v_x').text(v_x);
                $('#v_y').text(v_y);
                
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                
                // Set drawing colours
                ctx.fillStyle = "rgb(0,0,200)";
                ctx.strokeStyle = "rgb(200,0,0)";
                
                // Draw the trajectory of the projectile
                ctx.beginPath();
                ctx.moveTo(0, canvasHeight);
                ctx.quadraticCurveTo(max_x * widthMToPixels,
                                     canvasHeight - 2 * max_y * heightMToPixels,
                                     range * widthMToPixels,
                                     canvasHeight);
                ctx.stroke();
                
                // Draw the current position
                x = position_x(time) * widthMToPixels;
                y = canvasHeight - (position_y(time) * heightMToPixels);
                xv = velocity_x * widthMToPixels;
                yv = velocity_y(time) * heightMToPixels;
                
                ctx.beginPath();
                ctx.moveTo(x * widthMToPixels, canvasHeight - (y * heightMToPixels));
                ctx.arc(x, y, 5, 0, Math.PI * 2, true);
                ctx.closePath;
                ctx.fill();
                
                // Draw the velocity vector
                if (displayVelocity) {
                    // Set drawing colours
                    ctx.fillStyle = "#000000";
                    ctx.strokeStyle = "#000000";
                    drawLineArrow(x, y, x + xv, y - yv);
                }
                
                time += framePeriod / 1000;
                
                if ((time <= totalTime + framePeriod*0.001) && animate)
                    setTimeout(function() { draw(time, true); }, framePeriod);
            }
            draw(0, true);
            
            $('#go').click(function() {
                displayVelocity = $('#display-velocity').is(':checked');
                draw($('#time').val(), false);
            });
        });
    
    }
});
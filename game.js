




// TODO: wrgerwg
// dodac radar
// dodac centrowanie kamery na klawisz
// dodac wiecej broni
//// zmienic energie tak, aby im mniej jej bylo, tym wolniej sie regenerowala (kiedy masz 0 musisz odczekacaz zacznie sie regenerowac)
// dodac klawisz togglowania hp przeciwnikow
// dodac gadzety: np. ucieczka, teleport, naprawa, tarcza
// dodac regenerujaca sie tarcze (moglaby czerpac zapasy energii z energii statku, lub miec wlasne)
// dodac opcje grafiki (na mniejszych wolniej przesuwaloby background, albo wogle bez backgroundu)
// dodac menu ulepszenia statku
// dodac menu kupowania statku
// dodac ekran wczytywania
// dodac opcje pojawiania sie na statkach wizualnych indykacjii obrazen
// dodac wizualne obrazenia sttaku w postaci peknietego ekranu gry
// dodac maksymalizacje ekranu
// dodac wybor misji
// dodac kreator misji
// dodac AI
// dodac opcje togglowania FPS countera
// dodac zapisywanie stanu gry
// dodac mozliwosc gry przez siec
// dodac nowy celownik
// dodac nowe modele statkow
// dodac zmiane kolorystyki statkow w trakcie gry
// dodac CHEATY


// SIMPLETON WITH ALL THE GLOBAL VARIABLES
function Simpleton() {}
Simpleton.prototype.init = function() {
    // game variables
    this.then = Date.now();

    // toggle between 60 and unlimited fps
    this.scFPS = false;
    // holds timed function
    this.interMain = null;

    this.oneCanvas = true;


    // debug commands
    this.debug = false;
    this.showKeyPress = false;
    this.renderS = true;

    // should play
    this.focused = true;
    this.paused = false;

    // helper in deceleration
    this.decelerate = 5000;


    // Box2dweb definitions
    this.b2Vec2 = Box2D.Common.Math.b2Vec2;
    this.b2BodyDef = Box2D.Dynamics.b2BodyDef;
    this.b2Body = Box2D.Dynamics.b2Body;
    this.b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    this.b2Fixture = Box2D.Dynamics.b2Fixture;
    this.b2World = Box2D.Dynamics.b2World;
    this.b2MassData = Box2D.Collision.Shapes.b2MassData;
    this.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    this.b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    this.b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    this.b2ContactListener = Box2D.Dynamics.b2ContactListener;






    // helpers for drawing
    this.TO_RADIANS = Math.PI/180;
    this.TO_DEGREES = 180/Math.PI;
    this.PI = Math.PI;
    this.PI_2 = Math.PI/2;
    this.PI2 = Math.PI * 2;
    this.PI3_2 = Math.PI * 3 / 2;
    this.MAX_DELTA = 1/30;


    this.call = new Callback();

    this.useSkew = false;
    this.skew = 0;
    this.server = false;
    this.receiving = false;
    this.singleplayer = true;
};
Simpleton.prototype.initClient = function() {
    // MAIN LOOP
    this.main = function() {
        stats.begin();
        var now = Date.now();
        var delta = now - sim.then;

        if (sim.useSkew) {
            delta += sim.skew;
            sim.then = now + sim.skew;
        } else {
            sim.then = now;
        }

        delta = delta / 1000;

        if (19 in inpLibrary.keysDown) {
            sim.paused = !sim.paused;
            delete inpLibrary.keysDown[19];
        }

        //if (delta <= sim.MAX_DELTA && delta > 0) {
            if (sim.focused && !sim.paused) {
                //if (true) {
                game.update(delta);
                game.render();
            }
        //}
        stats.end();
    };

    // cheats
    this.kaboom = function() {
        this.call.callback_("cdestruct", {});
        return "Kaboom cheat!";
    }
    this.debris = function() {
        this.call.callback_("cdebris", {});
        return "Debris cheat!";
    }

    this.server = false;
};
Simpleton.prototype.initServer = function() {
    // MAIN LOOP
    this.singleplayer = false;

    this.main = function(g) {
        var now = Date.now();
        var delta = now - sim.then;
        delta = delta / 1000;
        sim.then = now;

        g.update(delta);
    };

    this.server = true;
};


sim = new Simpleton();
sim.init();


// DRAW SOMETHING WHILE WAITING
function LoadingScreen() {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    //canvas.id = "gameCanvas";
    //this.scale = 2;
    canvas.width = window.innerWidth; //1280; 480; 1920;
    canvas.height = window.innerHeight; //720; 270; 1080;
    document.body.appendChild(canvas);

    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fill();



    context.fillStyle = "white";
    context.font = "20px Console";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText("Loading...", 10, canvas.height - 30);


    this.canvas = canvas;

}
LoadingScreen.prototype.show = function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.visibility = 'visible';
};
LoadingScreen.prototype.hide = function() {
    this.canvas.style.visibility = 'hidden';
};
LoadingScreen.prototype.destroy = function() {
    this.canvas.parentNode.removeChild(this.canvas);
    delete loadingScreen;
};

function LoadingScreenDummy() {}
LoadingScreenDummy.prototype.show = function() {};
LoadingScreenDummy.prototype.hide = function() {};
LoadingScreenDummy.prototype.destroy = function() {};



// LOAD ASSETS
// LOADS ALL IMAGES
// ALWAYS 1 INSTANCE, NAMED imgLibrary
function SpriteLibrary(){
    // all images loaded
    this.done = false;
    this.blank = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

    this.loading = 0;
    this.waiting = true;

    // HOW MANY SHIPS WE HAVE?
    var howManyShips = 1;
    this.ships = [];
    for (var i=0, j=howManyShips; i < j; ++i) {
        this.ships[i] = this.initStandardShip(i);
    }
    this.star = this.initImage('star');
    this.fireball = this.initImage('fireball');
    this.oldengine = this.initImage('oldengine');
    this.oldengineon = this.initImage('oldengineon');
    this.spacerock = this.initImage('spacerock');
    this.cannonball = this.initImage('cannonball');
    //this.explosion = this.initImage('explosion');
    this.explosion = this.initExplosion();

    this.waiting = false;
}
SpriteLibrary.prototype.finishedLoading = function() {
    this.loading--;
    if (this.loading == 0 && !this.waiting) {
        this.done = true;
    }
};
SpriteLibrary.prototype.failedLoading = function(image) {
    image.src = this.blank;
    image.onerror = null;
    this.finishedLoading();
};
SpriteLibrary.prototype.initImage = function(path) {
    this.loading += 1;
    var image = new Image();
    image.src = 'img/' + path + '.png';
    image.onload = function() { imgLibrary.finishedLoading() };
    image.onerror = function() { imgLibrary.failedLoading(this) };
    return image;
};
SpriteLibrary.prototype.initStandardShip = function(i) {
    this.loading += 5;
    var ship = [];
    ship.image = new Image();
    ship.image.src = "img/ships/" + i + ".png";
    ship.image.onload = function() { imgLibrary.finishedLoading() };
    ship.image.onerror = function() { imgLibrary.failedLoading(this) };

    ship.up = new Image();
    ship.up.src = "img/ships/" + i + "_up.png";
    ship.up.onload = function() { imgLibrary.finishedLoading() };
    ship.up.onerror = function() { imgLibrary.failedLoading(this) };

    ship.down = new Image();
    ship.down.src = "img/ships/" + i + "_down.png";
    ship.down.onload = function() { imgLibrary.finishedLoading() };
    ship.down.onerror = function() { imgLibrary.failedLoading(this) };

    ship.left = new Image();
    ship.left.src = "img/ships/" + i + "_left.png";
    ship.left.onload = function() { imgLibrary.finishedLoading() };
    ship.left.onerror = function() { imgLibrary.failedLoading(this) };

    ship.right = new Image();
    ship.right.src = "img/ships/" + i + "_right.png";
    ship.right.onload = function() { imgLibrary.finishedLoading() };
    ship.right.onerror = function() { imgLibrary.failedLoading(this) };

    return ship;
};
SpriteLibrary.prototype.initExplosion = function() {
    var e = [];
    for (var i = 1, j = 16; i < j; i++) {
        var r = new Image();
        r.src = "img/explosion/explosion" + i + ".png";
        r.onload = function() { imgLibrary.finishedLoading() };
        r.onerror = function() { imgLibrary.failedLoading(this) };
        e.push(r);
    }
    return e;
};


function SpriteLibraryDummy() { this.done = true; }
SpriteLibraryDummy.prototype.finishedLoading = function() {};
SpriteLibraryDummy.prototype.failedLoading = function(e) {};
SpriteLibraryDummy.prototype.initImage = function(e) {};
SpriteLibraryDummy.prototype.initStandardShip = function(e) {};
SpriteLibraryDummy.prototype.initExplosion = function() {};


// GREAT WITH DEALING WITH SOUND
// ALWAYS 1 INSTANCE, NAMED sndLibrary
function SoundLibrary() {
    this.done = true;

    this.masterVolume = 1;
    this.muted = false;
    this.fadeDuration = 250;
    this.explosions = [];
    this.explosionsLast = -1;
    for (var i = 0, j = 10; i < j; i++) {
        var e = this.prepareSound('explosion');
        this.explosions.push(e);
    }
}
SoundLibrary.prototype.explosion = function() {
    this.explosionsLast++;
    if (this.explosionsLast >= this.explosions.length) {
        this.explosionsLast = 0;
    }
    var e = this.explosions[this.explosionsLast];
    this.stop(e);
    this.pos(e, Math.random() * 1.4);
    e._loop = false;
    this.play(e);
    //return this.prepareSound('explosion');
};
SoundLibrary.prototype.thrusters = function() {
    return this.prepareSound(0);
};
SoundLibrary.prototype.thrustersold = function() {
    return this.prepareSound(1).volume(0.5);
};
SoundLibrary.prototype.prepareSound = function(i) {
    var arr = [];
    arr.push('sounds/' + i + '.wav');
    arr.push('sounds/' + i + '.ogg');
    arr.push('sounds/' + i + '.aac');
    arr.push('sounds/' + i + '.wma');
    arr.push('sounds/' + i + '.mp3');
    return new Howl({
        urls: arr,
        autoplay: false,
        loop: true,
        buffer: false,
        locked: false
    });
};
SoundLibrary.prototype.unload = function(h) {
    if (h)
        h.unload();
    h = null;
};
SoundLibrary.prototype.pos = function(h, e) {
    if (!h) return;
    h.pos(e);
    h.volume(0.25);
    h.loop = false;
};
SoundLibrary.prototype.play = function(h) {
    if (h)
        h.play();
};
SoundLibrary.prototype.pause = function(h) {
    if (h)
        h.pause();
};
SoundLibrary.prototype.stop = function(h) {
    if (h)
        h.stop();
};
SoundLibrary.prototype.fadeIn = function(h, v) {
    v = typeof v !== 'undefined' ? v : 1;
    if (!h.playing && !h.locked) {
        h.locked = true;
        h.playing = true;
        h.play();
        h.fade(0, v, this.fadeDuration, function() {
            h.locked = false;
        });
    }
};
SoundLibrary.prototype.fadeOut = function(h) {
    if (h.playing && !h.locked) {
        h.locked = true;
        h.fade(h._volume, 0, this.fadeDuration, function() {
            h.stop();
            h.playing = false;
            h.locked = false;
        });
    }
};
SoundLibrary.prototype.mute = function() {
    Howler.mute();
};
SoundLibrary.prototype.unmute = function() {
    Howler.unmute();
};
SoundLibrary.prototype.volume = function(v) {
    this.masterVolume = v;
    Howler.volume(v);
};

function SoundLibraryDummy() { this.done = true; }
SoundLibraryDummy.prototype.explosion = function() {};
SoundLibraryDummy.prototype.thrusters = function() {};
SoundLibraryDummy.prototype.thrustersold = function() {};
SoundLibraryDummy.prototype.prepareSound = function(e) {};
SoundLibraryDummy.prototype.unload = function(h) {};
SoundLibraryDummy.prototype.pos = function(h, e) {};
SoundLibraryDummy.prototype.play = function(e) {};
SoundLibraryDummy.prototype.pause = function(e) {};
SoundLibraryDummy.prototype.stop = function(e) {};
SoundLibraryDummy.prototype.fadeIn = function(e, r) {};
SoundLibraryDummy.prototype.fadeOut = function(e) {};
SoundLibraryDummy.prototype.mute = function() {};
SoundLibraryDummy.prototype.unmute = function() {};
SoundLibraryDummy.prototype.volume = function(e) {};



// INPUT
// Handle keyboard/mouse/client controls
// ALWAYS 1 INSTANCE, NAMED inpLibrary
function Input() {
    this.keysDown = {};
    this.mouseDown = {};
    this.mouseX = 0;
    this.mouseY = 0;
}
Input.prototype.initServer = function() {
    // nada?
}
Input.prototype.initClient = function() {

    window.addEventListener("keydown", function (e) {
        e.preventDefault();
        if (e.keyCode == 122) {
            if (game.screen)
                game.screen.fullScreen();
        } else
            inpLibrary.keysDown[e.keyCode] = true;
    }, false);

    window.addEventListener("keyup", function(e) {
        if (sim.showKeyPress) console.log(e.keyCode);
        e.preventDefault();
        delete inpLibrary.keysDown[e.keyCode];
    }, false);



    window.addEventListener("mousedown", function(e) {
        e.preventDefault();
        inpLibrary.mouseDown[e.button] = true;
    }, false);

    window.addEventListener("mouseup", function(e) {
        e.preventDefault();
        delete inpLibrary.mouseDown[e.button];
    }, false);

    window.addEventListener("mousemove", function(e) {
        inpLibrary.mouseX = e.clientX;
        inpLibrary.mouseY = e.clientY;
    },false);

    window.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);


};


// give unique ID (not on the list)
function getID(list) {
    var l = list, d = true, r = null;
    while (d) {
        r = Math.floor(Math.random() * 9000);
        for (i = -1, len = l.length; ++i < len;) {
            if (l[i].id == r) {
                break;
            }
        }
        d = false;
    }
    return r;
}


function getAllProperties(obj) {
    var o = obj, r = {};
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            r[k] = o[k];
        }
    }
    return r;
}

function setAllProperties(from, to) {
    var f = from, t = to;
    for (var k in f) {
        if (t.hasOwnProperty(k)) {
            t[k] = f[k];
        }
    }
    to = t;
    return t;
}


// CIRCULAR STRINGIFY
function stringifyOnce(obj, replacer, indent){
    var printedObjects = [];
    var printedObjectKeys = [];

    function printOnceReplacer(key, value){
        var printedObjIndex = false;
        printedObjects.forEach(function(obj, index){
            if(obj===value){
                printedObjIndex = index;
            }
        });

        if((printedObjIndex == false) && typeof(value)=="object"){
            return "(see " + value.constructor.name.toLowerCase() + " with key " + printedObjectKeys[printedObjIndex] + ")";
        }else{
            var qualifiedKey = key || "(empty key)";
            printedObjects.push(value);
            printedObjectKeys.push(qualifiedKey);
            if(replacer){
                return replacer(key, value);
            }else{
                return value;
            }
        }
    }
    return JSON.stringify(obj, printOnceReplacer, indent);
}


// ACCOUNT DIFFERENT VENDORS PREFIXES
function RunPrefixMethod(obj, method) {
    var pfx = ["webkit", "moz", "ms", "o", ""];
    var p = 0, m, t;
    while (p < pfx.length && !obj[m]) {
        m = method;
        if (pfx[p] == "") {
            m = m.substr(0, 1).toLowerCase() + m.substr(1);
        }
        m = pfx[p] + m;
        t = typeof obj[m];
        if (t != "undefined") {
            pfx = [pfx[p]];
            return (t == "function" ? obj[m]() : obj[m]);
        }
        p++;
    }
}



// with antialiasing
function drawMyImageA(context, image, x, y, angle, scale) {
    if (angle != 0) {
        context.save();
        context.translate(x, y);
        context.rotate(angle);
        var width = image.width * scale;
        var height = image.height * scale;
        context.drawImage(image, -(width / 2), -(height / 2), width, height);
        context.restore();
    } else {
        var width = image.width * scale;
        var height = image.height * scale;
        context.drawImage(image, x-(width / 2), y-(height / 2), width, height);
    }
}
// simple
function drawMyImageS(context, image, x, y, angle, scale) {
    if (angle != 0) {
        context.save();
        context.translate(x, y);
        context.rotate(angle);
        var width = image.width * scale;
        var height = image.height * scale;
        context.drawImage(image, (-(width / 2)) << 0, (-(height / 2)) << 0, (width) << 0, (height) << 0);
        context.restore();
    } else {
        var width = image.width * scale;
        var height = image.height * scale;
        context.drawImage(image, (x-(width / 2)) << 0, (y-(height / 2)) << 0, (width) << 0, (height) << 0);
    }
}



// TURRET (can shoot from weapons; can be stationary or dynamic)
function Turret(a, r) {
    this.angle = a;
    this.radius = r;
    this.x = 0;
    this.y = 0;
};
// calculate x and y coordinates that bullet should appear from
Turret.prototype.calculateOrigin = function(x, y, a) {
    if (sim.debug) console.log("calculating angle for turret");
    var angleX = Math.cos(this.angle + a);
    var angleY = Math.sin(this.angle + a);
    this.x = x + angleX * this.radius;
    this.y = y + angleY * this.radius;
    if (sim.debug) console.log("x: " + this.x + " y: " + this.y);
};
Turret.prototype.getX = function() {
    return this.x;
};
Turret.prototype.getY = function() {
    return this.y;
};



// SHIP
function Ship(id) {
    // ID
    this.id = id;
    this.playerId = 0;
}
// DEPRECATED, USE initShipName INSTEAD
Ship.prototype.init = function () {
    // TODO: ADD DEFAULT SHIP LIKE CATER
    this.initCater();
};
Ship.prototype.initCater = function () {



    // assets
    if (!sim.server) {
        this.graphics = imgLibrary.ships[0];
        this.graphics.old = imgLibrary.oldengine;
        this.graphics.oldon = imgLibrary.oldengineon;
        this.sounds = [];
        this.sounds.thrusters = sndLibrary.thrusters();
        this.sounds.thrusters.playing = false;
        this.sounds.thrustersold = sndLibrary.thrustersold();
        this.sounds.thrustersold.playing = false;
    }


    // essentials
    this.X = 0;
    this.Y = 0;
    this.angle = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityR = 0;
    this.radius = 50;
    this.lifeMax = 100;
    this.life = this.lifeMax;
    this.type = 0;
    this.mass = 100;
    this.armor = 10;


    // engines
    this.speed = 300;
    this.speedBack = 0.5;
    this.speedWarp = 100;
    this.speedMax = 600;
    this.speedTurn = 20;
    this.bcThrust = 20;
    this.bcTurn = 20;

    this.turnAssist = true;
    this.turnAssistSpeed = this.speedTurn;
    this.bcTurnAssist = this.bcTurn;

    this.accelerationX = 0;
    this.accelerationY = 0;
    this.accelerationAngle = 0;

    // old engine
    this.oldEngine = true;
    this.oldEngineSpeed = this.speed / 2;
    this.bcoThrust = this.bcThrust / 2;
    this.oldTorque = true;


    // battery
    this.batteryMax = 100;
    this.battery = this.batteryMax;
    this.batteryRegen = 120;
    //this.batteryUsed = 0;
    this.batteryCooldownMax = 5;
    this.batteryCooldown = 0;
    this.batteryOnCooldown = false;

    // speed-o-meter
    this.velocity = 0;
    this.velocityMax = this.speedMax;
    this.velocityAngle = 0;
    this.velocityAngleMax = 2;
    this.speedLimit = true;

    // weapons
    this.turret = [];
    this.turret[0] = new Turret(0.6, this.radius + 10);
    this.turret[1] = new Turret(-0.6, this.radius + 10);

    this.weaponSelected = 1;
    this.weapon = [];
    this.weapon[0] = new Weapon();
    this.weapon[0].initEmpty();
    var w = new Weapon();
    w.initMachinegun();
    var a = new Ammunition();
    a.init();

    w.turret[0] = this.turret[0];
    w.turret[1] = this.turret[1];
    w.initAmmunition(a);
    this.weapon[1] = w;
    this.ammunition = [];
    this.ammunition[0] = a;
    //w.

    //this.

    // movement keys
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.oleft = false;
    this.oup = false;
    this.oright = false;
    this.odown = false;
    this.shoot = false;
    this.brakes = false;
    this.thrusterDown = false;
    this.thrusterLeft = false;
    this.thrusterRight = false;
    this.thrusterUp = false;

}
Ship.prototype.update = function (mod) {
    // Acceleration
    var mass = this.mass;
    //    if (this.weapon && this.weapon.length > 0)
    //        for (wep in this.weapon) {
    //            mass += wep.mass;
    //        }
    //    if (this.ammunition && this.ammunition.length > 0)
    //        for (ammo in this.ammunition) {
    //            mass += ammo.mass * ammo.amount;
    //        }
    var acceleration = this.speed * this.speedWarp;
    var batteryUsed = 0;
    var accelerationX = 0;
    var accelerationY = 0;
    var accelerationAngle = 0;
    var instantStop = 0;

    // stabilize turning angle
    if (this.angle < 0) this.angle += sim.PI2;
    else if (this.angle > sim.PI2) this.angle -= sim.PI2;

    // CALCULATE SPEED
    this.velocity = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);

    // did player press any keys?
    var playerInput = !(!this.up && !this.down && !this.oleft && !this.oup && !this.oright && !this.odown);

//    // CALCULATE VELOCITY ANGLE
//    this.velocityAngle = Math.atan2(this.velocityY, this.velocityX);
//    if (this.velocityAngle < 0) this.velocityAngle += PI2;

    // APPLY BRAKES
    if (!this.batteryOnCooldown) {
        // if old engines are here and activated noob mode or brakes
        // OLD ENGINE
        // only if we don't currently accelerate
        if (this.oldEngine) {
            var accelerationOld = this.oldEngineSpeed * this.speedWarp;
            if (!playerInput)
            if (this.oldTorque || this.brakes) {
                if (this.brakes) accelerationOld *= 2;
                if (this.velocityX != 0 || this.velocityY != 0) {
                    var accelerationOldCalculated = accelerationOld / mass * mod;
                    if (Math.abs(this.velocityX) < accelerationOldCalculated) instantStop ++;//accelerationX = -this.velocityX;
                    else if (this.velocityX > 0) this.oleft = true; else this.oright = true;
                    if (Math.abs(this.velocityY) < accelerationOldCalculated) instantStop ++;//accelerationY = -this.velocityY;
                    else if (this.velocityY > 0) this.oup = true; else this.odown = true;
                }
            }
            // APPLY ACCELERATION AND BATTERY USED
            // OLD METHOD
            if (this.oleft)// go left
            { accelerationX -= accelerationOld; this.oleft = false; batteryUsed += this.bcoThrust; this.othrusterLeft = true; }
            if (this.oup)// go up
            { accelerationY -= accelerationOld; this.oup = false; batteryUsed += this.bcoThrust; this.othrusterUp = true; }
            if (this.oright)// go right
            { accelerationX += accelerationOld; this.oright = false; batteryUsed += this.bcoThrust; this.othrusterRight = true; }
            if (this.odown)// go down
            { accelerationY += accelerationOld; this.odown = false; batteryUsed += this.bcoThrust; this.othrusterDown = true; }
        }

        // NEW METHOD
        // will be default
        // old method will be used by noobs
        // who have additional equipment
        // (but give it to everyone at start)

        // turn assist
        if (this.turnAssist || this.brakes) {
            // but only when we don't currently turn
            if (!this.left && !this.right)
            if (this.velocityAngle != 0) {
                if (Math.abs(this.velocityAngle) < this.speedTurn / mass * mod) this.instantAngleStop = true;
                    else if(this.velocityAngle > 0) this.tleft = true; else this.tright = true;

                if (this.tleft) { // go left
                    accelerationAngle -= this.turnAssistSpeed;
                    this.thrusterLeft = true;
                    this.tleft = false;
                    batteryUsed += this.bcTurnAssist;
                }
                if (this.tright) { // go right
                    accelerationAngle += this.turnAssistSpeed;
                    this.thrusterRight = true;
                    this.tright = false;
                    batteryUsed += this.bcTurnAssist;
                }
            }
        }
        // switch off brakes
        if (this.brakes) this.brakes = false;


        // real thrusters
        if (this.velocityAngleMax) {
            if (Math.abs(this.velocityAngle) > this.velocityAngleMax) {
                if (this.velocityAngle > 0)
                    this.right = false;
                else if (this.velocityAngle < 0)
                    this.left = false;
            }
        }

        // TODO change to not calculate velocityXY every time, but only when you turned
        if (this.left) { // go left
            accelerationAngle -= this.speedTurn;
            this.thrusterLeft = true;
            this.left = false;
            batteryUsed += this.bcTurn;
        }
        if (this.right) { // go right
            accelerationAngle += this.speedTurn;
            this.thrusterRight = true;
            this.right = false;
            batteryUsed += this.bcTurn;
        }
        if (this.up) { // go up
            var angleX = Math.cos(this.angle);
            var angleY = Math.sin(this.angle);
            accelerationX += angleX * acceleration;
            accelerationY += angleY * acceleration;
            this.thrusterUp = true;
            this.up = false;
            batteryUsed += this.bcThrust;
        }
        if (this.down) { // go down
            var angleX = Math.cos(this.angle);
            var angleY = Math.sin(this.angle);
            accelerationX += angleX * -acceleration * this.speedBack;
            accelerationY += angleY * -acceleration * this.speedBack;
            this.thrusterDown = true;
            this.down = false;
            batteryUsed += this.bcThrust * this.speedBack;
        }
    } else {
        this.oup = false; this.odown = false; this.oleft = false; this.oright = false;
        this.up = false; this.down = false; this.left = false; this.right = false;
        this.brakes = false;
    }

    // SOUND PLAYING
    if (!sim.server) {
        if (this.thrusterDown || this.thrusterLeft || this.thrusterRight || this.thrusterUp) {
            if (!this.sounds.thrusters.playing) {
                sndLibrary.fadeIn(this.sounds.thrusters);
                //this.sounds.thrusters.playing = true;
            }
        } else if (this.sounds.thrusters.playing) {
            sndLibrary.fadeOut(this.sounds.thrusters);
            //this.sounds.thrusters.playing = false;
        }
        if (this.othrusterDown || this.othrusterLeft || this.othrusterRight || this.othrusterUp) {
            if (!this.sounds.thrustersold.playing) {
                sndLibrary.fadeIn(this.sounds.thrustersold, 0.5);
                //this.sounds.thrustersold.playing = true;
            }
        } else if (this.sounds.thrustersold.playing) {
            sndLibrary.fadeOut(this.sounds.thrustersold);
            //this.sounds.thrustersold.playing = false;
        }
    }


    // CHECK IF ENOUGH ENERGY
    if (accelerationX != 0 || accelerationY != 0 || accelerationAngle != 0) {
        batteryUsed *= mod;
        if (this.battery > 0) {
            this.battery -= batteryUsed;

            this.accelerate = true;
        } else {
            this.accelerate = false;
            accelerationX = 0;
            accelerationY = 0;
            accelerationAngle = 0;
        }
    } else {
        this.accelerate = false;
    }

    // speed limit apply
    // OLD
//    if (this.speedLimit) {
//        if (this.velocity > this.speedMax) {
//            if (this.velocityX > 0 && accelerationX > 0)
//                accelerationX = 0;
//            else if (this.velocityX < 0 && accelerationX < 0)
//                accelerationX = 0;
//            if (this.velocityY > 0 && accelerationY > 0)
//                accelerationY = 0;
//            else if (this.velocityY < 0 && accelerationY < 0)
//                accelerationY = 0;
//        }
//    }
    // NEW
    if (this.speedLimit) {
        var ve = this.velocity;
        var sm = this.speedMax;
        if (ve > sm) {
            this.bolt += 1;
            var sv = 1 - (sm / ve);
            accelerationX -= sv * this.velocityX * sim.decelerate;
            accelerationY -= sv * this.velocityY * sim.decelerate; //* this.speedWarp * 2);
        }
    }
    // APPLY ACCELERATION
    this.accelerationX = accelerationX;
    this.accelerationY = accelerationY;
    this.accelerationAngle = accelerationAngle;

    if (instantStop == 2) {
        this.instantStop = true;
    }

    // BATTERY ON COOLDOWN AND REGEN LOGIC
    if (this.batteryOnCooldown) {
        this.batteryCooldown -= mod;
        if (this.batteryCooldown <= 0) {
            this.batteryCooldown = 0;
            this.batteryOnCooldown = false;
            this.battery = this.batteryMax / 1000;
        }
    } else {
        if (this.battery <= 0) {
            this.batteryOnCooldown = true;
            this.batteryCooldown = this.batteryCooldownMax;
            if (this.oldEngine) {
                if (sim.debug) console.log("sfwef");
                this.oup = false;
                this.odown = false;
                this.oleft = false;
                this.oright = false;
            }
        } else {
            this.battery += this.batteryRegen * mod;
            if (this.battery > this.batteryMax)
                this.battery = this.batteryMax;
        }
    }

    if (sim.server) {
        // movement keys
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.oleft = false;
        this.oup = false;
        this.oright = false;
        this.odown = false;
        this.brakes = false;
        this.thrusterDown = false;
        this.thrusterLeft = false;
        this.thrusterRight = false;
        this.thrusterUp = false;
        this.othrusterDown = false;
        this.othrusterLeft = false;
        this.othrusterRight = false;
        this.othrusterUp = false;
    }

};
Ship.prototype.destroy = function () {
    if (!sim.server) {
        if (this.oldEngine) {
            this.sounds.thrustersold.playing = false;
            sndLibrary.stop(this.sounds.thrustersold);
        }
        this.sounds.thrusters.playing = false;
        sndLibrary.stop(this.sounds.thrusters);
    }
    this.destroyed = true;
};
Ship.prototype.send = function() {

    var o = this, p = null, r = {}, t = {};
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            if (k != "body" && k != "weapon" && k != "graphics" && k != "sounds") {
                r[k] = o[k];
            } else if (k == "body") {
                // will be null for now
                // later check if body with userData.id exists
                // if so then connect
                // if not create new body
            } else if (k == "weapon") {
                p = o[k];
                t = {};
                for (var l in p) {
                    if (p.hasOwnProperty(l))
                        t[l] = p[l];
                }
                r[k] = t;
            }
        }
    }
    return r;
};


// WEAPONS
function Weapon() {}
Weapon.prototype.init = function () {
    this.initMachinegun();
};
Weapon.prototype.initEmpty = function () { };
Weapon.prototype.initMachinegun = function () {
    // create new weapon-like machinegun
    this.speed = 6;
    this.cooldown = 0.4;
    this.cooldownMin = 0.2;
    this.mass = 15;
    this.turret = [];
    this.types = {};
    this.types[1] = true;
    this.radiusMax = 1;
    this.radiusMin = 0.01;

    this.cooldownS = 0;
    this.cooldownM = 0;
    this.turretN = 0;

    this.shoot = this.newProjectile;
};
Weapon.prototype.initAmmunition = function (ammo) {
    if (sim.debug) console.log("TRYING TO FIT AMMO!");
    if (this.types[ammo.typed] && ammo.radius >= this.radiusMin && ammo.radius <= this.radiusMax) {
        // ammuniton changed
        //console.log("INIT AMMO!");
        this.ammunition = ammo;
    }
    // do something else if ammo not as specified?
};
Weapon.prototype.newProjectile = function () {
    if (this.ammunition) {
        //console.log("WE HAVE AMMO!");
        if (this.ammunition.amount > 0) {
            return this.ammunition.getProjectile();
        } else {
            // TODO give clicking sound, no ammo!
            if (sim.debug) console.log("OUT OF AMMO!");
            return null;
        }
    } else {
        if (sim.debug) console.log("NO AMMO!");
        // TODO no ammo type selected! 
        // what now?
        return null;
    }
};

// AMMUNITION
function Ammunition() { }
Ammunition.prototype.init = function () {
    // default ammunition
    this.mass = 0.01;
    this.radius = 1;
    this.armor = 1;
    this.life = 0.01;
    this.typed = 1;
    this.amount = 2000;
};
Ammunition.prototype.getProjectile = function () {
    //console.log("GOGOGO!");
    var p = new Projectile();
    p.init(this.mass, this.radius, this.armor, this.life, this.typed);
    return p;
};


// PROJECTILE
function Projectile(id) {
    this.id = id || 0;
}
Projectile.prototype.init = function (m, r, a, l, t) {
    // essentials
    this.X = 0;
    this.Y = 0;
    this.angle = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityR = 0;
    this.radius = r || 1;
    this.lifeMax = l || 1;
    this.life = this.lifeMax;
    this.type = 2;
    this.mass = m || 1;
    this.armor = a || 1;

    this.graphics = imgLibrary.cannonball;

    this.typed = t || 1;
    // now need to initialize position and velocity according to shooter

    // longevity, when this reaches 0, destroy object
    this.longevity = 10;
};
Projectile.prototype.update = function (mod) {
    //this.X += this.velocityX * mod;
    //this.Y += this.velocityY * mod;
    //this.angle += this.velocityR * mod;
    //if (Math.random() > 0.99) {
    this.longevity = this.longevity - mod;
    if (this.longevity <= 0) {
        this.life = -1;
    }
};
Projectile.prototype.destroy = function () {
    console.log('DESTROYING PROJECTILE');
};
Projectile.prototype.send = function() {
    var o = this, p = null, r = {}, t = {};
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            if (k != "graphics" && k != "body") {
                r[k] = o[k];
            }
        }
    }
    return r;
//    return {
//        X: this.X,
//        Y: this.Y,
//        angle: this.angle,
//        velocityX: this.velocityX,
//        velocityY: this.velocityY,
//        velocityR: this.velocityR,
//        radius: this.radius,
//        lifeMax: this.lifeMax,
//        l: this.life,
//        t: this.type,
//        m: this.mass,
//        o: this.armor,
//        y: this.typed
//    };
};

// PROJECTILE
function Debris(id) {
    this.id = id || 0;
}
Debris.prototype.init = function (r, a) {
    // essentials
    this.X = 0;
    this.Y = 0;
    this.angle = a || 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityR = 0;
    this.radius = r || 10;
    this.lifeMax = r || 10;
    this.life = this.lifeMax;
    this.type = 1;
    this.mass = 1;
    this.armor = 1;

    this.graphics = imgLibrary.spacerock;
    // now need to initialize position and velocity according to shooter
};
Debris.prototype.update = function (mod) {
    //this.X += this.velocityX * mod;
    //this.Y += this.velocityY * mod;
    //this.angle += this.velocityR * mod;

};
Debris.prototype.destroy = function () {
};
Debris.prototype.send = function() {
    var o = this, p = null, r = {}, t = {};
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            if (k != "graphics" && k != "body") {
                r[k] = o[k];
            }
        }
    }
    return r;
//    return {
//        X: this.X,
//        Y: this.Y,
//        a: this.angle,
//        vX: this.velocityX,
//        vY: this.velocityY,
//        vR: this.velocityR,
//        r: this.radius,
//        L: this.lifeMax,
//        l: this.life,
//        t: this.type,
//        m: this.mass,
//        o: this.armor
//    };
};



// PARTICLE
function Particle(id) {
    this.id = id;
}
Particle.prototype.init = function() {
    //this.initExplosion(0, 0, 10);
};
Particle.prototype.initExplosion = function(x, y, radiusR) {

    // create radius/Z explosions
    var Z = 25;
    this.list = [];
    var d = radiusR + radiusR;
    var expCount = Math.round(radiusR/Z);
    for (var i = 0, j = expCount; i < j; i++) {
        var l = new SimpleParticle();
        console.log(l);
        l.init(- radiusR + Math.random() * d, - radiusR + Math.random() * d, Math.random() * sim.PI);
//        if (!sim.server) {
//            sndLibrary.pos(l.sound, Math.random() * 1.4);
//        }
        if (i == 0) {
            l.c = 0;
            l.v = 0;
//            if (!sim.server) {
//                sndLibrary.explosion();
//            }
        } else {
            l.v = - Math.random();
        }

        this.list.push(l);
    }
    if (!sim.server) {
        sndLibrary.explosion();
    }
    this.type = 4;
    this.X = x;
    this.Y = y;
    this.angle = 0;
    this.radius = radiusR;
    this.life = 1;
    if (!sim.server) {
        this.graphics = imgLibrary.explosion;
    }

    // if first time, prepare explosion mini-images
//    if (this.graphics.prepared != true) {
//        var canvas = document.createElement("canvas");
//        var context = this.canvas.getContext("2d");
//        var wid = this.graphics.main.width;
//        var lp = 0;
//        var lm = this.graphics.main.height / wid;
//        canvas.width = wid;
//        canvas.height = wid;
//        for (var i = 0, j = lm; i < j; i++) {
//            context.drawImage(this.graphics.main, 0, lp * wid, wid, wid, 0, 0, wid, wid);
//        }
//
//    }

};
Particle.prototype.destroy = function() {
//    if (!sim.server)
//    for (var i = 0, j = this.list.length; i < j; i++) {
//        sndLibrary.unload(this.list[i].sound);
//    }

};
Particle.prototype.update = function(mod) {
    var end = true;
    for (var i = 0, j = this.list.length; i < j; i++) {
        var l = this.list[i];
        l.v += mod;
        if (l.v > 1) {
            l.c = -1;
//            if (!sim.server) {
//                sndLibrary.stop(l.sound);
//                if (l.sound)
//                    l.sound.playing = false;
//            }
        } else if (l.v >= 0) {
//            if (!sim.server) {
//                if (l.sound)
//                    if (!l.sound.playing)
//                        sndLibrary.play(l.sound);
//            }
            l.c = Math.round((l.v * 1000)/66);
            end = false;
        } else end = false;
    }
    if (end) {
        this.life = -1;
    }
};
Particle.prototype.send = function() {
    var o = this, p = null, r = {}, t = {};
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            if (k != "graphics") {
                r[k] = o[k];
            }
        }
    }
    return r;
};


function SimpleParticle() {

}
SimpleParticle.prototype.init = function(x, y, a) {
    this.X = x;
    this.Y = y;
    this.angle = a;
    this.c = -1;
    this.v = -1;
//    if (!sim.server) {
//        this.sound = sndLibrary.explosion();
//        this.sound.playing = false;
//    }
};





// PLAYER
function Player(id) {
    this.id = id;
    this.score = 10;
}
Player.prototype.init = function(ship) {
    this.ship = ship;
    this.ship.playerId = this.id;
    this.keysDown = {};
    this.lastKeysDown = {};
    this.actions = ["left", "up", "right", "down", "oleft", "oup", "oright", "odown", "brakes", "shoot"];
};
Player.prototype.updateMy = function (modifier) {

    var l = this.lastKeysDown;

    if (37 in inpLibrary.keysDown)// go left
        l['left'] = true;
    if (38 in inpLibrary.keysDown)// go up
        l['up'] = true;
    if (39 in inpLibrary.keysDown)// go right
        l['right'] = true;
    if (40 in inpLibrary.keysDown)// go down
        l['down'] = true;

    if (100 in inpLibrary.keysDown)// go left
        l['oleft'] = true;
    if (104 in inpLibrary.keysDown)// go up
        l['oup'] = true;
    if (102 in inpLibrary.keysDown)// go right
        l['oright'] = true;
    if (98 in inpLibrary.keysDown)// go down
        l['odown'] = true;

    if (32 in inpLibrary.keysDown)// brakes
        l['brakes'] = true;

    if (17 in inpLibrary.keysDown) // shooting
        l['shoot'] = true;

//    if (66 in inpLibrary.keysDown) {// toggle noob mode
//        this.ship.oldTorque = !this.ship.oldTorque;
//        delete inpLibrary.keysDown[66];
//    }
//    if (72 in inpLibrary.keysDown) {// toggle noob mode
//        this.ship.turnAssist = !this.ship.turnAssist;
//        delete inpLibrary.keysDown[72];
//    }

    if (!sim.server) this.updateClient(modifier);


};
Player.prototype.update = function (modifier) {

    var p = 0, a = this.actions, al = a.length, s = this.ship, k = this.keysDown;
    while (p < al) {
        if (a[p] in k) //{
            s[a[p]] = true;
//        } else {
//            s[a[p]] = false;
//        }
        p++;
    }


};
Player.prototype.updateClient = function(modifier) {


    var p = 0, a = this.actions, al = a.length, s = this.ship, k = this.keysDown, l = this.lastKeysDown, m = null;
    while (p < al) {
        //m = l[a[p]];
        //if(l.hasOwnProperty(a[p]))
        if (a[p] in l) {
            if (!(a[p] in k)) {
                k[a[p]] = true;
                sim.call.callback_('key', {k: a[p], o: 1});
            }
            delete l[a[p]];
        } else {
            if (a[p] in k) {
                delete k[a[p]];
                sim.call.callback_('key', {k: a[p], o: 0});
            }
        }
        p++;
    }


//    function RunPrefixMethod(obj, method) {
//        var pfx = ["webkit", "moz", "ms", "o", ""];
//        var p = 0, m, t;
//        while (p < pfx.length && !obj[m]) {
//            m = method;
//            if (pfx[p] == "") {
//                m = m.substr(0, 1).toLowerCase() + m.substr(1);
//            }
//            m = pfx[p] + m;
//            t = typeof obj[m];
//            if (t != "undefined") {
//                pfx = [pfx[p]];
//                return (t == "function" ? obj[m]() : obj[m]);
//            }
//            p++;
//        }
//    }
//
//
//
//
//
//
//    if (this.ship.left) {
//        if (!(0 in this.keysDown)) {
//
//        }
//    }

};
Player.prototype.render = function() {

};
Player.prototype.remove = function() {
    this.id = null;
    this.ship.playerId = null;
    this.ship = null;
};
Player.prototype.send = function() {
    return { id: this.id, keysDown: this.keysDown };
};


// STARFIELD: PART OF BACKGROUND
//var backgroundsLoaded = 0;
//var drawBackgrounds = false;
function Starfield() {}
Starfield.prototype.init = function (count, radiu, width, height) {
    // NEW METHOD
    // CREATE STAR OBJECTS AND DRAW THEM EVERY TIME

    this.X = 0;
    this.Y = 0;

    this.starImage = imgLibrary.star;
    this.parralax = 1;

    this.stars = [];
    for (var i = 0, j = count; i < j; ++i) {

        var centerX = Math.random() * width;
        var centerY = Math.random() * height;
        var radius = (Math.random() * radiu) + 0.1;

        this.stars[i] = [];
        this.stars[i].X = centerX;
        this.stars[i].Y = centerY;
        this.stars[i].r = radius;

    }
};



// CONSOLE
function ConsoleDev() {}
ConsoleDev.prototype.init = function() {
    this.clear();
};
ConsoleDev.prototype.initNewMessage = function(text) {
    text = typeof text !== 'undefined' ? text : '';
    this.c.push(text);
    this.current++;
    this.lastRetC = 0;
};
ConsoleDev.prototype.getMessages = function(howMany) {
    howMany = typeof howMany !== 'undefined' ? howMany : 1;
    if (this.lastRetC == howMany) return this.lastRet;
    if (this.c.length > 0) {
        var retVal = [];
        for (var i = this.current, j = i - howMany; j < i; i--) {
            if (this.c[i])
                retVal.push(this.c[i]);
        }
        //console.log(retVal.length);
        this.lastRet = retVal;
        this.lastRetC = retVal.length;
        return retVal;
    } else
        return [];
};
ConsoleDev.prototype.goPrev = function(howMany) {
    howMany = typeof howMany !== 'undefined' ? howMany : 1;
    if (this.c.length > 0) {
        this.current -= howMany;
        if (this.current < 0) this.current = 0;
        this.lastRetC = 0;
    }
};
ConsoleDev.prototype.goNext = function(howMany) {
    howMany = typeof howMany !== 'undefined' ? howMany : 1;
    if (this.c.length > 0) {
        this.current += howMany;
        if (this.current >= this.c.length) this.current = this.c.length - 1;
        this.lastRetC = 0;
    }
};
ConsoleDev.prototype.goEnd = function() {
    if (this.c.length > 0) {
        this.current = this.c.length - 1;
        this.lastRetC = 0;
    }
};
ConsoleDev.prototype.clear = function() {
    this.c = [];
    this.lastRet = [];
    this.lastRetC = 0;
    this.current = -1;
};



// PHYSICS - box2d methods for setting up world, objects properties and advancing everything
Physics = function() {}
Physics.prototype.init = function() {
    var gravity = new sim.b2Vec2(0,0);
    this.world = new sim.b2World(gravity, true);
    this.scale = 100;
    this.velIter = 10;
    this.posIter = 10;
    this.precision = 100;
    this.updateIfMore = 2;
    this.initContactListener();

};
// init sim.debug draw based on context
Physics.prototype.initDebugDraw = function(con) {
    var debugDraw = new sim.b2DebugDraw();
    debugDraw.SetSprite(con);
    debugDraw.SetDrawScale(1);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(sim.b2DebugDraw.e_shapeBit | sim.b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
};
Physics.prototype.initContactListener = function() {
    var listener = new sim.b2ContactListener;
    listener.BeginContact = function(contact) {
//        console.log("BeginContact:");
//        console.log(contact.GetFixtureA().GetBody().GetUserData());
//        console.log(contact.GetFixtureB().GetBody().GetUserData());
    };
    listener.EndContact = function(contact) {
//        console.log("EndContact:");
//        console.log(contact.GetFixtureA().GetBody().GetUserData());
//        console.log(contact.GetFixtureB().GetBody().GetUserData());
    };
    listener.PostSolve = function(contact, impulse) {
//        console.log("PostSolve:");
//        console.log(contact.GetFixtureA().GetBody().GetUserData());
//        console.log(contact.GetFixtureB().GetBody().GetUserData());
        var o1 = contact.GetFixtureA().GetBody().GetUserData();
        var o2 = contact.GetFixtureB().GetBody().GetUserData();
        var s = impulse.normalImpulses[0];
        if (o1.armor - o2.armor < s)
            o1.life -= s - o1.armor + o2.armor;
        if (o2.armor - o1.armor < s)
            o2.life -= s - o2.armor + o1.armor;
        if (o1.type == 2 || o2.type == 2) {
            o2.life -= 10;
            o1.life -= 10;
        }

        //o1.life -= impulse.normalImpulses().x * impulse.normalImpulses().x + impulse.normalImpulses().y * impulse.normalImpulses().y;
        //console.log(impulse.normalImpulses[0]);


    };
    listener.PreSolve = function(contact, oldManifold) {
//        console.log("PreSolve:");
//        console.log(contact.GetFixtureA().GetBody().GetUserData());
//        console.log(contact.GetFixtureB().GetBody().GetUserData());
    };
    this.world.SetContactListener(listener);
};
// create new body and save its properties to body
Physics.prototype.createBody = function(o) {
    // physics properties
    var fixDef = new sim.b2FixtureDef;
    fixDef.density = 50; // 100 kg/m^2
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    fixDef.shape = new sim.b2CircleShape(o.radius / this.scale);
    //create object
    var bodyDef = new sim.b2BodyDef;
    bodyDef.type = sim.b2Body.b2_dynamicBody;
    bodyDef.position.x = o.X / this.scale;
    bodyDef.position.y = o.Y / this.scale;
    bodyDef.angle = o.angle;
    bodyDef.linearVelocity = new sim.b2Vec2(o.velocityX, o.velocityY);
    bodyDef.angularVelocity = o.velocityR;
    o.body = this.world.CreateBody(bodyDef);
    o.body.fix = o.body.CreateFixture(fixDef);
    o.body.SetBullet(true);
    o.body.SetUserData(o);
};
// change noclip
Physics.prototype.noclip = function(o, b) {
    o.body.fix.SetSensor(b);
};
// delete body
Physics.prototype.destroyBody = function(o) {
    this.world.DestroyBody(o.body);
};
Physics.prototype.destroyAll = function() {
    this.init();
};
// update object to be like body
Physics.prototype.updateObject = function(o) {
    var po = o.body.GetPosition();
    o.X = po.x * this.scale;
    o.Y = po.y * this.scale;
    o.angle = o.body.GetAngle();
    var lv = o.body.GetLinearVelocity();
    o.velocityX = lv.x * this.scale;
    o.velocityY = lv.y * this.scale;
    o.velocityAngle = o.body.GetAngularVelocity();
    o.mass = o.body.GetMass();
};
// replace object position with old position + x, y (for teleporting, going past space border)
Physics.prototype.replacePosition = function(o, x, y) {
    var newPos = new sim.b2Vec2(x / this.scale, y / this.scale);
    newPos.x += o.body.GetPosition().x;
    newPos.y += o.body.GetPosition().y;
    o.body.SetPosition(newPos);
};
// apply forces to body
Physics.prototype.applyForces = function(o) {
    o.body.ApplyForce(new sim.b2Vec2(o.accelerationX / this.scale, o.accelerationY / this.scale), o.body.GetPosition());
    o.body.ApplyTorque(o.accelerationAngle);
};
// apply impulse to body
Physics.prototype.applyImpulse = function(o, x, y) {
    o.body.ApplyImpulse(new sim.b2Vec2(x / this.scale, y / this.scale), o.body.GetPosition());
};
// match new object velocity to its host (like bullet coming from ship)
Physics.prototype.matchVelocity = function(o, h) {
    o.body.SetLinearVelocity(h.body.GetLinearVelocity());
};
// instantly stops the object
Physics.prototype.instantStop = function(o) {
    o.body.SetLinearVelocity(new sim.b2Vec2(0, 0));
};
// instantly stops the angular velocity
Physics.prototype.instantAngleStop = function(o) {
    o.body.SetAngularVelocity(0);
};
// step world
Physics.prototype.step = function(delta) {
    this.world.Step(
        delta      //frame-rate
        ,  this.velIter         //velocity iterations
        ,  this.posIter         //position iterations
    );

    this.world.ClearForces();
};
Physics.prototype.draw = function() {
    this.world.DrawDebugData();
};
// will send vital data that after creating will recreate same object
Physics.prototype.sendBody = function(body) {
    var lv = body.GetLinearVelocity();
    var lvx = lv.x;
    var lvy = lv.y;
    var av = body.GetAngularVelocity();
    var p = body.GetPosition();
    var px = p.x;
    var py = p.y;
    var a = body.GetAngle();
    if (true) {
        // floor all the things
        lvx = Math.floor(lvx * this.precision)/this.precision;
        lvy = Math.floor(lvy * this.precision)/this.precision;
        av = Math.floor(av * this.precision)/this.precision;
        px = Math.floor(px * this.precision)/this.precision;
        py = Math.floor(py * this.precision)/this.precision;
        a = Math.floor(a * this.precision)/this.precision;
    }
    return { d: [lvx , lvy, av, px, py, a] };
    //return [lv.x , lv.y, av, p.x, p.y, a];
};
// will receive vital data that after creating will recreate same object
Physics.prototype.receiveBody = function(from, to) {
    var lv = new sim.b2Vec2(from.d[0], from.d[1]);
    var p = new sim.b2Vec2(from.d[3], from.d[4]);
    var av = from.d[2];
    var a = from.d[5];
    //if (Math.abs(p.x - to.GetLinearVelocity().x) > this.updateIfMore || Math.abs(p.y - to.GetLinearVelocity().y) > this.updateIfMore)
        to.SetPositionAndAngle(p, a);
    //if (Math.abs(lv.x - to.GetLinearVelocity().x) > this.updateIfMore || Math.abs(lv.y - to.GetLinearVelocity().y) > this.updateIfMore)
        to.SetLinearVelocity(lv);
    //if (Math.abs(av - to.GetAngularVelocity) > this.updateIfMore / 10)
        to.SetAngularVelocity(av);
    //to.ApplyImpulse(lv,new sim.b2Vec2(0, 0));
    //to.ApplyTorque(av);
    return to;
};



// LEVEL this is level where all object reside
function Level() {};
Level.prototype.init = function() {

    this.objects = [];
    this.X_MAX = 1920 * 5; // MAX value for world
    this.Y_MAX = 1080 * 5;


};
Level.prototype.update = function (modifier, time) {
    // LEVEL LOGIC
    // in case we want to add new objects or delete some
    var newObjects = [];
    var delObjects = [];
    // update all objects
    for (var i = 0, j = this.objects.length; i < j; ++i) {
        var o = this.objects[i];
        if (o.type == 4) {
            o.update(modifier);
            if (o.life < 0) {
                o.destroy();
                //this.deleteObject(o.id);
                delObjects.push(i);
            }
        } else {
            // first translate all body changes to our object
            this.physics.updateObject(o);
            // call our object update
            o.update(modifier);
            // now translate it back
            // APPLY ACCELERATION
            if (o.accelerate) {
                this.physics.applyForces(o);
            }
            if (o.instantStop) {
                this.physics.instantStop(o);
                o.instantStop = false;
            }
            if (o.instantAngleStop) {
                this.physics.instantAngleStop(o);
                o.instantAngleStop = false;
            }
            // handle creating new objects (shooting)
            if (sim.singleplayer || sim.server)
            if (o.shoot) {
                // check if its eligible for shooting
                if (o.weaponSelected && o.weapon[o.weaponSelected]) {
                    var w = o.weapon[o.weaponSelected];
                    if (time.second > w.cooldownS) {
                        // shoot
                        var p = null;
                        if (p = w.shoot()) {
                            // successfully shot
                            w.turret[w.turretN].calculateOrigin(o.X, o.Y, o.angle);
                            p.X = w.turret[w.turretN].getX();
                            p.Y = w.turret[w.turretN].getY();
                            // defaults ship angle
                            p.angle = o.angle;
                            var angleX = Math.cos(p.angle) * w.speed;
                            var angleY = Math.sin(p.angle) * w.speed;
                            // give it physical attributes
                            this.physics.createBody(p);
                            this.physics.matchVelocity(p, o);
                            this.physics.applyImpulse(p, angleX, angleY);
                            this.physics.applyImpulse(o, -angleX, -angleY);
                            newObjects.push(p);
                        }
                        // prepare next cooldown
                        var col = Math.max(w.cooldown / w.turret.length, w.cooldownMin);
                        var tur = w.turretN + 1;
                        if (tur >= w.turret.length)
                            tur = 0;
                        w.cooldownS = time.second + col;
                        w.turretN = tur;
                    }
                }
                // turn off shooting
                o.shoot = false;
            }
            // correct object if its outside the bounds of the game
            if (o.X >= this.X_MAX) {
                o.X -= this.X_MAX;
                this.physics.replacePosition(o, -this.X_MAX, 0);
                if (sim.debug) console.log("UP");
            }
            if (o.Y >= this.Y_MAX) {
                o.Y -= this.Y_MAX;
                this.physics.replacePosition(o, 0, -this.Y_MAX);
                if (sim.debug) console.log("DOWN");
            }
            if (o.X < 0) {
                o.X += this.X_MAX;
                this.physics.replacePosition(o, this.X_MAX, 0);
                if (sim.debug) console.log("LEFT");
            }
            if (o.Y < 0) {
                o.Y += this.Y_MAX;
                this.physics.replacePosition(o, 0, this.Y_MAX);
                if (sim.debug) console.log("RIGHT");
            }
            // check if it should be deleted
            if (sim.singleplayer || sim.server)
            if (o.life < 0) {
                delObjects.push(i);
            }
        }
    }
    // delete objects that need to be deleted
//    if (sim.singleplayer)
//    if (delObjects.length > 0)
//    for (var i = 0; i < delObjects.length; i++) {
//        var d = delObjects[i];
//        var no = this.objects[d];
//        if (no)
//            no.destroy();
//    }
    if (sim.server || sim.singleplayer)
    if (delObjects.length > 0)
    for (var i = 0; i < delObjects.length; i++) {
        var d = delObjects[i];
        var no = this.objects[d];
        if (no) {
            if (sim.singleplayer || sim.server)
            if (no.type == 0) {
                // it was a ship, create debris
                var p = new Debris();
                p.init(no.radius, no.angle);
                p.X = no.X;
                p.Y = no.Y;
                this.physics.createBody(p);
                newObjects.push(p);

                // also create new ship for that player
                if (sim.server) sim.call.callback_("createnewship", { id: no.playerId });

            }

            if (no.type < 2 || no.type == 3) {
                // if it was something that should explode, create explosion particle effect
                var exp = new Particle();
                exp.initExplosion(no.X, no.Y, no.radius);
                newObjects.push(exp);
            }

            //this.deleteObject(no.id);
            if (sim.server) sim.call.callback_("deleteobject", { id: no.id });
            else if (sim.singleplayer) this.deleteObject(no.id);
            //this.physics.destroyBody(no);
            //this.objects.splice(d, 1);
        } else {
            console.log('WTF?! NO OBJECT THAT I WANT TO DELETE?');
            console.log(delObjects);
            console.log(this.objects);
            console.log('END OF WTF?! NO OBJECT THAT I WANT TO DELETE?');
        }
    }
    // now can add new object into the rooster
    if (sim.server || sim.singleplayer)
    if (newObjects.length > 0) {
        for (var i = 0, j = newObjects.length; i < j; ++i) {
            if (sim.server)
                sim.call.callback_("createobject", { o: newObjects[i] });
            else if(sim.singleplayer) this.objects.push(newObjects[i]);
        }
    }
    // physic update
    this.physics.step(modifier);
};
Level.prototype.createObject = function(id) {
//    var ob = this.objects, ide = null, o = null;
//    for (var i = -1, lennn = ob.length; ++i < lennn;) {
//        if (ob[i].id == id) {
//            ide = i;
//            o = ob[i];
//            break;
//        }
//    }
////    if (no.type == 0) {
////        // it was a ship, create debris
////        var p = new Debris();
////        p.init(no.radius, no.angle);
////        p.X = no.X;
////        p.Y = no.Y;
////        this.physics.createBody(p);
////        newObjects.push(p);
////    }
//    if (o) {
//        o.destroy();
//        this.physics.destroyBody(o);
//        o = null;
//        ob.splice(ide, 1);
//    }

};
Level.prototype.deleteObject = function(id) {
    var ob = this.objects, ide = null, o = null;
    for (var i = -1, lennn = ob.length; ++i < lennn;) {
        if (ob[i].id == id) {
            ide = i;
            o = ob[i];
            break;
        }
    }
//    if (no.type == 0) {
//        // it was a ship, create debris
//        var p = new Debris();
//        p.init(no.radius, no.angle);
//        p.X = no.X;
//        p.Y = no.Y;
//        this.physics.createBody(p);
//        newObjects.push(p);
//    }
    if (o) {
        o.destroy();
        if (o.body)
            this.physics.destroyBody(o);
        o = null;
        ob.splice(ide, 1);
    } else {
        console.log('deleting no existing object?');
    }

};
Level.prototype.receivedObject = function(object, body) {
    // create object from blueprints received
    var o = null;
    switch (object.type) {
        case 0: o = new Ship();
                break;
        case 1: o = new Debris();
                break;
        case 2: o = new Projectile();
                break;
        case 3: o = new Projectile();
                break;
        case 4: o = new Particle(object.id);
                o.initExplosion(object.X, object.Y, object.radius);
                break;
        default:break;
    }
    if (object.type != 4) {
        o.init();
        setAllProperties(object, o);
        this.physics.createBody(o);
        this.physics.receiveBody(body, o.body);
    }
    this.objects.push(o);
    return o;
};



// SCREEN - this is camera object, it renders on canvas
// will draw from buffers to main window
// buffers
// 0 - starfield
// 1 - objects
// 2 - objects with trails
// 3 -
// 4 - hud
// 5 - explosions
function Screen() {}
Screen.prototype.init = function () {
    // INIT CANVAS
    // Create the canvas
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.canvas.id = "gameCanvas";

    // create buffer canvases
    this.can = [];
    this.ctx = [];
    var cans = 6;
    for (var i = 0, j = cans; i < j; ++i) {
        this.can[i] = document.createElement("canvas");
        this.ctx[i] = this.can[i].getContext("2d");
    }

    // set width and height
    this.finishedResizing();

    // init sim.debug drawing for physic engine
    this.game.physics.initDebugDraw(this.context);

    // camera position (left-up corner bound)
    this.X = 0;
    this.Y = 0;

    // starfield
    //game.screen.initStarfield();
    this.initStarfield();

    // RESIZING LOGIC
    function finRe() { game.screen.finishedResizing() }
    var resizeTimeout;
    window.onresize = function () {
        if (sim.debug) console.log("resizing event fired");
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(finRe, 500);
    };



    this.drawn = 0;
    this.drawnMax = 100;
    this.scale = 10;
};
Screen.prototype.finishedResizing = function () {
    // REINIT CANVAS
    this.initResolution(window.innerWidth, window.innerHeight);
};
Screen.prototype.initResolution = function(x, y) {
    this.width = x || 800;
    this.height = y || 600;

    // set main screen
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // set buffer screens
    for (var i = 0, j = this.can.length; i < j; ++i) {
        this.can[i].width = this.width;
        this.can[i].height = this.height;
    }

    // make some stars
    this.initStarfield();

    // draw once
};
Screen.prototype.initStarfield = function() {
    var som = this.width / 100;
//    if (this.height < som)
//        som = this.height / 100;
//    else
//        som = som / 100;
    // should use image instead of drawing the circle
    this.starsImage = false;
    this.starfield = [];
    for (var i = 0, j = som; i < j; ++i) {
        this.starfield[i] = new Starfield();
        var rand = Math.floor(Math.random() * 100) / 100;
        this.starfield[i].init(som, rand / 2, this.width, this.height);
        this.starfield[i].parralax = rand;
    }
    var firstStarfield = new Starfield();
    firstStarfield.init(som, 0.01, this.width, this.height);
    firstStarfield.parralax = 0.01;
    this.starfield.push(firstStarfield);
    var lastStarfield = new Starfield();
    lastStarfield.init(som, 0.5, this.width, this.height);
    lastStarfield.parralax = 1;
    this.starfield.push(lastStarfield);
};
Screen.prototype.fullScreen = function () {
    if (RunPrefixMethod(this.canvas, "FullScreen") || RunPrefixMethod(this.canvas, "IsFullScreen")) {
        if (sim.debug) console.log("cancelling full screen...");
        RunPrefixMethod(this.canvas, "CancelFullScreen");
    }
    else {
        if (sim.debug) console.log("requesting full screen...");
        RunPrefixMethod(this.canvas, "RequestFullScreen");
    }

};
Screen.prototype.activate = function () {
    //this.canvas.hidden = "false";
    document.body.appendChild(this.canvas);
};
Screen.prototype.destroy = function () {
    this.canvas.parentNode.removeChild(this.canvas);
};
Screen.prototype.update = function (modifier) {

    // GO FULLSCREEN
//    if (122 in inpLibrary.keysDown) {
//        this.fullScreen();
//        delete inpLibrary.keysDown[122];
//    }
    var scale = this.scale / 10;

    // UPDATE SCREEN POSITION
    // check what camera mode is on
    if (this.centerCamera) {
        this.X = this.cameraFollow.X - this.width / 2;
        this.Y = this.cameraFollow.Y - this.height / 2;
        this.centerCamera = false;
    } else
    if (this.cameraMode == 0) {
        // do noting, stationary camera
    } else if (this.cameraMode == 1) {
        // simple always in center camera
        this.X = this.cameraFollow.X - this.width / 2;
        this.Y = this.cameraFollow.Y - this.height / 2;
    } else if (this.cameraMode == 2) {
        // advanced catch-up camera
        var X = (this.cameraFollow.X - this.X) - this.width / 2 + this.cameraFollow.radius;
        var Y = (this.cameraFollow.Y - this.Y) - this.height / 2 + this.cameraFollow.radius;
        //var distance = Math.sqrt(X*X + Y*Y);
        //var mean = (distance / this.cameraFollow.velocityMax + 9)/10;
        this.X += X * modifier * 1.5;
        this.Y += Y * modifier * 1.5;

        //this.X = this.cameraFollow.X - this.width/2 + this.cameraFollow.height/2;
        //this.Y = this.cameraFollow.Y - this.height/2 + this.cameraFollow.height/2;
    } else if (this.cameraMode == 3) {
        // advanced catch-up camera 2
        var X = this.cameraFollow.X - this.X - this.width / 2 + this.cameraFollow.radius;
        var Y = this.cameraFollow.Y - this.Y - this.height / 2 + this.cameraFollow.radius;
        //var distance = Math.sqrt(X*X + Y*Y);
        //var mean = (distance / this.cameraFollow.velocityMax + 1)/10;
        this.X += X * modifier * 1000 / this.width;
        this.Y += Y * modifier * 1000 / this.height;

        //this.X = this.cameraFollow.X - this.width/2 + this.cameraFollow.height/2;
        //this.Y = this.cameraFollow.Y - this.height/2 + this.cameraFollow.height/2;
    } else if (this.cameraMode == 4) {
        var rad = 6;
        // advanced catch-up camera 3
        var X = (this.cameraFollow.X - this.X) - (this.width / 2);
        var Y = (this.cameraFollow.Y - this.Y) - (this.height / 2);

        var w = this.width / scale;
        var h = this.height / scale;

        if (Math.abs(X) < w / rad)
            this.X += X * modifier;
        else if (Math.abs(X) < w / 2) {
            if (X > 0)  this.X -= w / rad - X;
                else    this.X += w / rad + X;
        }
        else
            this.X = this.cameraFollow.X - this.width / 2;

        if (Math.abs(Y) < h / rad)
            this.Y += Y * modifier;
        else if (Math.abs(Y) < h / 2) {
            if (Y > 0)  this.Y -= h / rad - Y;
                else    this.Y += h / rad + Y;
        }
        else
            this.Y = this.cameraFollow.Y - this.height / 2;
        //this.X = this.cameraFollow.X - this.width/2 + this.cameraFollow.height/2;
        //this.Y = this.cameraFollow.Y - this.height/2 + this.cameraFollow.height/2;
    } else if (this.cameraMode == 5) {
        // camera always showing player, the faster he moves the more it shows in front of him

        //this.X = this.cameraFollow.X - this.width/2 + this.cameraFollow.height/2;
        //this.Y = this.cameraFollow.Y - this.height/2 + this.cameraFollow.height/2;
    }

    //this.game.physics.

};
Screen.prototype.render = function () {
    // render black background
    var c = null;
    if (sim.oneCanvas)
        c = this.context;
    else
        c = this.ctx[0];

    c.beginPath();
    c.rect(0, 0, this.canvas.width, this.canvas.height);
    c.fillStyle = 'black';
    //c.fillStyle = "rgba(0,0,0,0.5)";
    c.fill();
    c.closePath();

    this.renderStarfield();

    if (!sim.oneCanvas) {
        this.can[1].width = this.width;
        //this.ctx[2].fillStyle = "rgba(0,0,0,0.25)";
        //this.ctx[2].fillRect(0, 0, this.width, this.height);
        this.can[4].width = this.width;
    }

    var scale = this.scale / 10;


    // render ships OBJECTS
    // make bigger ones appear behind smaller ones
    // but that will be later for now just render them
    this.drawn = 0;
    for (var i = 0, j = this.game.level.objects.length; i < j; ++i) {
        this.renderObject(this.game.level.objects[i]);
    }

    // render world boundaries
    //c.fillStyle = 'black';
    c.fillStyle = "rgba(0,0,0,0.66)";
    if (this.X * scale < (this.width/2 - (this.width/2) * scale)) {
        c.fillRect(0, 0, -this.X * scale + (this.width / 2 - (this.width / 2) * scale), this.height);
    }
    if (this.Y * scale < this.height/2 - (this.height/2) * scale) {
        c.fillRect(0, 0, this.width, -this.Y * scale + this.height/2 - (this.height/2) * scale);
    }
    if ((this.X - this.game.level.X_MAX) * scale + this.width > (this.width/2 - (this.width/2) * scale)) {
        c.fillRect((this.game.level.X_MAX - this.X) * scale + (this.width/2 - (this.width/2) * scale), 0, this.width, this.height);
    }
    if ((this.Y - this.game.level.Y_MAX) * scale + this.height > (this.height/2 - (this.height/2) * scale)) {
        c.fillRect(0, (this.game.level.Y_MAX - this.Y) * scale + (this.height/2 - (this.height/2) * scale), this.width, this.height);
    }


    // render HUD (ideally on top of everything)
    if (this.game.renderHUD) this.renderHUD();





    // show console text
    var mess = this.game.co.getMessages(5);
    for (var i = 0; i < mess.length; i++) {
        var a = 1 - i * 0.2;
        this.renderTextAtRow(mess[i], i, 2, a);
        //console.log(mess[i]);
    }

    // now connect all buffers together
    //ctx[0]
    for (var i = 0, j = this.can.length; i < j; ++i) {
        //this.can[i].width = this.width;
        //this.can[i].height = this.height;
        var c = this.can[i];
        this.context.drawImage(c, 0, 0);
        //this.ctx[i] = this.can[i].getContext("2d");
    }
//    var c = this.can[0];
//    this.context.drawImage(c, 0, 0);
};
Screen.prototype.renderObject = function (object) {

    var scale = this.scale / 10;
    // CHECK IF VISIBLE BY CAMERA
    // can actually be done periodically, not every frame
    // but then it would be hard to keep up with what to draw now and what not
    var X = (object.X - this.X) * scale + this.width / 2 - (this.width / 2) * scale;
    var Y = (object.Y - this.Y) * scale + this.height / 2 - (this.height / 2) * scale;
    //if (X > -object.radius*2 && X < this.width + object.radius*2 && Y > -object.radius*2 && Y < this.height + object.radius*2) {
    // OBJECT IN VISION, DRAW!
    //this.context.drawImage(object.img, X, Y);

    //drawMyImage(this.context, object.graphics.image, X, Y, object.angle, scale);


    if (X > -object.radius * scale * 2 && X < this.width + object.radius * scale * 2 && Y > -object.radius * scale * 2 && Y < this.height + object.radius * scale * 2) {
        var c = null;
        var ct = null;
        if (sim.oneCanvas) {
            c = this.context;
            ct = this.context;
        } else {
            c = this.ctx[1];
            ct = this.ctx[0];
        }
        // its a SHIP
        if (object.type == 0) {
            // if old engine (that goes under ship)
            if (object.oldEngine) {
                var ogo = object.graphics.old;
                var ogon = object.graphics.oldon;
                var or = object.radius * scale;
                // draw thrusters
                if (object.othrusterUp) {
                    drawMyImage(c, ogon, X, Y + or, sim.PI3_2, scale);
                    object.othrusterUp = false;
                } else {
                    drawMyImage(c, ogo, X, Y + or, sim.PI3_2, scale);
                }
                if (object.othrusterDown) {
                    drawMyImage(c, ogon, X, Y - or, sim.PI_2, scale);
                    object.othrusterDown = false;
                } else {
                    drawMyImage(c, ogo, X, Y - or, sim.PI_2, scale);
                }
                if (object.othrusterLeft) {
                    drawMyImage(c, ogon, X + or, Y, sim.PI, scale);
                    object.othrusterLeft = false;
                } else {
                    drawMyImage(c, ogo, X + or, Y, sim.PI, scale);
                }
                if (object.othrusterRight) {
                    drawMyImage(c, ogon, X - or, Y, 0, scale);
                    object.othrusterRight = false;
                } else {
                    drawMyImage(c, ogo, X - or, Y, 0, scale);
                }
                // 3d sound
                if (object.sounds.thrustersold._volume > 0) {
                    var xe = (X / this.width) * 6 - 3;
                    var ye = (Y / this.height) * 6 - 3;
                    object.sounds.thrustersold.pos3d(xe, ye, 0);
                }
            }

            // ship image
            drawMyImage(c, object.graphics.image, X, Y, object.angle, scale);


            // TODO move it to sound library
            // change position of 3d sound
            if (object.sounds.thrusters._volume > 0) {
                var xe = (X / this.width) * 6 - 3;
                var ye = (Y / this.height) * 6 - 3;
                object.sounds.thrusters.pos3d(xe, ye, 0);
            }

            // draw thrusters
            if (object.thrusterUp) {
                drawMyImage(c, object.graphics.up, X, Y, object.angle, scale);
                object.thrusterUp = false;
            }
            if (object.thrusterDown) {
                drawMyImage(c, object.graphics.down, X, Y, object.angle, scale);
                object.thrusterDown = false;
            }
            if (object.thrusterLeft) {
                drawMyImage(c, object.graphics.left, X, Y, object.angle, scale);
                object.thrusterLeft = false;
            }
            if (object.thrusterRight) {
                drawMyImage(c, object.graphics.right, X, Y, object.angle, scale);
                object.thrusterRight = false;
            }



            // draw hud velocity indicator
            //this.context.lineCap = 'round';
            //this.context.lineWidth = 4;
            //this.context.strokeStyle = 'lightblue';
            //this.context.dashedLine(X, Y, object.velocityX / 2 + X, object.velocityY / 2 + Y, 2);
            //this.context.strokeStyle = 'green';
            //this.context.dashedLine(X, Y, object.velocityX / 2 + X, object.velocityY / 2 + Y);


            c.beginPath();
            c.moveTo(X, Y);
            c.lineWidth = 1;
            c.strokeStyle = 'lightblue';
            c.lineTo(object.velocityX * scale / 2 + X, object.velocityY * scale / 2 + Y);
            c.stroke();
            c.closePath();

            // draw life bar
            this.renderLifeBar(object);

        } else if (object.type == 1) {
            // space debris
            var r = object.radius / 500;
            drawMyImage(ct, object.graphics, X, Y, object.angle, scale * r);
            // draw life bar
            this.renderLifeBar(object);
        } else if (object.type == 2) {
            // bullet
            if (this.drawn < this.drawnMax) {
                // draw bullet
                drawMyImage(ct, object.graphics, X, Y, object.angle, scale);

                this.drawn++;
            }

        } else if (object.type == 3) {
            // missle
        } else if (object.type == 4) {
            // particle
            for (var i = 0, j = object.list.length; i < j; i++) {
                var l = object.list[i];
                if (l.c >= 0 && l.c <= 14)
                    drawMyImage(c, object.graphics[l.c], X + l.X, Y + l.Y, 0, scale);
            }
        }



    }
    // also draw other things
    // draw life bar
    // TODO LAST HERE SEEN ACTION
    //if (this.game.showLifeBars >= this.object.type) this.self;
    //}

};
Screen.prototype.renderStarfield = function () {
    var c = null;
    if (sim.oneCanvas) {
        c = this.context;
    } else {
        c = this.ctx[0];
    }


	c.fillStyle = "white";
    var scale = this.scale / 10;
    for (var ie = 0, je = this.starfield.length; ie < je; ++ie) {
        var img = this.starfield[ie].starImage;
        var p = this.starfield[ie].parralax;
        var w = (this.X * p) * scale % this.width;
        var h = (this.Y * p) * scale % this.height;
        for (var i = 0, j = this.starfield[ie].stars.length; i < j; ++i) {
            var s = this.starfield[ie].stars[i];
            //this.context.drawImage(img, (this.width + s.X - w) % this.width, (this.height + s.Y - h) % this.height);
            var ex = (this.width + (s.X - w)) % this.width;
            var ey = (this.height + (s.Y - h)) % this.height;
            if (this.starsImage) drawMyImage(c, img, ex, ey , 0, s.r * scale);
            else {
                c.beginPath();

                c.arc(ex, ey, s.r * 5 * scale, 0, sim.PI2, false);
                
                c.fill();
                c.closePath();
            }

        }
    }
};
Screen.prototype.renderLifeBar = function(o) {
    if (o.life > 0) {
        var c = null;
        if (sim.oneCanvas) {
            c = this.context;
        } else {
            c = this.ctx[4];
        }
        var scale = this.scale / 10;
        var X = (o.X - this.X) * scale + this.width / 2 - (this.width / 2) * scale;
        var Y = (o.Y - this.Y) * scale + this.height / 2 - (this.height / 2) * scale;
        c.beginPath();
        c.lineWidth = 2;
        c.strokeStyle = "red";
        c.rect(X - o.radius * scale, Y - 10 - o.radius * scale, (o.life / o.lifeMax * o.radius * 2) * scale, 5);
        //this.context.fillStyle = "red";
        c.stroke();
        //this.context.fill();
        c.closePath();
    }
};
Screen.prototype.renderTextAtRow = function(text, row, co, opacity) {
    co = typeof co !== 'undefined' ? co : 0;
    opacity = typeof opacity !== 'undefined' ? opacity : 1;
    var c = null;
    if (sim.oneCanvas) {
        c = this.context;
    } else {
        c = this.ctx[4];
    }
    // TEXT AT ONE OF THE CONSOLES
    //this.context.save();
    c.globalAlpha = opacity;
    c.fillStyle = "white";
    c.font = "20px Console";
    if (co < 2)
        c.textAlign = "left";
    else
        c.textAlign = "right";
    c.textBaseline = "top";
    if (co < 1)
        c.fillText(text, 10, this.height - 30 * row);
    else if (co == 1)
        c.fillText(text, 10, 10 + 30 * row);
    else if (co == 2)
        c.fillText(text, this.width - 10, 10 + 30 * row);
    else
        c.fillText(text, this.width - 10, this.height - 40 - 30 * row);
    c.globalAlpha = 1;
    //this.context.restore();
}
Screen.prototype.renderHUD = function() {
    // DRAW HUD
    var b = this.game.player.ship.battery, bm = this.game.player.ship.batteryMax;
    var l = this.game.player.ship.life, lm = this.game.player.ship.lifeMax;
    var s = this.game.player.ship.velocity, sm = this.game.player.ship.velocityMax;
    var energy = Math.max(0, Math.min(b, bm)) / bm * 100;
    var life = Math.max(0, Math.min(l, lm))  / lm * 100;
    // TODO repait one s for sm
    var speed = Math.max(0, Math.min(s, sm))  / sm * 100;
    var c = null;
    if (sim.oneCanvas) {
        c = this.context;
    } else {
        c = this.ctx[4];
    }


    var back = "white";
    var backLine = 6;
    var line = 2;
    var frontLineCol = "black";
    var lifeColor = "green";
    var energyColor = "purple";
    var speedColor = "yellow";


    // HEALTH
//    c.beginPath();
//    c.lineWidth = backLine;
//    c.strokeStyle = back;
//    c.rect(10, 10, 100, 20);
//    c.fillStyle = back;
//    c.fill();
//    c.stroke();
//    c.closePath();

    if (life > 0) {
        c.beginPath();
        c.lineWidth = line;
        c.strokeStyle = lifeColor;
        c.rect(10, 10, life, 20);
        //c.fillStyle = lifeColor;
        //c.fill();
        c.stroke();
        c.closePath();
    }

    // ENERGY
//    c.beginPath();
//    c.lineWidth = backLine;
//    c.strokeStyle = back;
//    c.rect(10, 40, 100, 20);
//    c.fillStyle = back;
//    c.fill();
//    c.stroke();
//    c.closePath();

    if (energy > 0) {
        c.beginPath();
        c.lineWidth = line;
        c.strokeStyle = energyColor;
        c.rect(10, 40, energy, 20);
        //c.fillStyle = energyColor;
        //c.fill();
        c.stroke();

        //this.context.fillStyle = "black";
        //this.context.font = "10px Console";
        //this.context.textAlign = "left";
        //this.context.textBaseline = "top";
        //this.context.fillText("Energy: " + Math.ceil(energy) + "%", 12, 42);
        //this.context.fillStyle = "white";
        //this.context.fillText("Energy: " + Math.ceil(energy) + "%", 13, 43);

        c.closePath();
    }

    // SPEED
//    c.beginPath();
//    c.lineWidth = backLine;
//    c.strokeStyle = back;
//    c.rect(10, 70, 100, 20);
//    c.fillStyle = back;
//    c.fill();
//    c.stroke();
//    c.closePath();

    if (speed > 0) {
        c.beginPath();
        c.lineWidth = line;
        c.strokeStyle = speedColor;
        c.rect(10, 70, speed, 20);
        //c.fillStyle = speedColor;
        //c.fill();
        c.stroke();
        c.closePath();
    }



};




function Game() {}
Game.prototype.init = function () {
    //this.world = new World();
    //this.world.create(canvas.width, canvas.height);

    // LOAD ASSETS
    //this.spritesLibrary = new SpriteLibrary();

    // EVENT COUNTDOWN
    this.time = [];
    this.time.second = 0;
    //this.time.milisecond = 0;


    // create physics engine
    this.physics = new Physics();
    this.physics.init();



    // CREATE SCREEN
    this.screen = new Screen();
    this.screen.game = this;
    this.screen.init();


    // CREATE LEVEL
    this.level = new Level();
    this.level.init();
    this.level.world = this.world;
    this.level.physics = this.physics;


    // CREATE PLAYER
    if (sim.singleplayer) {
        this.player = new Player();
        var pShip = new Ship();
        pShip.initCater();
        this.physics.createBody(pShip);
        this.player.init(pShip);

        this.players = [];
        this.players.push(this.player);

        this.level.objects.push(this.player.ship);

        // set camera mode
        this.screen.cameraFollow = this.player.ship;
        this.screen.cameraMode = 4;

    }



    this.wait = false;





    // show objects LIFE BARS  0 - no, 1 - only basic (enemy), 2 - all ships, 3 - all objects, 4 - ?
    this.showLifeBars = 1;

    // show HUD
    this.renderHUD = true;

    // set up and
    // show consoles
    this.co = new ConsoleDev();
    this.co.init();

    // wait for all assets to load
    //while (!imgLibrary.done) {}

    // hide loading screen
    loadingScreen.destroy();
    this.screen.activate();
    loadingScreen = null;



    this.doOnlyOnce = true;
    this.doOnlyTwice = false;
};
Game.prototype.initServer = function () {
    // EVENT COUNTDOWN
    this.time = [];
    this.time.second = 0;


    // create physics engine
    this.physics = new Physics();
    this.physics.init();


    // CREATE PLAYERS?
//    this.player = new Player();
//    var pShip = new Ship();
//    pShip.initCater();
//    this.physics.createBody(pShip);
//    this.player.init(pShip);
    this.players = [];


    // CREATE LEVEL
    this.level = new Level();
    this.level.init();
    this.level.world = this.world;
    this.level.physics = this.physics;
    // add player ship to the level
//    this.level.objects.push(this.player.ship);


    // set up and
    // show consoles
    this.co = new ConsoleDev();
    this.co.init();
}
Game.prototype.addPlayer = function (id, shipId) {
    // CREATE PLAYER
    var player = new Player(id);
    var ship = new Ship(shipId);
    ship.init();
    ship.X = Math.random() * this.level.X_MAX;
    ship.Y = Math.random() * this.level.Y_MAX;
    player.init(ship);
    this.physics.createBody(ship);
    this.players.push(player);
    this.level.objects.push(ship);
    if (sim.debug) console.log('Player added...');
    this.co.initNewMessage('Player ' + id + ' connected.');
    return player;
};
Game.prototype.addPlayerShip = function (id, shipId) {
    // CREATE PLAYER SHIP
    // find player with ID
    var ide = id, idr = null, pl = this.players;
    for (var ii = -1, lenn = pl.length; ++ii < lenn;) {
        if (pl[ii].id == ide) {
            idr = ii;
            break;
        }
    }
    if (idr != null) {
        var player = pl[idr];
        var ship = new Ship(shipId);
        ship.init();
        player.init(ship);
        ship.X = Math.random() * this.level.X_MAX;
        ship.Y = Math.random() * this.level.Y_MAX;
        this.physics.createBody(ship);
        this.level.objects.push(ship);
        if (sim.debug) console.log('Ship added...');
        player.score--;
        this.co.initNewMessage('Player ' + id + ' was destroyed. Score: ' + player.score);
        return player;
    } else {
        return null;
    }
};
Game.prototype.createDebris = function () {
    for (var i = 0, j = 10; i < j; ++i) {
        var p = new Debris();
        p.init(Math.random() * 200, Math.random() * sim.PI2);
        p.X = Math.random() * this.level.X_MAX;
        p.Y = Math.random() * this.level.Y_MAX;

        this.physics.createBody(p);

        if (sim.server)
            sim.call.callback_("createobject", { o: p });
        else if(sim.singleplayer) this.level.objects.push(p);
    }
};
Game.prototype.removePlayer = function (id) {
    // REMOVE PLAYER
    // find player ID
    var p = this.players, match = null;
    for (var i = -1, len = p.length; ++i < len;) {
        if (p[i].id == id) {
            // found
            match = i;
            break;
        }
    }
    if (match) {
        var l = p[match];
        l.remove();
        l = null;
        p.splice(match, 1);
        this.co.initNewMessage('Player ' + id + ' disconnected.');
        return true;
    } else {
        return false;
    }
};
Game.prototype.update = function (modifier) {
    // UPDATE INTERNAL TIMER
    this.time.second += modifier;
//    if (this.time.milisecond >= 1000) {
//        this.time.second++;
//        this.time.milisecond -= 1000;
//    }



    // update creation of projectiles
    // actually done that in level

    // TODO delete this or move, its change camera mode
//    if (67 in inpLibrary.keysDown) {
//        this.screen.cameraMode++;
//        if (this.screen.cameraMode > 9) this.screen.cameraMode = 0;
//
//        this.co.initNewMessage("Camera changed to: " + this.screen.cameraMode);
//        delete inpLibrary.keysDown[67];
//        //this.wait = true;
//        //var cameraWait = setInterval(function () { game.wait = false; clearInterval(cameraWait); }, 300);
//
//    }

    // and add random shit on screen
    if (sim.singleplayer) {
        if (90 in inpLibrary.keysDown) {
            for (var i = 0, j = 100; i < j; ++i) {
                var p = new Debris()
                p.init(Math.random() * 200, Math.random() * PI2);
                p.X = Math.random() * this.level.X_MAX;
                p.Y = Math.random() * this.level.Y_MAX;

                this.physics.createBody(p);


                this.level.objects.push(p);
            }
            this.co.initNewMessage("Objects spawned at spawn.");
            delete inpLibrary.keysDown[90];
        }
    }
    if (78 in inpLibrary.keysDown) {
        renderS = !renderS;

        this.co.initNewMessage("Rendering box2d: " + renderS);
        delete inpLibrary.keysDown[78];
    }
    if (188 in inpLibrary.keysDown) {
        showDebugScreen = !showDebugScreen;

        this.co.initNewMessage("Debug screen: " + showDebugScreen);
        delete inpLibrary.keysDown[188];
    }
    if (190 in inpLibrary.keysDown) {
        this.screen.starsImage = !this.screen.starsImage;

        this.co.initNewMessage("Rendering stars with image: " + this.screen.starsImage);
        delete inpLibrary.keysDown[190];
    }
//    if (66 in inpLibrary.keysDown) {// toggle noob mode
//        this.co.initNewMessage("Slowing assist: " + !this.player.ship.oldTorque);
//    }
//    if (72 in inpLibrary.keysDown) {// toggle noob mode
//        this.co.initNewMessage("Turn assist: " + !this.player.ship.turnAssist);
//    }
    if (222 in inpLibrary.keysDown) {
        this.co.initNewMessage("Switched fps limiting");
        delete inpLibrary.keysDown[222];
        switchConstantFPS();
    }
    // scaling on keypad - +
    if (109 in inpLibrary.keysDown) {
        var s = this.screen.scale;
        if (s <= 10 && s > 1) {
            this.screen.scale -= 1;
            this.screen.centerCamera = true;
            this.co.initNewMessage("Zoom: " + this.screen.scale);
        }
        delete inpLibrary.keysDown[109];
    }
    if (107 in inpLibrary.keysDown) {
        var s = this.screen.scale;
        if (s < 10 && s >= 1) {
            this.screen.scale += 1;
            this.screen.centerCamera = true;
            this.co.initNewMessage("Zoom: " + this.screen.scale);
        }
        delete inpLibrary.keysDown[107];
    }

    // 80 - P, turn skew on and off
    if (80 in inpLibrary.keysDown) {
        sim.useSkew = !sim.useSkew;
        delete inpLibrary.keysDown[80];
    }


    // check if ship is out of energy, then deactivate auto stop and auto turn
    if (sim.singleplayer)
    if (this.doOnlyOnce && this.player.ship.batteryOnCooldown) {
        this.co.initNewMessage("Battery on cooldown!");
        this.player.ship.oldTorque = false;
        this.player.ship.turnAssist = false;
        this.doOnlyOnce = false;
        this.doOnlyTwice = true;
    } else if (this.doOnlyTwice && !this.player.ship.batteryOnCooldown) {
        this.co.initNewMessage("Battery ready!");
        this.doOnlyOnce = true;
        this.doOnlyTwice = false;
    }


    // update players
    if (!sim.server)
        this.player.updateMy(modifier);
    // TODO: ADD FOR MANY PLAYERS
    for (var i=0,j=this.players.length;i<j;++i)
        this.players[i].update(modifier);


    // update level and its elements
    this.level.update(modifier, this.time);



    // update camera (following)
    if (!sim.server)
        this.screen.update(modifier);


//    if (this.player.ship.destroyed) {
//        var pShip = new Ship();
//        pShip.initCater();
//        this.physics.createBody(pShip);
//        this.player.init(pShip);
//
//        this.level.objects.push(this.player.ship);
//
//        // set camera mode
//        this.screen.cameraFollow = this.player.ship;
//    }


    //this.world.update(modifier);
};
Game.prototype.render = function() {
    //this.world.render(context);
    if (sim.renderS) this.screen.render();
    else this.physics.draw();
};
Game.prototype.destroy = function() {

};



function waitingFunc() {
    if (imgLibrary.done) {
        if (sim.debug) console.log("waiting done");
        clearInterval(waitingInte);
        delete waitingInte;
        game.init();

        // INIT FPS LIMITATION METHOD
        switchConstantFPS();
        sim.call.callback_('gamestarted', { id: 'aa' });
    }
    if (!imgLibrary.done)
        if (sim.debug) console.log("Images not loaded!");
}



// change between using requestAnimationFrame and full fps
function switchConstantFPS() {
    if (sim.debug) console.log("changing stableFPS");
    if (sim.scFPS) {
        sim.scFPS = false;
        sim.interMain = setInterval(function(){
            sim.main();
        }, 1);
    } else {
        sim.scFPS = true;
        clearInterval(sim.interMain);
        mainLoop();
    }
}



// MAIN LOOP at constant framerate
function mainLoop() {
    if (sim.scFPS) {
        requestAnimFrame(mainLoop, window);
        //window.requestAnimationFrame(mainLoop, window);
	    sim.main();
    }
}




// Game callbacks for multiplayer
function Callback() {
    this.callbacks = {};
}
Callback.prototype.callback_ = function(event, data) {
    var callback = this.callbacks[event];
    //console.log(callback);
    if (callback) {
        callback(data);
    } else {
        throw "Warning: No callback defined!";
    }
};
Callback.prototype.on = function(event, callback) {
    // Sample usage in a client:
    //
    // game.on('dead', function(data) {
    //   if (data.id == player.id) {
    //     // Darn -- player died!
    //   }
    // });
    this.callbacks[event] = callback;
};







// THE END OF FUNCTIONS DECLARATIONS
// NOW USE THEM
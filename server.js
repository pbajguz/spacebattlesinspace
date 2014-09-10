//var app = require('http').createServer(handler)
//    , io = require('socket.io').listen(app)
//    , fs = require('fs')
//
//app.listen(88);
//
//function handler (req, res) {
//    fs.readFile(__dirname + '/index.html',
//        function (err, data) {
//            if (err) {
//                res.writeHead(500);
//                return res.end('Error loading index.html');
//            }
//
//            res.writeHead(200);
//            res.end(data);
//        });
//}






//var http = require("http"),
//    io = require('socket.io').listen(app),
//    url = require("url"),
//    path = require("path"),
//    fs = require("fs")
//    port = process.argv[2] || 88;
//
//var app = http.createServer(function(request, response) {
//
//    var uri = url.parse(request.url).pathname
//        , filename = path.join(process.cwd(), uri);
//
//    path.exists(filename, function(exists) {
//        if(!exists) {
//            response.writeHead(404, {"Content-Type": "text/plain"});
//            response.write("404 Not Found\n");
//            response.end();
//            return;
//        }
//
//        if (fs.statSync(filename).isDirectory()) filename += '/index.html';
//
//        fs.readFile(filename, "binary", function(err, file) {
//            if(err) {
//                response.writeHead(500, {"Content-Type": "text/plain"});
//                response.write(err + "\n");
//                response.end();
//                return;
//            }
//
//            response.writeHead(200);
//            response.write(file, "binary");
//            response.end();
//        });
//    });
//}).listen(parseInt(port, 10));





// server.js
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);

//io.sockets.on('connection', function (socket) {
//    socket.emit('news', { hello: 'world' });
//    socket.on('my other event', function (data) {
//        console.log(data);
//    });
//});

app.use(express.static(__dirname));

var port = process.env.PORT || 88;
server.listen(port);
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
eval(require('fs').readFileSync('./lib/Box2dWeb-2.1.a.3.min.js', 'utf8'));
eval(require('fs').readFileSync('./game.min.js', 'utf8'));


//
//this.sim = new Simpleton();
//this.sim.init();

sim.initServer();







var loadingScreen = new LoadingScreenDummy();

var imgLibrary = new SpriteLibraryDummy();
var sndLibrary = new SoundLibraryDummy();
var inpLibrary = new Input();
inpLibrary.initServer();


// INITIALIZATION
this.game = new Game();
this.game.initServer();
var g = this.game;

sim.interMain = setInterval(function(){
    sim.main(g);
}, Math.round(1000 / 60));





// function to sync
function sync () {
    var meh = null; // stringifyOnce(g.level.objects, undefined, 4);

    // get level objects
    var ol = [], b;
    p = g.level.objects;
    for (i = -1, len = p.length; ++i < len;) {
        //console.log(p[i]);
        meh = {};
        meh.l = Math.floor(p[i].life);
        meh.i = p[i].id;
        // also body data
        if (p[i].type != 4) {
            b = g.physics.sendBody(p[i].body);
        } else b = 0;
        //console.log(meh);
        ol.push([meh, b]);
    }
    return ol;
}


//io.enable('browser client gzip');



//socket.on('news', function (data) {
//    console.log(data);
//    socket.emit('my other event', { my: 'data' });
//});


// client connected
io.sockets.on('connection', function (socket) {

    // connect with client
    // id is the user ID
    var id = null;

    // client loaded game, now send it some initialization
    socket.on('gamestarted', function (d) {
        if (id) {
            g.removePlayer(id);
            io.sockets.emit('removeplayer', { id: id });
        }

        // create the id
        id = getID(g.players);
        sid = getID(g.level.objects);
        var player = g.addPlayer(id, sid);
        var t = Date.now();
        socket.emit('playerid', { id: id, sid: sid, t: t });
        io.sockets.emit('addplayer', { id: id, sid: sid });
        //io.sockets.emit('message', { message: 'Welcome player ' + id + ' to the server!' });
        //socket.emit('wantgamestate');
    });


    // client requested gamestate, send it to him
    socket.on('sync', function (d) {
        var meh = null; // stringifyOnce(g.level.objects, undefined, 4);

        // get players
        var p = g.players, pl = [];
        for (var i = -1, len = p.length; ++i < len;) {
            //console.log(p[i]);
            //meh =getAllProperties(p[i]);
            //meh = stringifyOnce(p[i], undefined, 4);
            meh = p[i].send();
            //console.log(meh);
            pl.push(meh);
            //pl.push({id: p[i].id, })
        }

        // get level objects
        var ol = [], b;
        p = g.level.objects;
        for (i = -1, len = p.length; ++i < len;) {
            //console.log(p[i]);
            meh = p[i].send();
            // also body data
            if (p[i].type != 4)
                b = g.physics.sendBody(p[i].body);
            else b = 0;
            //console.log(meh);
            ol.push([meh, b]);
        }

        // get physic
//        var wl = [];
//        p = g.physics;
//        for (i = -1, len = p.length; ++i < len;) {
//            console.log(p[i]);
//            meh = getAllProperties(p[i]);
//            //meh = stringifyOnce(p[i], undefined, 4);
//            //meh = p[i].send();
//            console.log(meh);
//            wl.push(meh);
//        }


//        p = g.physics;
//        console.log(p);
//        meh = getAllProperties(p);


        //console.log(meh);
        socket.emit('gamestate', { p: pl, o: ol })
    });


    // client requested quick-sync, send it to him
    socket.on('s', function (d) {
        //socket.emit('s', { o: sync() });
        socket.emit('s', sync() );
    });


    // client changed key press, send that to all clients
    socket.on('key', function(data) {
        //console.log(id);
        io.sockets.emit('key', {id:id, k: data.k, o: data.o});
        // and use it too
        var p = g.players, mid = null;
        // find the culprit
        for (var i = -1, len = p.length; ++i < len;) {
            if (p[i].id == id) {
                mid = i;
                break;
            }
        }
        // apply
        if (mid != null) {
            if (data.o == 1)
                p[mid].keysDown[data.k] = true;
            else
                delete p[mid].keysDown[data.k];
        }
    });

    // got massage from client
    socket.on('message', function (data) {
        console.log(data.message);
    });

    // ping is a date from client, must compare it to what we sended
    socket.on('ping', function (d) {
        //console.log(data.message);
        var ct = d.p;
        var st = d.s;
        var ping = Date.now() - ct;
        var offs = st - ct + ping/2;
        socket.emit('ping2', { p: offs });
    });



    // client disconnected, clean him up
    socket.on('disconnect', function(d) {
        //console.log('recv disconnect', d);
        g.removePlayer(id);
        io.sockets.emit('removeplayer', { id: id });
        //io.sockets.emit('deleteobject', { id: id });

        //g.level.deleteObject(id);
    });



    // cheats
    socket.on('cdestruct', function (d) {
        for (var i = 0, j = g.level.objects.length; i<j; i++) {
            g.level.objects[i].life = -1;
        }
    });
    socket.on('cdebris', function (d) {
        g.createDebris();
        //this.co.initNewMessage("Space cookies spawned.");
    });

});


// update every ship every so often
var updateAll = setInterval(function(){
    io.sockets.emit('wantgamestate');
},30000);


// measure ping
//var syncing = setInterval(function(){
//    io.sockets.emit('ping', { p: Date.now() });
//},1000);


// quick updates to sync
var qsync = setInterval(function(){
    //io.sockets.emit('wantsync');
    //io.sockets.emit('s', { o: sync() });
    io.sockets.emit('s', sync() );
}, 50);





// CALLS FROM GAME
sim.call.on('createnewship', function(d) {
    var playerId = d.id;
    var shipId = getID(g.level.objects);
    g.addPlayerShip(playerId, shipId);

    io.sockets.emit('addplayership', { id: playerId, sid: shipId });



});

// there is a new object, send it to clients
sim.call.on('createobject', function(d) {
    var o = d.o, op;


    o.id = getID(g.level.objects);
    g.level.objects.push(o);
    op = o.send();
    if (o.type != 4)
        b = g.physics.sendBody(o.body);
    else b = 0;

    io.sockets.emit('createobject', {o: op, b: b });
    //io.socket.emit('key', {name: data.id, type: data.type, timeStamp: new Date()});
});


// destroy object
sim.call.on('deleteobject', function(d) {
    //var o = d.o, op;
    g.level.deleteObject(d.id);
    io.sockets.emit('deleteobject', { id: d.id });


//    o.id = getID(g.level.objects);
//    op = o.send();
//    console.log(op);
//    b = g.physics.sendBody(o.body);


    //io.socket.emit('key', {name: data.id, type: data.type, timeStamp: new Date()});
});
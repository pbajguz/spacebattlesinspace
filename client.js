

//STABLE FPS
this.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(/* function */callback, /* DOMElement */element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


// STATS WINDOW
// show framerate in that small box in left upper part of screen
this.stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '10px';
stats.domElement.style.top = '100px';
document.body.appendChild( stats.domElement );


drawMyImage = drawMyImageA;


//// PAUSE GAME WHEN NOT FOCUSED
//window.addEventListener("blur", function(e) {
//    console.log("Lost focus.");
//    sim.focused = false;
//    sndLibrary.mute()
//}, false);
//
//window.addEventListener("focus", function(e) {
//    console.log("Gained focus.");
//    sim.focused = true;
//    sndLibrary.unmute();
//}, false);



// INITIALIZATION VARIABLES
this.loadingScreen = null;
this.imgLibrary = null;
this.sndLibrary = null;
this.inpLibrary = null;
this.game = null;
this.waitingInte = null;



document.addEventListener('DOMContentLoaded', function() {


    // INITIALIZATION
    sim.initClient();

    loadingScreen = new LoadingScreen();

    imgLibrary = new SpriteLibrary();
    sndLibrary = new SoundLibrary();
    inpLibrary = new Input();
    inpLibrary.initClient();

    game = new Game();

    // now wait for assets to load, we need them for game initialization and running
    waitingInte = setInterval(function(){waitingFunc()},1000);






    // establish connection to server
    var socket = io.connect();
    //console.log('before anything' + game.player.id);

    // got player id from server, set it to ours
    socket.on('playerid', function (d) {
        sim.singleplayer = false;
        game.player.id = d.id;
        game.player.ship.id = d.sid;
        game.player.ship.playerId = d.id;
        sim.skew = Date.now() - d.t;
        game.co.initNewMessage('Connected as player ' + d.id + ' Your ship id: ' + d.sid + ' Ping: ' + sim.skew);
        sim.receiving = true;
        socket.emit('sync', {});
    });
    // got new player id, it is ours if we don't have any or a new player
    socket.on('addplayer', function (d) {
        if (sim.receiving) {
            if (d.id != game.player.id) {
                game.addPlayer(d.id, d.sid);
            }
        }
    });
    // got impulse to remove player
    socket.on('removeplayer', function (d) {
        if (sim.receiving) {
            if (d.id != game.player.id) {
                game.removePlayer(d.id);
            }
        }
    });








    // DO WE want gamestate from server?
    socket.on('wantgamestate',function() {
        // ask for gamestate
        if (sim.receiving)
        socket.emit('sync', {});
    });

    // DO WE want quick-sync from server?
    socket.on('wantsync',function() {
        // ask for quick-sync
        if (sim.receiving)
            socket.emit('s', {});
    });


    // got quick-sync from server
    socket.on('s', function(d) {
        // apply quick-sync
        if (sim.receiving) {
            //p = d.o;
            p = d;
            //game.physics.destroyAll();
            for (i = -1, len = p.length; ++i < len;) {

                // find object with ID
                var o = p[i][0], b = p[i][1];
                var ide = o.i, idr = null, pl = game.level.objects;
                for (var ii = -1, lenn = pl.length; ++ii < lenn;) {
                    if (pl[ii].id == ide) {
                        idr = ii;
                        break;
                    }
                }
                var ob = null;
                if (idr == null) {
                    console.log('object ' + o.id + ' from o and b: ' + o + ' ' + b + ' does not exist!');
                } else {
                    // update object
                    ob = pl[idr];
                    ob.life = o.l;
                    //setAllProperties(o, ob);
                    // set body
                    if (ob.type != 4) {
                        game.physics.receiveBody(b, ob.body);
                    }
                    //console.log('Updated id ' + o.i);
                }
            }
            //console.log(game.level.objects);
        }
    });


    // got gamestate from server
    socket.on('gamestate', function (d) {
        //console.log(d);
        if (sim.receiving) {
            console.log(game.player.id);
            console.log(d);
            console.log(game.player.id);

            //var meh = null; // stringifyOnce(g.level.objects, undefined, 4);


            console.log(game.players);
            // get players
            //game.players = [];
            var p = d.p;//, pl = [];
            console.log('got players: ' + (d.p).length);
            for (var i = -1, len = p.length; ++i < len;) {
                // first check if its our ID
                // we don't care if its our

                if (p[i].id != game.player.id) {
                    // find player with ID
                    var ide = p[i].id, idr = null, pl = game.players;
                    for (var ii = -1, lenn = pl.length; ++ii < lenn;) {
                        if (pl[ii].id == ide) {
                            idr = ii;
                            break;
                        }
                    }
                    // create if not exist
                    if (idr == null) {
                        console.log('Player did not exist, created with id: ' + ide);
                        var playa = game.addPlayer(ide);
                        idr = pl.length - 1;
                    }
                    // update player
                    setAllProperties(p[i], pl[idr]);

                }





                //pl[idr].receive()

                //console.log(p[i]);
                //meh =getAllProperties(p[i]);
                //meh = stringifyOnce(p[i], undefined, 4);
                //meh = p[i].send();
                //console.log(meh);
                //pl.push(meh);
                //pl.push({id: p[i].id, })
            }
            console.log(game.players);

            console.log(game.level.objects);
            // get objects
            //game.level.objects = [];

            p = d.o;//, pl = [];
            console.log('got objects: ' + p.length);
            // first delete not needed objects
            var deleteIdArray = [];
            for (i = -1, len = game.level.objects.length; ++i < len;) {
                var idMy = game.level.objects[i].id;
                if (idMy == game.player.ship.id)
                    idMy = null;
                else
                for (ii = -1, lenn = p.length; ++ii < lenn;) {
                    if (idMy == p[ii].id) {
                        //we found the object, no need to delete
                        idMy = null;
                        break;
                    }
                }
                if (idMy != null) {
                    // did not found, delete
                    deleteIdArray.push(idMy);
                }
            }
            for (i = -1, len = deleteIdArray.length; ++i < len;) {
                game.level.deleteObject(game.level.objects[deleteIdArray[i]]);
                console.log('deleted object ' + deleteIdArray[i]);
            }
            game.physics.destroyAll();
            // now do everything else
            for (i = -1, len = p.length; ++i < len;) {

                // find object with ID
                var o = p[i][0], b = p[i][1];
                var ide = o.id, idr = null, pl = game.level.objects;
                for (var ii = -1, lenn = pl.length; ++ii < lenn;) {
                    if (pl[ii].id == ide) {
                        idr = ii;
                        break;
                    }
                }
                // create if not exist TODO: i will be back
                var ob = null;
                if (idr == null) {
                    console.log('creating object ' + o.id + ' from o and b: ' + o + ' ' + b);
                    ob = game.level.receivedObject(o, b);
                    console.log('created object: ' + ob);
                } else {
                    // update object
                    ob = pl[idr];
                    setAllProperties(o, ob);
                    // set body
                    ob.body = null;
                    if (ob.type != 4) {
                        game.physics.createBody(ob);
                        game.physics.receiveBody(b, ob.body);
                    }
                }
                // set pointer for player
                if (ob.hasOwnProperty('playerId')) {
                    console.log('object has playerId, update chain:! ');
                    var playerId = ob.playerId, players = game.players;
                    for (var iii = -1, lennn = players.length; ++iii < lennn;) {
                        if (players[iii].id == playerId) {
                            players[iii].ship = ob;
                            if (game.player.id == ob.playerId)
                            game.screen.cameraFollow = ob;
                            console.log('found player, set object where it belongs, for id: ' + players[iii].id + ' to ship of id: ' + ob.id);
                            break;
                        }
                    }
                }

                //pl[idr].receive()

                //console.log(p[i]);
                //meh =getAllProperties(p[i]);
                //meh = stringifyOnce(p[i], undefined, 4);
                //meh = p[i].send();
                //console.log(meh);
                //pl.push(meh);
                //pl.push({id: p[i].id, })
            }
            console.log(game.level.objects);

            // delete physics and recreate

    //        p = game.level.objects;//, pl = [];
    //        for (i = -1, len = p.length; ++i < len;) {
    //            game.physics.createBody(p[i]);
    //            if ('playerId' in p[i]) {
    //                var ide = p[i].playerId, pl = game.players;
    //                for (var ii = -1, lenn = pl.length; ++ii < lenn;) {
    //                    if (pl[ii].id = ide) {
    //                        pl[ii].ship = p[i];
    //                        break;
    //                    }
    //                }
    //            }
    //        }
    //        console.log(game.physics);



    //        // get level objects
    //        var ol = [];
    //        p = g.level.objects;
    //        for (i = -1, len = p.length; ++i < len;) {
    //            //console.log(p[i]);
    //            //meh = getAllProperties(p[i]);
    //            //meh = stringifyOnce(p[i], undefined, 4);
    //            meh = p[i].send();
    //            console.log(meh);
    //            ol.push(meh);
    //        }





            //game.level.objects = data.o;
            //game.physics = data.w;
            //game.players = data.p;
            //game.console.initNewMessage(data.message);
            //socket.emit('message', { message: 'I am player ' + game.player.id });
            //socket.emit('my other event', { my: 'data' });

        }
    });


    // server sent message, print in in cons
    socket.on('message', function (data) {
        console.log(data.message);
        if (sim.receiving)
            game.co.initNewMessage(data.message);
        //socket.emit('message', { message: 'I am player ' + game.player.id });
        //socket.emit('my other event', { my: 'data' });
    });


    // server sent new ship, add it (maybe its yours?
    socket.on('addplayership', function(d) {
        if (sim.receiving) {
            var playerId = d.id;
            var shipId = d.sid;
            var p = game.addPlayerShip(playerId, shipId);

            //if (playerId == game.player.id)
            //game.player = p;

            game.screen.cameraFollow = game.player.ship;

            //game.level.receivedObject(d.o, d.b);
        }
    });

    // server sent new object, add it
    socket.on('createobject', function(d) {
        if (sim.receiving) {
            game.level.receivedObject(d.o, d.b);
        }
    });


    // server said delete object with id
    socket.on('deleteobject', function(d) {
        if (sim.receiving) {
            game.level.deleteObject(d.id);
        }
    });


    // server pings very often
    socket.on('ping', function(d) {
        if (sim.receiving) {
            socket.emit('ping', { p: Date.now(), s: d.p });
            //sim.skew = Date.now() - d.p;
            //game.co.initNewMessage('Ping: ' + sim.skew);
            console.log(sim.skew);
        }
    });

    // server sent you your offset (skew), add it to your calculation time
    socket.on('ping2', function(d) {
        if (sim.receiving) {
            socket.emit('ping', { p: Date.now(), s: d.p });
            sim.skew = d.p;
            //game.co.initNewMessage('Ping: ' + sim.skew);
            console.log(sim.skew);
        }
    });

    // server sent key press of some player, use it
    socket.on('key', function(data) {
        //check if its not me
        console.log("my id: " + game.player.id + " received id: " + data.id)
        if (game.player.id != data.id) {
            // find the culprit
            var id = data.id, p = game.players, mid = null;
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
        }
    });



    // CALLS FROM GAME
    // game has loaded, send that news to server
    sim.call.on('gamestarted', function(d) {
        socket.emit('gamestarted', {});
    });


    // user pressed/depressed some key, inform the server
    sim.call.on('key', function(d) {
        socket.emit('key', {k: d.k, o: d.o});
        //io.socket.emit('key', {name: data.id, type: data.type, timeStamp: new Date()});
    });

    // cheats
    sim.call.on('cdestruct', function(d) {
        socket.emit('cdestruct', {});
    });
    sim.call.on('cdebris', function(d) {
        socket.emit('cdebris', {});
    });

    //newobject


});
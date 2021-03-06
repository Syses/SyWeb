/**
 * Created by ptmind on 2016/1/11.
 */
var sockjs = require('sockjs');
var session = require('express-session');
var store =  new session.Store();
module.exports = function (httpServer, prefix) {
    var __route = {};
    //var sockServer = sockjs.createServer({sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'});
    //var sockServer = sockjs.createServer({sockjs_url: '/bower_components/sockjs-client/dist/sockjs.js'});
    var sockServer = sockjs.createServer();
    sockServer.on('connection', function (conn) {
        var url_reg=/^(.+)\/(.+)\/(.+)\/(.+)$/;
        url_reg.exec(conn.url);
        var prefix=RegExp.$1;
        var sessionId=RegExp.$3;
        conn.on('data', function (data) {
            var sid= sessionId;
            var msg = JSON.parse(data);
            if (msg.method && __route[msg.method]) {
                __route[msg.method](conn, msg);
            }else{
                conn.write(JSON.stringify({method:'/Error',error:{code:'404',content:'error method'},request:msg}));
            }
            //conn.write(JSON.stringify({path:msg.path,content:msg.content}));
        });
        conn.on('close', function () {

        })
    });
    sockServer.installHandlers(httpServer, {prefix: prefix})
    return {
        on: function (method, callback) {
            __route[method] = callback;
        }
    }
}
#!/bin/env node

var express = require('express');
var logger = require('morgan');
var template = require('pug');
var mongo = require('mongojs');

var MainApp = function() {
	
	var self = this;

	if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
		connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
    		process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
    		process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    		process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    		process.env.OPENSHIFT_APP_NAME;
	} else {
  		connection_string = 'localhost/apartment453';
	}


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };

    self.compileTemplates = function() {
    	self.templates = {};
    	var templateDir = __dirname + '/source/templates/'
    	self.templates['login'] = template.compileFile(templateDir + 'login.pug');
        self.templates['content'] = template.compileFile(templateDir + 'content.pug');
    };

    self.connectDatabase = function() {
    	var db = mongo(connection_string, ['users']);
    	self.users = db.collection('users');
    }

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();
        self.compileTemplates();
        self.connectDatabase();
    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    self.app = express();
    self.app.use(logger('dev'))
    self.app.use(express.static(__dirname + '/static'));

    self.app.get('/', function(req, res, next) {
    	try {
    		var html = self.templates['login']();
    		res.send(html);
    	} catch (e) {
    		next(e);
    	}
    });

    self.app.get('/content', function(req, res, next) {
        try {
            var html = self.templates['content']();
            res.send(html);
        } catch (e) {
            next(e);
        }
    })

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};

var zapp = new MainApp();
zapp.initialize();
zapp.start();



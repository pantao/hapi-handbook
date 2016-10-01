'use strict';

const Hapi = require('hapi');
const Good = require('good');

const server = new Hapi.Server();
server.connection({
	host: 'localhost',
 	port: 3000
 });

server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function(request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.register( require('inert'), (err) => {
    if(err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/hello.html',
        handler: function(request, reply) {
            reply.file('./public/hello.html')
        }
    });
});

server.register({
  register: Good,
  options: {
    reporters: {
      console: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [
            {
              response: '*',
              log: '*'
            }
          ]
        },
        {
          module: 'good-console'
        },
        'stdout'
      ]
    }
  }
}, ( err ) => {
  if ( err ) {
    throw err;
  }

  server.start( (err) => {
      if ( err ) {
          throw err;
      }

      server.log('info', `Server running at: ${server.info.uri}`);
  });
});
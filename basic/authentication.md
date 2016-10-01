# 认证

`hapi` 的认证基于 `schemes` 与 `strategies` 这两个概念。

你可以把 `scheme` 当作是一种基础的认证方式，比如 `basic` 或者 `digest`，而一个 `strategy` 则表示的是一个预配置与命名了的 `scheme`。

首先，我们来看一下下如何使用 `hapi-auth-basic` ：

```javascript
'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');

const server = new Hapi.Server();
server.connection({
	host: 'localhost',
	port: 3000
});

const users = {
	john: {
		username: 'john',
		password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm', // 'secret'
		name: 'John Doe',
		id: '2133d32a'
	}
};

const validate = function ( request, username, password, callback ) {
	const user = users[username];

	if(!user) {
		return callback(null, false);
	}

	Bcrypt.compare(password, user.password, ( err, isValid ) => {
		callback(err, isValid, { id: user.id, name: user.name });
	});
};

server.register( Basic, (err) => {
	if (err) {
		throw err;
	}

	server.auth.strategy('simple', 'basic', {
		validateFunc: validate
	});

	server.route({
		method: 'GET',
		path: '/',
		config: {
			auth: 'simple',
			handler: function( request, reply ) {
				reply('hello, ' + request.auth.credentials.name );
			}
		}
	});

	server.start( (err) => {
		if (err) {
			throw err;
		}

		console.log('server running at: ' + server.info.uri );
	});
});
```

在上面的示例中，我们首先定义了一个 `users` 对象，在本例中，它充当了用户数据库，我们使用对象的原因是方便我们根据用户名去查找到用户，然后我们定义了一个符合 `hapi-auth-basic` 规范的认证函数 `validate`，该函数可以判断出当前的请示是否提供了被认可的认证信息。

下一步，我们注册了该插件，该插件内部会通过 `server.auth.scheme()` 方法注册一个名为 `basic` 的 `scheme`。

当插件注册成功之后，我们就可以使用 `server.auth.strategy()` 方法创建了一个名为 `simple` 的预设，它引用至名为 `basic` 的 `scheme` ，同时我们还传递了一个设置对象作为我们控制 `scheme` 行为的配置。

最后一件事情就是我们在定义 `route` 时确定了某一个路由需要使用名为 `simple` 的预设进行认证。

## Schemes

一个 `scheme` 是一个符合 `function( server, options)`结构的方法， `server` 参数即为需要添加该 `scheme` 的 `server` 的引用，而 `options` 参数则是一个引用自注册 `strategy` 时传递的配置对象。

该方法必须返回一个对象，且该对象必须至少包含一个名为 `authenticate` 的方法，其它可选的方法包括 `payload` 与 `response`。

### authenticate

`authenticate` 是一个具有类似 `function(request, reply)` 结构的方法，且它是一个 `scheme` 必有的一个方法。

在该上下文中，`request` 就是由一个 `server` 创建的 `request`，它与 `router` 的 `handler` 中访问到 `request` 是同一个对象。

`reply` 就是一个标准的 `hapi` `reply` 接口，它接受 `err` 或者 `result` 。

如果 `err` 是一个 非 `null` 值，则表示此次认证失败，而该错误也会被用作响应终端用户的结果而被返回，在 `hapi` 应用中，推荐使用 `boom` 来创建这个错误，它提供了一种简单的方法，用于创建符合 `http` 规范的错误消息体。

`result` 应该是一个对象，但如果 `err` 对象被提供了，则 `result` 对象的所有值都是可选的了。但如果你想因错误而向终端用户提供更多的消息，则 `result` 中必须包含一个名为 `credentials` 的属性，它是一个用于存储当前被用于认证的用户信息。

当一次认证成功，我们必须执行 `reply.continue(result)` ，而 `result` 是一个包含了用于存储当前认证用户信息的 `credentials` 属性。

另外，你还可以在 `result` 中包含一个名为 `artifacts` 的属性，它可以用于存储任何与此次认证相关（但并不属于被认证用户）的信息。

`credentials` 以及 `artifacts` 属性可以在稍后通过 `request.auth` 对象被访问（比如一个路由的 `handler`）。

### payload

`payload` 是一个符合 `function(request, reply)` 结构的方法。

同样的，这里面提供了一个标准的 `hapi` `reply` 接口，若此次请示失败，则可以通过呼叫 `reply(error, result)` 或者 `reply(error)` 来终此程序的执行并向终端用户返回错误（同样推荐使用 `boom` ）。

若认证通过，则只需要简单的执行 `reply.continue()` 即可（不需要任何参数）。

### response

`response` 方法同样符合 `function( request, reply)` 结构，该方法的目的是在响应对象 (`request.response`) 被发送至终端用户之前，用附加的头信息装饰它。

当任何装饰操作结束后，都必须执行 `reply.continue()` 方法，然后响应会立即被发送至终端用户。

当有错误发生时，你同样可以通过 `reply(error)` 响应错误消息。

### 注册

要注册一个 `scheme` ，使用 `server.auth.scheme(name, scheme)` 方法，`name` 是一个字符串，是一个用于标识该 `sheme` 的名称，而 `scheme` 就是上面所描述的对象。

## Strategies

当你创建了一个 `scheme` 之后，你需要有一种方法去使用它，这就是 `strategy` 存在的作用。如上所述， `strategy` 本质上是一个 `scheme` 预置的拷贝。

要注册一个 `strategy` ，我们首先必须先注册一个 `scheme`，之后即可以使用 `server.auth.strategy(name, scheme, [mode], [options])` 来注册一个 `strategy` 。

`name` 参数必须是一个字符串，稍后它将被用于标识该 `strategy` ，而 `scheme` 则不再是 `scheme` 对象本身，只需要是前面定义的 `scheme` 的名称即可。

### Mode

`mode` 是第一个可选的参数，它的值可以是 `true`、`false`、`required`、`optinal` 或者 `try`。默认值为 `false`，它表示 `strategy` 会被注册，但是默认不起任何作用，除非你手工的指定启用它。

它该值被设置为 `true` 或者 `required` 时，表示该 `strategy` 默认会被应用至所有的包含 `auth` 配置项的路由中，这表示，若要访问该路由，则必须通过认证，否则，用户将收到错误消息。

如果 `mode` 被设置为 `optional` ，则表示该 `strategy` 还是默认会被应用至所有的路由中，但是并不是必须通过认证，但若认证的数据被提供了，则该数据就必须通过认证。

最后一个可选设置是 `try`，它与 `optional` 类似，唯一的不同点在于，不管用户是否通过认证，他都可以得到 `handler` 的响应。

### Options

最后一个可选参数 `options` 会被直接传递给 `strategy`。

### 设置一个默认的 `strategy`

如上向述，我们可以使用 `mode` 参数用于通过 `server.auth.strategy()` 方法设定默认应用的 `strategy`，你同样还可以使用 `server.auth.default()` 来做这件事情。

该方法接受的参数可以是一个 `strategy` 名称，或者同样可以是一个在路由的 `config` 中的 `auth` 一样的对象。

> 需要注意的是，任何在 `server.auth.default()` 执行之前定义的路由都将不会应用该配置，若您想所有的路由都应用该配置，则你要么在所有路由定义前执行该方法，要么使用 `server.auth.strategy()` 方法，并将其 `mode` 设置为 `true`。

## 路由配置

认证配置同样可以在路由配置中通过 `config.auth` 参数设置，如果该属性被设置为 `false`，则表示该路由不需要进行任何认证。

该属性同样可以设置为一个 `strategy` 的名称，或者一个包含有 `mode`、`strategies` 或者 `payload` 参数的对象。当 `mode` 被设置为 `required`、`optional` 或者 `try` 时，其作用与注册 `strategy` 时一样。

如果想指定路由的认证为某一个特定的 `strategy` ，则直接使用它的名称即可，但是若要指定多个 `strategy`，那么 `config.auth` 中必须包含一个名为 `strategies` 的属性，且其值为一个包含了多个 `strategy` 名称的数组。然后， `strategies` 会一个一个被执行，直到其中一个认证通过，或者所有的认证都失败。

最后， `payload` 可以被设置为 `false`，表示 `payload` 不需要被认证， `required` 或者 `true` 表示其必须被认证， `optional` 表示其认证是可选的。

> `payload` 参数仅在 `strategy` 的 `scheme` 支持 `payload` 方法时有效。
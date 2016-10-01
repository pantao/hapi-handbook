# 开始使用 Hapi

## 安装 `hapi`

创建一个新的文件夹 `myproject`：

```bash
mkdir myproject
cd myproject
```

> hapi 项目就是从一个最简单的文件夹开始。

接下来，初始化一个 `npm` 包，这会在当前项目目录下面创建一个 `package.json` 文件：

```bash
npm init
```

接着，添加 `hapi` 依赖。

```bash
npm install hapi --save
```

从现在开始，你已经有了一个可以使用 `hapi` 创建应用的所有需要了。

## 创建一个服务器

最基础的服务器看起来像下面这样的：

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.start( (err) => {
	if ( err ) {
		throw err;
	}

	console.log(`Server running at: ${server.info.uri}`);
});
```

首先，我们 `require('hapi')`，然后创建了一个 `Hapi.Server` 对象 `server`，之后，再将 `server` 连接至服务器，传递给它一些如端口，主机名等参数，最后，启动服务器，若产生错误，则直接抛出错误，若没有错误，则打印出当前服务的URI地址。

我们添加 `server` 的 `connection` 时，可以指定主机名，IP地址，端口号甚至是一个 Unix Socket文件，或者 Windows 系统中绑定至服务器的管道。

## 添加路由

现在，让我们添加一到两个真正做一些事情的路由了。

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000 });

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

server.start( (err) => {
	if ( err ) {
		throw err;
	}

	console.log(`Server running at: ${server.info.uri}`);
});
```

保存 `server.js` 文件，然后执行以下命令即可启动服务器：

```bash
node server.js
```

现在，你已经可以从浏览器中访问 [http://localhost:3000](http://localhost:3000) 访问刚才的应用了。
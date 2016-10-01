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

现在，你已经可以从浏览器中访问 [http://localhost:3000](http://localhost:3000) 访问刚才的应用了，这会在浏览器里面看到 **Hello, world!** 的文字。

注意到，我们在第二个路由定义中，使用了 `encodeURIComponent`，这是用于防止内容注入攻击的，永远不要相信用户的输入。

`method` 参数可以是任何一个合法的 `HTTP` 方法名称或者名称集（包含多个名称的数组）， `path` 参数则只能接收可选的参数，它们可以是字符、数字甚至是通配符。

## 创建静态页面以及内容

完成上面的所有工作之后，我们可以再尝试着使用一个名为 `inert` 的插件，它可以为我们服务静态页面，首先执行 `Ctrl + C` 退出当前进程。

首先，我们需要安装 `inert`：

```bash
npm install --save inert
```

安装完成之后，添加以下内容至 `server.js` ：

```javascript
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
```

然后还需要添加文件 `public/hello.html`，内容如下：

```html
<!DOCTYPE html>
<html>
<head>
  <title>
    Hello World
  </title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

再次启动服务器之后访问 [http://localhost:3000/hello.html](http://localhost:3000/hello.html) 即可打开 `hello.html` 文件。

## 使用插件

在任何一个应用中，经常都会用到的一个功能就是日志记录，在 `hapi` 中，我们可以使用 `good` 插件以及 `good-console` 报告插件，我们还需要一些基础的过滤基制，这可以使用 `good-squeeze` ，它提供了一些常用的事件类型以及过滤标签。

让我们先安装这些依赖：

```bash
npm install --save good
npm install --save good-console
npm install --save good-squeeze
```

然后在 `server.js` 文件中修改成以下内容：

```javascript
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
```

然后再次启动服务，你将会看到以下内容：

```bash
161001/101536.904, [log,info] data: Server running at: http://localhost:3000
```

而当你再次访问 [http://localhost:3000](http://localhost:3000) 时，会在终端中看到以下内容：

```bash
161001/101644.719, [response] http://localhost:3000: get / {} 200 (19ms)
```

## 结语

通过以上的学习，你已经可以使用 `hapi` 创建一个最基本的服务器端应用了。本章节的代码可以在 [example](../example) 文件夹到找。
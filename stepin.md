# 快速入门

## 创建一个项目

```bash
mkdir my-project
cd my-project
npm init
```

创建创建一个名为 `my-project` 的文件夹，然后在该文件夹中初始化一个 `npm` 包。然后，添加 `hapi`：

```bash
npm install hapi --save
```

接着创建一个名为 `server.js` 的文件，添加以下内容：

```javascript
'use strict';

const Hapi = require('hapi');

// 指定 host 与 port 创建一个 server
const server = new Hapi.Server();
server.connection({
	host: 'localhost',
	port: 8000
});

// 添加路由
server.route({
	method: 'GET',
	path: '/',
	handler: function(request, reply) {
		return reply('Hello Hapi World!');
	}
});

// 启动服务
server.start( (err) => {
	if ( err ) {
		throw err;
	}

	console.log('Server running at: ', server.info.uri);
});
```

保存 `server.js` 文件之后，执行以下命令即可启动项目：

```bash
npm start
```

启动成功之后，在浏览器中打开 [http://localhost:8000](http://localhost:8000) 即可访问刚才创建的应用。

现在你已经创建了一个新的 `hapi` 应用了，接下来，我们可以学习[更深入的内容](basic)。
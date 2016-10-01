# Cookies

写Web应用， `cookies` 的使用总是很有必要的，在 `hapi` 中使用 `cookies` 是相当灵活、安全简单的。

## 配置 Server

`hapi` 有许多可配置的设置项用于处理 `cookies`，其默认的配置已经足以适用于绝大多数应用场景了，但是我们同样可以在需要的时候修改它们。

要修改这些配置，可以呼叫 `server.state(name, options)` 方法， `name` 就是需要配置的 `cookie` 的名称，`options` 则是用于定义该 `cookie` 配置的对象。

```javascript
server.state('data', {
	ttl: null,
	isSecure: true,
	isHttpOnly: true,
	encoding: 'base64json',
	clearInvalid: false, // remove invalid cookies
	strictHeader: true // don't allow violations of RFC 6265.
})
```

上面这份配置会设置名称为 `data` 的 `cookie` 只存在于当前会话中，浏览器一关闭，它就会被删除，同样的，它被标记为仅对 `HTTP` 请示开放，必须告诉 `hapi` 该 `cookie` 的值为使用 `base64` 编码过的 `JSON` 字符串。

另外，你需要在添加路由时，增加两项配置：

```javascript
{
	config: {
		state: {
			parse: true, // parse and store in request.state
			failAction: 'error' // 还可以是 `ignore` 或者 `log`
		}
	}
}
```

## 设置一个 `cookie`

要设置一个 `cookie` ，可以像下面这样通过 `reply()` 接口实现。

```javascript
reply('Hello').state('data', { firstVisit: false });
```

在上面的示例中， `hapi` 会向客房端发送一个响应，并设置一个名为 `data` 的 `cookie`，同时，该 `cookie` 的值为一个使用 `base64` 编码的 `JSON` 字符串。

### 重写设置

在设置一个 `cookie` 时，你同样还可以通过 `server.state()` 重写默认的设置：

```javascript
reply('Hello').state('data', 'test', { encoding: 'none'} );
```
# nodejs-go
stepping stone towards ES7 async/await
# Examples
```js
const go = require('./go');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function* getA() {
    yield sleep(1000);
    return 1;
}

function* getB() {
    yield sleep(1000);
    return 2;
}

function* sum() {
    console.log('a + b =', (yield getA()) + (yield getB()));
}

go(sum()); // a + b = 3
```

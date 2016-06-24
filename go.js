function isObject(x) {
    return x instanceof Object;
}


function isPromise(x) {
  return isObject(x) && typeof x.then == 'function';
}


function isGenerator(x) {
  return isObject(x) && typeof x.next == 'function' && typeof x.throw == 'function';
}


function *go(generator, callback) {
    let next = yield;
    let stack = [generator];
    let result;

    for (;;) {
        let state = generator.next(result);

        if (isGenerator(state.value)) {
            generator = state.value;

            if (state.done) {
                stack[stack.length - 1] = generator;
            } else {
                stack.push(generator);
            }
        } else {
            if (isPromise(state.value)) {
                let promise = state.value;

                promise.then((result) => {
                    next(result);
                }, (result) => {
                    next(result);
                });

                result = yield;
            } else {
                result = state.value;
            }

            if (state.done) {
                stack.pop();

                if (stack.length == 0) {
                    if (callback != null) {
                        callback(result);
                    }

                    return;
                }

                generator = stack[stack.length - 1];
            }
        }
    }
}


module.exports = function (generator, callback = null) {
    let main = go(generator, callback);
    main.next()
    main.next(main.next.bind(main));
}

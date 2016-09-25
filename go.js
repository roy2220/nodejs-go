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
    let result = [true, null];

    for (;;) {
        let state;

        try {
            if (result[0]) {
                state = generator.next(result[1]);
            } else {
                state = generator.throw(result[1]);
            }
        } catch (error) {
            result = [false, error];
            stack.pop();

            if (stack.length == 0) {
                if (callback != null) {
                    callback(result[0], result[1]);
                }

                return;
            } else {
                generator = stack[stack.length - 1];
            }

            continue;
        }

        if (isGenerator(state.value)) {
            generator = state.value;

            if (state.done) {
                stack[stack.length - 1] = generator;
            } else {
                stack.push(generator);
            }

            result = [true, null];
        } else {
            if (isPromise(state.value)) {
                let promise = state.value;
                let ok;

                promise.then((value) => {
                    ok = true;
                    next(value);
                }, (error) => {
                    ok = false;
                    next(error);
                })

                let value_or_error = yield;
                result = [ok, value_or_error]
            } else {
                result = [true, state.value];
            }

            if (state.done) {
                stack.pop();

                if (stack.length == 0) {
                    if (callback != null) {
                        callback(result[0], result[1]);
                    }

                    return;
                } else {
                    generator = stack[stack.length - 1];
                }
            }
        }
    }
}


module.exports = function (generator, callback = null) {
    let main = go(generator, callback);
    main.next()
    main.next(main.next.bind(main));
}

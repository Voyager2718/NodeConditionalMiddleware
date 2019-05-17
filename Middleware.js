let Middleware = function () {
    this.cache = [];
    this.argument = {};
    this.finalFunction = undefined;
    this.exceptFunction = undefined;

    let isDict = (value) => {
        return typeof value === 'object' && value !== null && !(value instanceof Array) && !(value instanceof Date);
    }

    this.use = function (fn, layerId) {
        if (typeof fn !== 'function') {
            console.error('need a function');
            return false;
        }
        if (layerId !== undefined) {
            for (let i = 0; i < this.cache.length; i++) {
                if (isDict(this.cache[i]) && this.cache[i].layerId === layerId) {
                    this.cache[i].fns.push(fn);
                    return this;
                }
            }

            this.cache.push({
                layerId: layerId,
                fns: [fn]
            });
            return this;
        } else {
            this.cache.push(fn);
        }
        return this;
    }

    this.next = function (argument) {
        if (this.midwares && isDict(this.midwares[0]) && this.midwares[0].fns.length > 0) {
            let ware = this.midwares[0].fns.shift();
            if (this.midwares[0].fns.length === 0) {
                this.midwares.shift();
            }
            ware.call(this, argument, this.next.bind(this), this.skip.bind(this), this.final.bind(this), this.except.bind(this));
        } else
            if (this.midwares && this.midwares.length > 0) {
                let o = this.midwares.shift();
                let ware;
                if (isDict(o)) {
                    ware = o.fns.shift();
                } else {
                    ware = o;
                }
                ware.call(this, argument, this.next.bind(this), this.skip.bind(this), this.final.bind(this), this.except.bind(this));
            } else if (typeof this.finalFunction === 'function') {
                this.finalFunction.call(this, argument);
            }
    }

    this.skip = function (argument) {
        if (this.midwares && isDict(this.midwares[0]) && this.midwares[0].fns.length > 0) {
            this.midwares.shift();
        }
        this.next.call(this, argument);
    }

    this.final = function (argument) {
        if (this.finalFunction) {
            this.finalFunction.call(this, argument);
        }
    }

    this.except = function (argument) {
        if (this.exceptFunction) {
            this.exceptFunction.call(this, argument);
        }
    }

    this.handle = function (argument, finalFunction, exceptFunction) {
        if (typeof finalFunction === 'function') {
            this.finalFunction = finalFunction;
        }
        if (typeof exceptFunction === 'function') {
            this.exceptFunction = exceptFunction;
        }
        this.midwares = this.cache.map(function (o) {
            return o;
        });
        this.next(argument);
    }

    this.setFinal = function (fn) {
        if (typeof fn !== 'function') {
            console.error('need a function');
            return false;
        }
        this.finalFunction = fn;
        return this;
    }
}

let m = new Middleware();

m
    .use((args, next) => {
        setTimeout(() => {
            console.log('HERE-A');
            next();
        }, 1000)
    })
    .use((args, next, skip, final, except) => {
        setTimeout(() => {
            console.log('HERE-0');
            next();
        }, 1000)
    }, 'layer0')
    .use((args, next, skip, final, except) => {
        setTimeout(() => {
            console.log('HERE-1');
            skip();
        }, 1000)
    }, 'layer0')
    .use((args, next, skip, final, except) => {
        setTimeout(() => {
            console.log('HERE-2');
            next();
        }, 1000)
    }, 'layer0')
    .use((args, next, skip, final, except) => {
        setTimeout(() => {
            console.log('HERE-B');
            next();
        }, 1000)
    });


m.handle();

function augment(w, withFn, depth) {
    var name, fn;
    for (name in w) {
        fn = w[name];
        //console.log("depth : " + depth);
        if (((typeof fn === 'function') || (typeof fn === 'object')) && name !== 'augment' && name !== 'console' && fn !== null && depth < 5) {
           // console.log("Monitor function : " + name + " " );
            depth = depth + 1;
            augment(fn,withFn, depth);
            depth = depth - 1;
            if (typeof w[name] === 'function') 
                w[name] = (function(name, fn) {
                    var args = arguments;
                    return function() {
                        withFn.apply(this, args);
                        return fn.apply(this, arguments);

                    }
                })(name, fn);
        }
    }
}

augment(window.ga, function(name, fn) {
console.trace();
}, 1);







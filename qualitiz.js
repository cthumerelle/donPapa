var Collector = require("./collectors/Collector").default;

export default class qualitiz{

    static compare(elem,type,pattern){
        switch(type){
            case 'MUST_MATCH':
                return elem.match(Collector.strToRegex(pattern));
                break;
            case 'MUST_NOT_MATCH':
                return ! elem.match(Collector.strToRegex(pattern));
                break;
            case 'CONTAINS':
                return elem.indexOf(pattern) !== -1;
                break;
            case 'DOES_NOT_CONTAINS':
                return elem.indexOf(pattern) == -1;
                break;
            case 'MUST_BE_EXACTLY':
                return elem == pattern;
                break;
            case 'DIFFERENT_FROM':
                return elem != pattern;
                break;
            case 'INF':
                return elem < pattern;
                break;
            case 'INF_EQUAL':
                return elem <= pattern;
                break;
            case 'SUP':
                return elem > pattern;
                break;
            case 'SUP_EQUAL':
                return elem >= pattern;
                break;
            case 'IN':
                var table = pattern.split('||').map(trim);
                for (var i=0;i<table.length;i++){
                    if (table[i] == elem)
                        return true;
                }
                return false;
                break;
        }
        return false;
    }

    static validate(parameters,collected){
        if( typeof parameters.collector == 'undefined')
            return false;
        parameters.collector = collected[parameters.collector];
        return this.compare(parameters.collector,parameters.type,parameters.pattern);
    }

    static extend(obj, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) obj[key] = src[key];
        }
        return obj;
    }

    static getCollectorValue(text, collected){
        return text.replace(/%(.+)%/, function(x){
            if(typeof collected[x] != 'undefined')
                return collected[x];
            return x;
        });
    }
    static getUrlParameters(query) {
        let result = {};
        query.split("&").forEach(function(part) {
            if(!part) return;
            part = part.split("+").join(" "); // replace every + with space, regexp-free version
            let eq = part.indexOf("=");
            let key = eq>-1 ? part.substr(0,eq) : part;
            let val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
            let from = key.indexOf("[");
            if(from==-1) result[decodeURIComponent(key)] = val;
            else {
                let to = key.indexOf("]",from);
                let index = decodeURIComponent(key.substring(from+1,to));
                key = decodeURIComponent(key.substring(0,from));
                if(!result[key]) result[key] = [];
                if(!index) result[key].push(val);
                else result[key][index] = val;
            }
        });
        return result;
    }

}
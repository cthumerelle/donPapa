var Collector = require("./Collector").default;

export default class UrlRegexCollector extends Collector{
    static process(params){
        var re = this.strToRegex(params.pattern);
        if(document.location.href){
            var match = document.location.href.match(re);
            return match ? match[1] : null ;
        }
    }

}
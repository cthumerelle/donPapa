var Collector = require("./Collector").default;
export default class UrlParameterCollector extends Collector{
    static process(params){
        if(document.location.search){
            var match = document.location.search.match('[?&]'+params.parameter+'=([^&$]+)');
            return match ? match[1] : null ;
        }
    }
}
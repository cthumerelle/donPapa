var Collector = require("./Collector").default;

export default class RegexCssSelectorCollector extends Collector{
    static process(params){
        var elem = document.querySelector(params.selector);
        if (!elem)
            return null;
        if(params.attribute){
            return elem.getAttribute(params.attribute);
        } else {
            return elem.innerHTML;
        }
    }
}
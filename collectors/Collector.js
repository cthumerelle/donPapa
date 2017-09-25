export default class Collector {
    static strToRegex(str){
        var delim = str.substring(0,1);
        var last = str.lastIndexOf(delim);
        var pattern = str.substring(1,last);
        var modifier = str.substring(last+1,str.length);
        var expReg = new RegExp(pattern,modifier);
        return expReg;
    }
}
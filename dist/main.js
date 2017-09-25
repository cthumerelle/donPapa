/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
class Collector {
    static strToRegex(str){
        var delim = str.substring(0,1);
        var last = str.lastIndexOf(delim);
        var pattern = str.substring(1,last);
        var modifier = str.substring(last+1,str.length);
        var expReg = new RegExp(pattern,modifier);
        return expReg;
    }
}
/* harmony export (immutable) */ __webpack_exports__["default"] = Collector;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var collectorTypes = {};

collectorTypes["RegexCssSelectorCollector"] = __webpack_require__(2).default;
collectorTypes["CssSelectorCollector"] = __webpack_require__(3).default;
collectorTypes["UrlRegexCollector"] = __webpack_require__(4).default;
collectorTypes["UrlParameterCollector"] = __webpack_require__(5).default;

var qualitiz = __webpack_require__(6).default;
var config = __webpack_require__(7).default;
var params = {
    dataLayer: "TAGCOMMANDER",
    dataLayerVar: "tc_vars"
}
window.onload = onLoad;

function onLoad() {
    var out = {}; // the output of all this shit
    var collected = {}; // this will contain all the collected collectors on the page
    var collectors = config.collectors;
// resources is supposed to contains  all page resources
    var resources = window.performance.getEntriesByType("resource");

//getting global collectors first
    for (let i = 0; i < collectors.length; i++) {
        let collector = collectors[i];
        if (typeof collector.context == 'undefined') {
            //this collector is global, let's compute it
            let value = collectorTypes[collector.collectorType].process(collector.parameters);
            collected[collector.name] = value;
        }
    }

    console.log(collected);

// Context detection
// reordering contexts
    var contexts = config.contexts.sort(function (a, b) {
        if (a.order < b.order) {
            return -1;
        }
        return 1;
    });
    for (let i = 0; i < contexts.length; i++) {
        let context = contexts[i];
        for (let j = 0; j < context.rules.length; j++) {
            let rule = context.rules[j];
            if (rule.class == "CollectorRule") {
                if (qualitiz.validate(rule.parameters, collected)) {
                    var pageContext = context;
                    console.log(context);
                }
            }
        }
    }
    if (typeof pageContext == 'undefined') {
        var pageContext = {
            id: false,
            name: 'undefined',
            rules: []
        }
    }

// Now we have the context, get all collectors
    for (i = 0; i < collectors.length; i++) {
        let collector = collectors[i];
        if (typeof collector.context != 'undefined') {
            for (let i = 0; i < collector.contexts.length; i++) {
                if (collector.contexts[i].id == pageContext.id) {
                    let value = collectorTypes[collector.collectorType].process(collector.parameters);
                    collected[collector.name] = value;
                }
            }
        }
    }


// get the dataLayer

    var qDataLayer = {};
    switch (params.dataLayer) {
        case 'TAGCOMMANDER':
            qDataLayer = window[params.dataLayerVar];
            break;
        case 'GTM':
            var dl = window[params.dataLayerVar];
            for (let event in dl) {
                qDataLayer = qualitiz.extend(qDataLayer, dl[event]);
            }
            break;
    }
    if (typeof qDataLayer == 'undefined')
        qDataLayer = {};
    out.dataLayer = qDataLayer;

// Is there resources corresponding to tagDefinitions ?
    var detectedTags = {};
    for (let i = 0; i < resources.length; i++) {
        let resource = resources[i];
        resource.URL = document.createElement('a');
        resource.URL.href = resource.name;
        resource.params = qualitiz.getUrlParameters(resource.URL.search.substr(1));
        console.log("resource :");
        console.log(resource);
        for (let code in tagDefinitions) {
            let tagDefinition = tagDefinitions[code];
            if (resource.name.match(Collector.strToRegex(tagDefinition.pattern))){
                //test if resource_parameters are found
                if(true){

                }
                detectedTags[tagDefinition.code] = {
                    tag: tagDefinition,
                    resource: resource
                }
            }
        }
    }
    console.log('detected tags : ');
    console.log(detectedTags);

// great, now let's check the rules

    var tagDefinitions = {};
    for (var i = 0; i < config.tag_definitions.length; i++) {
        var tag = config.tag_definitions[i];
        tagDefinitions[tag.code] = tag;
    }

    console.log(tagDefinitions);

    out.rules = {};
    for (let i = 0; i < config.rules.length; i++) {
        let rule = config.rules[i];
        if (typeof rule.contexts == 'undefined') {
            out.rules[rule.id] = checkRule(rule, qDataLayer, resources, tagDefinitions);
        } else {
            for (let j = 0; j < rule.contexts.length; j++) {
                if (rule.contexts[j] == pageContext.id) {
                    out.rules[rule.id] = checkRule(rule, qDataLayer, resources, tagDefinitions);
                }
            }
        }
    }

    console.log(out);
}


function checkRule(rule, qDataLayer, resources, tagDefinitions) {
    let out = {};
    let stillOK = true;
    if (rule.type == "data_layer") {
        //checking dataLayer rules
        if (typeof rule.parameters != 'undefined') {
            out.parameters = {};
            for (let i = 0; i < rule.parameters.length; i++) {
                let param = rule.parameters[i];
                if (typeof qDataLayer[param.parameter] == 'undefined') {
                    // tag parameter is missing
                    stillOK = false;
                    out.parameters[param.id] = {
                        message: "MISSING PARAMETER"
                    }
                } else {
                    let pattern = qualitiz.getCollectorValue(param.pattern, collected);
                    if (!qualitiz.compare(qDataLayer[param.parameter], param.type, pattern)) {
                        // malformed parameter
                        out.parameters[param.id] = {
                            message: "MALFORMED PARAMETER",
                            expected: pattern,
                            received: qDataLayer[param.parameter]
                        }
                        stillOK = false;
                    } else {
                        out.parameters[param.id] = {
                            message: "OK",
                            expected: pattern,
                            received: qDataLayer[param.parameter]
                        }
                        // tag parameter is OK
                    }
                }
            }
        }
    } else {
        //checking tag rules
        for (let i = 0; i < resources.length; i++) {
            let resource = resources[i];
            resource.URL = document.createElement('a');
            resource.URL.href = resource.name;
            resource.params = qualitiz.getUrlParameters(resource.URL.search.substr(1));
            for (let code in tagDefinitions) {
                let tagDefinition = tagDefinitions[code];
                if (tagDefinition){}
            }
        }
    }
    out.valid = stillOK;
    return out;
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var Collector = __webpack_require__(0).default;

class RegexCssSelectorCollector extends Collector{
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
/* harmony export (immutable) */ __webpack_exports__["default"] = RegexCssSelectorCollector;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var Collector = __webpack_require__(0).default;

class CssSelectorCollector extends Collector{
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
/* harmony export (immutable) */ __webpack_exports__["default"] = CssSelectorCollector;


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var Collector = __webpack_require__(0).default;

class UrlRegexCollector extends Collector{
    static process(params){
        var re = this.strToRegex(params.pattern);
        if(document.location.href){
            var match = document.location.href.match(re);
            return match ? match[1] : null ;
        }
    }

}
/* harmony export (immutable) */ __webpack_exports__["default"] = UrlRegexCollector;


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var Collector = __webpack_require__(0).default;
class UrlParameterCollector extends Collector{
    static process(params){
        if(document.location.search){
            var match = document.location.search.match('[?&]'+params.parameter+'=([^&$]+)');
            return match ? match[1] : null ;
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["default"] = UrlParameterCollector;


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var Collector = __webpack_require__(0).default;

class qualitiz{

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
/* harmony export (immutable) */ __webpack_exports__["default"] = qualitiz;


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var config = "{\"contexts\":[{\"id\":1,\"order\":0,\"name\":\"Home\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/\",\"rules\":[{\"id\":1,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/https:\\\\\\/\\\\\\/www.leroymerlin.fr\\\\\\/$\\/\"}}]},{\"id\":2,\"order\":1,\"name\":\"Product\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/produits\\/lame-en-composite-a-emboiter-brun-l-150-x-h-25-cm-x-ep-20-mm-e1401397186\",\"rules\":[{\"id\":2,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/v3\\\\\\/p\\\\\\/produits\\\\\\/[a-zA-Z0-9-]+-e[0-9]+$\\/\"}}]},{\"id\":3,\"order\":3,\"name\":\"Univers\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/produits\\/terrasse-jardin-l1308216920\",\"rules\":[{\"id\":3,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/v3\\\\\\/p\\\\\\/produits\\\\\\/[a-zA-Z0-9-]+-l[0-9]+$\\/\"}}]},{\"id\":4,\"order\":4,\"name\":\"Sous univers\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/produits\\/terrasse-jardin\\/salon-de-jardin-table-et-chaise-l1308217007\",\"rules\":[{\"id\":4,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/v3\\\\\\/p\\\\\\/produits\\\\\\/[a-zA-Z0-9-]+\\\\\\/[a-zA-Z0-9-]+-l[0-9]+$\\/\"}}]},{\"id\":5,\"order\":5,\"name\":\"Famille\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/produits\\/terrasse-jardin\\/salon-de-jardin-table-et-chaise\\/salon-de-jardin-l1308217777\",\"rules\":[{\"id\":5,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/v3\\\\\\/p\\\\\\/produits\\\\\\/[a-zA-Z0-9-]+\\\\\\/[a-zA-Z0-9-]+\\\\\\/[a-zA-Z0-9-]+-l[0-9]+$\\/\"}}]},{\"id\":6,\"order\":6,\"name\":\"Sous famille\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/produits\\/materiaux-menuiserie\\/fenetre-porte-d-entree-porte-de-garage-et-store-banne\\/store-et-volet-pour-velux\\/volet-roulant-pour-fenetre-de-toit-l1308218430\",\"rules\":[{\"id\":6,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/v3\\\\\\/p\\\\\\/produits\\\\\\/[a-zA-Z0-9-]+\\\\\\/[a-zA-Z0-9-]+\\\\\\/[a-zA-Z0-9-]+\\\\\\/[a-zA-Z0-9-]+-l[0-9]+$\\/\"}}]},{\"id\":7,\"order\":7,\"name\":\"Store locator\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/magasins-l1308220543\",\"rules\":[{\"id\":7,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/v3\\\\\\/p\\\\\\/magasins-l1308220543\\/\"}}]},{\"id\":8,\"order\":8,\"name\":\"Home campus\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/campus\\/campus-l1500448992\",\"rules\":[{\"id\":8,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/v3\\\\\\/p\\\\\\/campus\\\\\\/campus-l1500448992\\/\"}}]},{\"id\":29,\"order\":9,\"name\":\"Les cours en ligne\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/campus\\/cours-de-bricolage-en-ligne-l1500452300\",\"rules\":[{\"id\":13,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/l1500452300\\/\"}}]},{\"id\":30,\"order\":10,\"name\":\"Les dossiers m\\u00e9tiers\\u00e9\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/campus\\/dossiers-metier-l1500452310\",\"rules\":[{\"id\":14,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/l1500452310\\/\"}}]},{\"id\":31,\"order\":11,\"name\":\"Les cours en magasin\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/services\\/cours-de-bricolage-l1308222751\",\"rules\":[{\"id\":15,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/l1308222751\\/\"}}]},{\"id\":32,\"order\":12,\"name\":\"Cours en magasin\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/services\\/cours-de-bricolage\\/poser-un-carrelage-de-sol-1h30-2h-e1500003590\",\"rules\":[{\"id\":16,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/services\\\\\\/cours-de-bricolage\\\\\\/.+e[0-9]+\\/\"}}]},{\"id\":33,\"order\":13,\"name\":\"Les bonnes affaires\",\"url_example\":\"https:\\/\\/www.leroymerlin.fr\\/v3\\/p\\/bonnes-affaires-l1400638142\",\"rules\":[{\"id\":17,\"class\":\"CollectorRule\",\"parameters\":{\"collector\":\"URL complete\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/l1400638142\\/\"}}]}],\"tag_definitions\":[{\"code\":\"TAGCOMMANDER\",\"type\":\"resource_url\",\"method\":\"match\",\"pattern\":\"\\/(\\\\\\/tc\\\\_[0-9a-zA-Z]*\\\\_[0-9]*\\\\.js|\\\\\\/tc\\\\_[0-9a-zA-Z]*\\\\_[0-9]*\\\\_[a-zA-Z]*\\\\.js|\\\\\\/tc_[0-9a-zA-Z_]*\\\\._[a-zA-Z0-9_]*\\\\.js)\\/\"},{\"code\":\"GOOGLE_UNIVERSAL_ANALYTICS\",\"type\":\"resource_url\",\"method\":\"match\",\"pattern\":\"\\/(?:google-analytics\\\\.com|stats\\\\.g\\\\.doubleclick\\\\.net)(?:\\\\\\/r)?\\\\\\/collect\\/\",\"parameters\":{\"t\":\"\\/pageview\\/\",\"tid\":\"\\/UA-[0-9]+-[0-9]+\\/\",\"cid\":\"\\/[0-9]+\\\\.[0-9]+.\\/\",\"pr1pr\":\"\\/[0-9]+\\/\"}},{\"code\":\"XITI\",\"type\":\"resource_url\",\"method\":\"match\",\"pattern\":\"\\/^http(s)?:\\\\\\/\\\\\\/((.*)\\\\.|)xiti\\\\.com\\\\\\/\\/\",\"parameters\":{\"t\":\"\\/event\\/\",\"ec\":\"\",\"ea\":\"\",\"el\":\"\",\"ev\":\"\\/[0-9]+\\/\"}},{\"code\":\"GAU_EVENT\",\"type\":\"resource_url\",\"method\":\"match\",\"pattern\":\"\\/(?:google-analytics\\\\.com|stats\\\\.g\\\\.doubleclick\\\\.net)(?:\\\\\\/r)?\\\\\\/collect\\/\"}],\"collectors\":[{\"name\":\"meta-title\",\"description\":\"La balise Meta Title est la balise titre qui orne le haut d\'une page Internet, elle est essentielle et fondamentale pour un article quel que soit le sujet.\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"title\"}},{\"name\":\"og:type\",\"description\":\"OG TYPE\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"attribute\":\"content\",\"selector\":\"meta[property=\\\"og:type\\\"]\"}},{\"name\":\"og:image\",\"description\":\"\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"meta[property=\\\"og:image\\\"]\",\"attribute\":\"content\"}},{\"name\":\"og:site_name\",\"description\":\"Nom du site\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"meta[property=\\\"og:site_name\\\"]\",\"attribute\":\"content\"},\"contexts\":[1]},{\"name\":\"reflm\",\"description\":\"\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"attribute\":\"data-reflm\",\"selector\":\"#global-reflm\"},\"contexts\":[2]},{\"name\":\"URL complete\",\"description\":\"URL de la page en cours (format http:\\/\\/www.domain.com\\/dir\\/page.html?param=value)\",\"collectorType\":\"UrlRegexCollector\",\"parameters\":{\"pattern\":\"\\/(.*)\\/\"}},{\"name\":\"Produit\",\"description\":\"Nom produit (fiche produit)\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"h1.title-page\"},\"contexts\":[2]},{\"name\":\"univers.name\",\"description\":\"Nom de l\'univers\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"h1.title\"},\"contexts\":[3]},{\"name\":\"sous-univers.nom\",\"description\":\"Nom du sous-univers\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"h1.title\"},\"contexts\":[4]},{\"name\":\"sous-univers.univers\",\"description\":\"Nom de l\'univers\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"ul.list-fil-ariane li:nth-child(3) a\"},\"contexts\":[4]},{\"name\":\"famille.univers\",\"description\":\"Nom de l\'univers\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"ul.breadcrumb li:nth-child(2) a i\"},\"contexts\":[5]},{\"name\":\"famille.sous-univers\",\"description\":\"Nom du sous-univers\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"ul.breadcrumb li:nth-child(3) a i\"},\"contexts\":[5]},{\"name\":\"famille.nom\",\"description\":\"Nom de la famille\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"h1.title-page\"},\"contexts\":[5]},{\"name\":\"produit.sous-univers\",\"description\":\"Nom du sous-univers\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\".breadcrumb li:nth-child(3) a i\"},\"contexts\":[2]},{\"name\":\"Nb avis produit\",\"description\":\"Nombre d\'avis produit (fiche produit)\",\"collectorType\":\"CssSelectorCollector\",\"parameters\":{\"selector\":\".header-reviews .nombre-avis\",\"search_pattern\":\"\\/(?:.|\\\\n)+\\\\(([0-9]+)\\\\)(?:.|\\\\n)+\\/\",\"replacement_pattern\":\"$1\",\"strip_tags\":\"false\"},\"contexts\":[2]},{\"name\":\"Score produit\",\"description\":\"Score BV de la fiche produit\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\".showcase-product .reviews-synthesis-score strong\"},\"contexts\":[2]},{\"name\":\"Nb produits\",\"description\":\"Nombre de produits propos\\u00e9s\",\"collectorType\":\"CssSelectorCollector\",\"parameters\":{\"selector\":\"[data-cerberus=ELEM_titreResultatRechercheOngletProduits]\",\"search_pattern\":\"\\/(?:.|\\\\n)+\\\\(([0-9]+)\\\\)(?:.|\\\\n)+\\/\",\"replacement_pattern\":\"$1\",\"strip_tags\":\"false\"},\"contexts\":[5,6]},{\"name\":\"og:locale\",\"description\":\"Open Graph est un ensemble de balises qui permet \\u00e0 un webmaster de donner aux principaux r\\u00e9seaux sociaux des informations pr\\u00e9cises sur ses pages.\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"meta[property=\\\"og:locale\\\"]\",\"attribute\":\"content\"}},{\"name\":\"URI\",\"description\":\"Get the URI par of the URL (\\/v3\\/p\\/blabla.html)\",\"collectorType\":\"UrlRegexCollector\",\"parameters\":{\"pattern\":\"\\/www.leroy-merlin.com\\\\\\/(.*)\\/\"}},{\"name\":\"produit.univers\",\"description\":\"Nom de l\'univers\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\".breadcrumb li:nth-child(2) a i\"},\"contexts\":[2]},{\"name\":\"produit.famille\",\"description\":\"Nom de la famille\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\".breadcrumb li:nth-child(4) a i\"},\"contexts\":[2]},{\"name\":\"Prix Produit - Produit\",\"description\":\"Prix du produit\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\".decli-prix-principal p.price strong\"},\"contexts\":[2]},{\"name\":\"produit.sous-famille\",\"description\":\"Nom de la sous-famille (fiche produit) - attention si pas de sous famille : nom du produit\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\".breadcrumb li:nth-child(5) a i\"},\"contexts\":[2]},{\"name\":\"collector_test\",\"description\":\"\",\"collectorType\":\"RegexCssSelectorCollector\",\"parameters\":{\"selector\":\"a.logo-marque img\",\"attribute\":\"src\"},\"contexts\":[2]},{\"name\":\"Jerome Calais\",\"description\":\"Jerome\'s main carac\",\"collectorType\":\"CssSelectorCollector\",\"parameters\":{\"selector\":\"#nav-fullscreen-layer\",\"search_pattern\":\"\\/^(.*)$\\/\",\"replacement_pattern\":\"p\'tite bite\",\"strip_tags\":\"false\",\"attribute\":\"data-cerberus\"}}],\"rules\":[{\"id\":2,\"type\":\"data_layer\",\"code\":\"TAGCOMMANDER\",\"blacklisted\":false,\"parameters\":[{\"id\":6,\"parameter\":\"env_type_page\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"fiche produit\"},{\"id\":7,\"parameter\":\"page_cat1_label\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%produit.univers%\"},{\"id\":8,\"parameter\":\"page_name\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%reflm% - %Produit%\"},{\"id\":23,\"parameter\":\"page_cat2_label\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%produit.sous-univers%\"},{\"id\":24,\"parameter\":\"page_cat3_label\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%produit.famille%\"},{\"id\":39,\"parameter\":\"page_cat4_label\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%produit.sous-famille%\"}],\"contexts\":[2]},{\"id\":3,\"type\":\"data_layer\",\"code\":\"TAGCOMMANDER\",\"blacklisted\":false,\"parameters\":[{\"id\":3,\"parameter\":\"env_work\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"prod\"},{\"id\":4,\"parameter\":\"env_type_contenu\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/.+\\/\"},{\"id\":5,\"parameter\":\"env_type_page\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/.+\\/\"}]},{\"id\":7,\"type\":\"data_layer\",\"code\":\"TAGCOMMANDER\",\"blacklisted\":false,\"parameters\":[{\"id\":10,\"parameter\":\"env_type_page\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"univers\"},{\"id\":11,\"parameter\":\"page_cat1_label\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%univers.name%\"}],\"contexts\":[3]},{\"id\":8,\"type\":\"data_layer\",\"code\":\"TAGCOMMANDER\",\"blacklisted\":false,\"parameters\":[{\"id\":12,\"parameter\":\"env_type_page\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"sous-univers\"},{\"id\":13,\"parameter\":\"page_cat1_label\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%sous-univers.univers%\"},{\"id\":14,\"parameter\":\"page_cat2_label\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%sous-univers.nom%\"}],\"contexts\":[4,3]},{\"id\":10,\"type\":\"data_layer\",\"code\":\"TAGCOMMANDER\",\"blacklisted\":false,\"parameters\":[{\"id\":16,\"parameter\":\"env_type_page\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"famille\"},{\"id\":17,\"parameter\":\"page_cat1_label\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%famille.univers%\"},{\"id\":18,\"parameter\":\"page_cat2_label\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%famille.sous-univers%\"},{\"id\":19,\"parameter\":\"page_cat3_label\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%famille.nom%\"}],\"contexts\":[5]},{\"id\":11,\"type\":\"data_layer\",\"code\":\"TAGCOMMANDER\",\"blacklisted\":false,\"parameters\":[{\"id\":20,\"parameter\":\"env_type_contenu\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"home\"},{\"id\":21,\"parameter\":\"env_type_page\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"homepage\"},{\"id\":22,\"parameter\":\"page_name\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/homepage_.+\\/\"}],\"contexts\":[1]},{\"id\":12,\"type\":\"tag\",\"code\":\"XITI\",\"blacklisted\":true},{\"id\":15,\"type\":\"tag\",\"code\":\"GOOGLE_UNIVERSAL_ANALYTICS\",\"blacklisted\":false,\"parameters\":[{\"id\":27,\"parameter\":\"tid\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"UA-67199779-1\"},{\"id\":33,\"parameter\":\"t\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"pageview\"},{\"id\":34,\"parameter\":\"cd5\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"d\"},{\"id\":35,\"parameter\":\"cd62\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%datalayer.env_type_page%\"},{\"id\":36,\"parameter\":\"cd15\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%datalayer.env_type_contenu%\"}]},{\"id\":17,\"type\":\"tag\",\"code\":\"GOOGLE_UNIVERSAL_ANALYTICS\",\"blacklisted\":false,\"parameters\":[{\"id\":38,\"parameter\":\"pr1pr\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%Prix Produit - Produit%\"}],\"contexts\":[2]},{\"id\":20,\"type\":\"tag\",\"code\":\"GAU_EVENT\",\"blacklisted\":false,\"parameters\":[{\"id\":40,\"parameter\":\"ec\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"Ajout panier\"},{\"id\":41,\"parameter\":\"el\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"fiche produit\"},{\"id\":43,\"parameter\":\"ea\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%reflm%\"},{\"id\":44,\"parameter\":\"ev\",\"type\":\"MUST_MATCH\",\"pattern\":\"\\/[0-9]+\\/\"},{\"id\":45,\"parameter\":\"pa\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"add\"},{\"id\":46,\"parameter\":\"pr1id\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%reflm%\"},{\"id\":47,\"parameter\":\"cd33\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"fiche produit\"}],\"contexts\":[2]},{\"id\":21,\"type\":\"data_layer\",\"code\":\"TAGCOMMANDER_EVENT\",\"blacklisted\":false,\"parameters\":[{\"id\":48,\"parameter\":\"id\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"addToCart\"},{\"id\":49,\"parameter\":\"product_id\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%reflm%\"},{\"id\":50,\"parameter\":\"product_unitprice_ati\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"%datalayer.product_unitprice_ati%\"},{\"id\":51,\"parameter\":\"type_ajout\",\"type\":\"MUST_BE_EXACTLY\",\"pattern\":\"fiche produit\"}]},{\"id\":22,\"type\":\"tag\",\"code\":\"360YIELD\",\"blacklisted\":true}]}";
config = JSON.parse(config);
console.log(config);
/* harmony default export */ __webpack_exports__["default"] = (config);


/***/ })
/******/ ]);
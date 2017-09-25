var collectorTypes = {};

collectorTypes["RegexCssSelectorCollector"] = require('./collectors/RegexCssSelectorCollector').default;
collectorTypes["CssSelectorCollector"] = require('./collectors/CssSelectorCollector').default;
collectorTypes["UrlRegexCollector"] = require('./collectors/UrlRegexCollector').default;
collectorTypes["UrlParameterCollector"] = require('./collectors/UrlParameterCollector').default;

var qualitiz = require('./qualitiz').default;
var config = require('./config').default;
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

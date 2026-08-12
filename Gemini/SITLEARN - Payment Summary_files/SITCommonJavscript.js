function getAccessToken(noRetry) {
    var accessToken = "";
    if (localStorage["token_active_time"]
        && new Date().getTime() + 60000 >= localStorage["token_active_time"]
        || !localStorage["token_active_time"] || !localStorage["token_sitlearn"]) {
        try {
            var url = amazonUrl;
            url += "requestname=GetCRMAccessToken";
            var req = new XMLHttpRequest();
            req.open("POST", url, false);
            req.setRequestHeader("x-api-key", apikey);
            req.send(null);
            if (req.status === 204 || req.status === 200 || req.readyState === 4) {
                accessToken = JSON.parse(req.responseText);
                if (accessToken) {
                    localStorage["token_sitlearn"] = accessToken;
                    localStorage["token_active_time"] = getActiveTime(accessToken);
                }
            }
        }
        catch (e) {
            if (!noRetry) {
                accessToken = getAccessToken(true);
            }
        }
    } else {
        accessToken = localStorage["token_sitlearn"];
    }
    return accessToken;
}
function getActiveTime(token) {
    var time = 0;
    if (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        jsonPayload = JSON.parse(jsonPayload);
        time = jsonPayload.exp * 1000;
    }
    return time;
}
function getClientUrl() {
    return clientUrl;
}

//commented on 10th Aug 2023 VAPT Issue fix
//function webApiRetrieve(dataSetUri, async, token) {
//    var results = [];
//    try {
//        var clientUri = getClientUrl();
//        var uri = clientUri + "/api/data/v9.0/" + dataSetUri;
//        var req = new XMLHttpRequest();
//        req.open("GET", uri, async);
//        req.setRequestHeader("Content-type", "application/json; charset=utf-8");
//        req.setRequestHeader("OData-MaxVersion", "4.0");
//        req.setRequestHeader("OData-Version", "4.0");
//        req.setRequestHeader("Accept", "application/json");
//        req.setRequestHeader("Authorization", "Bearer " + token);
//        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
//        if (async) {
//            req.onreadystatechange = function () {
//                if (this.readyState === 4 /* complete */) {
//                    req.onreadystatechange = null;
//                    if (this.status === 200) {
//                        results = JSON.parse(this.response);
//                        if (results != null && results != undefined && results.value != undefined) {
//                            results = results.value;
//                        }
//                    }
//                    else {
//                        //throw new Error("Error : " +
//                        //this.status + ": " +
//                        //this.statusText + ": " +
//                        //JSON.parse(this.responseText).error.message);
//                    }
//                }
//            };
//            req.send();
//        }
//        else {
//            req.send();
//            if (req.status === 200) {
//                results = JSON.parse(req.response);
//                if (results != null && results != undefined && results.value != undefined) {
//                    results = results.value;
//                }
//            }
//            else {
//                //throw new Error("Error : " +
//                //        req.status + ": " +
//                //        req.statusText + ": " +
//                //        JSON.parse(req.responseText).error.message);
//            }
//        }
//    }
//    catch (e) {
//        alert("Enter error = " + uri.length + ":" + dataSetUri);
//    }
//    return results;
//}

async function webApiRetrieve(dataSetUri, async, token) {
    var results = [];
    try {
        var url = "/_api/" + dataSetUri;
        var results = await portalWebApiRetrieveData(url);
        if (results != null && results != undefined && results.value != undefined) {
            results = results.value;
        }
    }
    catch (e) {
        alert("Enter error = " + uri.length + ":" + dataSetUri);
    }
    return results;
}

async function getFetchXmlResult(entitySet, fetchXml, token) {

    var result = [];
    if (fetchXml.length > 4000) {//URI length exceeds
        result = batchResult(entitySet, fetchXml, token);
        //alert(fetchXml.length);
    }
    else {
        var encodedFetchXml = encodeURIComponent(fetchXml);
        var entitySetUri = "/_api/" + entitySet + "?fetchXml=" + encodedFetchXml;
        response = await portalWebApiRetrieveData(entitySetUri);
    }
    return response.results;
}

//commented on 12th Aug 2023 VAPT Issue fix
//function batchResult(entitySet, fetchXml, token) {
//    var results = [];
//    try {
//        var clientUri = getClientUrl();
//        var req = new XMLHttpRequest();
//        req.open("POST", clientUri + "/api/data/v9.0/$batch", false);
//        req.setRequestHeader("OData-MaxVersion", "4.0");
//        req.setRequestHeader("OData-Version", "4.0");
//        req.setRequestHeader("Accept", "application/json");
//        req.setRequestHeader("Content-Type", "multipart/mixed;boundary=batch_fetch");

//        var body = "--batch_fetch\n"
//        body += "Content-Type: application/http\n"
//        body += "Content-Transfer-Encoding: binary\n"
//        body += "\n"
//        body += "GET " + clientUri + "/api/data/v9.0/" + entitySet + "?fetchXml=" + fetchXml + " HTTP/1.1\n"
//        body += "Content-Type: application/json\n"
//        body += "OData-Version: 4.0\n"
//        body += "OData-MaxVersion: 4.0\n"
//        body += "\n"
//        body += "--batch_fetch--"

//        req.send(body);
//        if (req.status === 200) {
//            results = JSON.parse(req.response.substring(req.response.indexOf('{'), req.response.lastIndexOf('}') + 1));
//            if (results != null && results != undefined && results.value != undefined) {
//                results = results.value;
//            }
//        }
//        else {
//            //throw new Error("Error : " +
//            //        req.status + ": " +
//            //        req.statusText + ": " +
//            //        JSON.parse(req.responseText).error.message);
//        }
//    }
//    catch (e) {
//        //alert(e.message);
//    }
//    return results;
//}

async function batchResult(entitySet, fetchXml, token) {
    var results = [];
    try {
        var url = "/_api/$batch";

        var body = "--batch_fetch\n"
        body += "Content-Type: application/http\n"
        body += "Content-Transfer-Encoding: binary\n"
        body += "\n"
        body += "GET " + clientUri + "/api/data/v9.0/" + entitySet + "?fetchXml=" + fetchXml + " HTTP/1.1\n"
        body += "Content-Type: application/json\n"
        body += "OData-Version: 4.0\n"
        body += "OData-MaxVersion: 4.0\n"
        body += "\n"
        body += "--batch_fetch--";

        var response = await portalWebApiRetrieveData(body);
        if (response.status === 200) {
            response1 = response.results.response.substring(response.results.response.indexOf('{'), response.results.response.lastIndexOf('}') + 1);
            if (response1 != null && response1 != undefined && response1.value != undefined) {
                response1 = response1.value;
            }
        }
        else {

        }
        
    }
    catch (e) {
        //alert(e.message);
    }
    return results;
}


//commented on 10th Aug 2023 VAPT Issue fix
//function webApiCreate(entityAttributes, entityName, async, token) {
//    try {
//        var recordID = null;
//        var clientUri = getClientUrl();
//        var uri = clientUri + "/api/data/v9.0/" + entityName;
//        var req = new XMLHttpRequest();
//        req.open("POST", uri, async);
//        req.setRequestHeader("OData-MaxVersion", "4.0");
//        req.setRequestHeader("OData-Version", "4.0");
//        req.setRequestHeader("Accept", "application/json");
//        req.setRequestHeader("Authorization", "Bearer " + token);
//        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
//        if (async) {
//            req.onreadystatechange = function () {
//                if (this.readyState === 4 /* complete */) {
//                    req.onreadystatechange = null;
//                    if (this.status === 204) {
//                        var recordUri = this.getResponseHeader("OData-EntityId");
//                        var regExp = /\(([^)]+)\)/;
//                        var matches = regExp.exec(recordUri);
//                        //var matches = recordUri.split(/[()]/);
//                        recordID = matches[1];
//                    }
//                    else {
//                    }
//                }
//            };
//            req.send(JSON.stringify(entityAttributes));
//        }
//        else {
//            req.send(JSON.stringify(entityAttributes));
//            if (req.status === 204) {
//                var recordUri = req.getResponseHeader("OData-EntityId");
//                var regExp = /\(([^)]+)\)/;
//                var matches = regExp.exec(recordUri);
//                //var matches = recordUri.split(/[()]/);
//                recordID = matches[1];
//            }
//            else {
//                //alert(req.responseText);
//            }
//        }
//    }
//    catch (e) {
//        //alert(e.message);
//    }
//    return recordID;
//}

async function webApiCreate(entityAttributes, entityName, fields, async, token) {
    try {
        var recordID = null;
        //var url = "/_api/" + entityName; //commented 10th Jan 2024 VAPT Issue fix
        var url = "/_api/" + entityName +"?$select="+fields; //Added on 10th Jan 2024 VAPT Issue fix
        var response = await portalWebApiCreateData(url, JSON.stringify(entityAttributes));
        if (response.status === 204) {
            var recordUri = this.getResponseHeader("OData-EntityId");
            var regExp = /\(([^)]+)\)/;
            var matches = regExp.exec(recordUri);
            //var matches = recordUri.split(/[()]/);
            recordID = matches[1];
        }
        else {
        }
    }
    catch (e) {
        //alert(e.message);
    }
    return recordID;
}

//commented on 10th Aug 2023 VAPT Issue fix
//function webApiUpdate(entityAttributes, entityId, entityName, async, token) {
//    try {
//        var callBackStatus = "";
//        var clientUri = getClientUrl();
//        var uri = clientUri + "/api/data/v8.2/" + entityName + "(" + entityId + ")";
//        var req = new XMLHttpRequest();
//        req.open("PATCH", uri, async);
//        req.setRequestHeader("OData-MaxVersion", "4.0");
//        req.setRequestHeader("OData-Version", "4.0");
//        req.setRequestHeader("Accept", "application/json");
//        req.setRequestHeader("Authorization", "Bearer " + token);
//        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
//        req.setRequestHeader("If-Match", "*");
//        if (async) {
//            req.onreadystatechange = function () {
//                if (this.readyState === 4 /* complete */) {
//                    req.onreadystatechange = null;
//                    if (this.status === 204) {
//                        callBackStatus = "Success";
//                    }
//                    else {
//                        callBackStatus = "Failed";
//                        //throw new Error("Error : " +
//                        //this.status + ": " +
//                        //this.statusText + ": " +
//                        //JSON.parse(this.responseText).error.message);
//                    }
//                }
//            };
//            req.send(JSON.stringify(entityAttributes));
//        }
//        else {
//            req.send(JSON.stringify(entityAttributes));
//            if (req.status === 204) {
//                //callBackStatus = "Success";
//            }
//            else {
//                callBackStatus = "Failed";
//            }
//        }
//    }
//    catch (e) {
//        //alert(e.message);
//    }
//    return callBackStatus;
//}

async function webApiUpdate(entityAttributes, entityId, entityName, async, token) {
    try {
        var callBackStatus = "";
        var url = "/_api/" + entityName + "(" + entityId + ")";
        var response = await portalWebApiUpdateData(url, JSON.stringify(entityAttributes));
        if (response.status === 204) {
            callBackStatus = "Success";
        }
        else {
            callBackStatus = "Failed";
            //throw new Error("Error : " +
            //this.status + ": " +
            //this.statusText + ": " +
            //JSON.parse(this.responseText).error.message);
        }
    }
    catch (e) {
        //alert(e.message);
    }
    return callBackStatus;
}

//commented on 10th Aug 2023 VAPT Issue fix
//function associateRequest(sourceEntity, sourceId, destinationEntity, destinationId, relationShipName, token) {
//    try {
//        var clientUri = getClientUrl();
//        var associate = {
//            "@odata.id": clientUri + "/api/data/v9.0/" + destinationEntity + "(" + destinationId + ")"
//        };
//        var req = new XMLHttpRequest();
//        req.open("POST", clientUri + "/api/data/v9.0/" + sourceEntity + "(" + sourceId + ")/" + relationShipName + "/$ref", false);
//        req.setRequestHeader("Accept", "application/json");
//        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
//        req.setRequestHeader("OData-MaxVersion", "4.0");
//        req.setRequestHeader("OData-Version", "4.0");
//        req.setRequestHeader("Authorization", "Bearer " + token);
//        req.onreadystatechange = function () {
//            if (this.readyState == 4 /* complete */) {
//                req.onreadystatechange = null;
//                if (this.status === 204 || this.status === 1223) {
//                    //alert('Record Associated');
//                } else {
//                    //var error = JSON.parse(this.response).error;
//                    //alert(error);
//                    //alert(error.message);
//                    //alert(this.responseText);
//                }
//            }
//        };
//        req.send(JSON.stringify(associate));
//    }
//    catch (e) {

//    }
//}

async function associateRequest(sourceEntity, sourceId, destinationEntity, destinationId, relationShipName, token) {
    try {
        var clientUri = getClientUrl();
        var associate = {
            "@odata.id": "/_api/" + destinationEntity + "(" + destinationId + ")"
        };
        var url = "/_api/" + sourceEntity + "(" + sourceId + ")/" + relationShipName + "/$ref";
        var response = await portalWebApiCreateData(url, JSON.stringify(associate));
        if (response.status === 204 || response.status === 1223) {
            //alert('Record Associated');
        }
        else {
            //var error = JSON.parse(this.response).error;
            //alert(error);
            //alert(error.message);
            //alert(this.responseText);
        }
    }
    catch (e) {

    }
}

//commented on 10th AUg 2023 VAPT Issue fix
//function disassociateRequest(sourceEntity, sourceId, destinationEntity, destinationId, relationShipName, token) {
//    try {
//        var clientUri = getClientUrl();
//        var req = new XMLHttpRequest();
//        req.open("DELETE", clientUri + "/api/data/v8.0/" + sourceEntity + "(" + sourceId + ")/" + relationShipName + "/$ref?$id=" + clientUri + "/api/data/v8.0/" + destinationEntity + "(" + destinationId + ")", true);
//        req.setRequestHeader("Accept", "application/json");
//        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
//        req.setRequestHeader("OData-MaxVersion", "4.0");
//        req.setRequestHeader("OData-Version", "4.0");
//        req.setRequestHeader("Authorization", "Bearer " + token);
//        req.onreadystatechange = function () {
//            if (this.readyState == 4 /* complete */) {
//                req.onreadystatechange = null;
//                if (this.status == 204) {
//                    //alert('Record Disassociated');
//                } else {
//                    //var error = JSON.parse(this.response).error;
//                    //alert(error.message);
//                }
//            }
//        };
//        req.send();
//    }
//    catch (e) {

//    }
//}


async function disassociateRequest(sourceEntity, sourceId, destinationEntity, destinationId, relationShipName, token) {
    try {
        var url = "/_api/" + sourceEntity + "(" + sourceId + ")/" + relationShipName + "/$ref?$id=" + clientUri + "/api/data/v8.0/" + destinationEntity + "(" + destinationId + ")";
        var response = await portalWebApiDeleteData(url);
        if (response.status == 204) {
            //alert('Record Disassociated');
        } else {
            //var error = JSON.parse(this.response).error;
            //alert(error.message);
        }

    }
    catch (e) {

    }
}

function htmlEncode(value) {
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}
String.prototype.format = String.prototype.f = function () {
    var e = arguments;
    return !!this && this.replace(/\{(\d+)\}/g, function (t, n) {
        return e[n] ? e[n] : t;
    });
}

//commented on 10th Aug 2023 VAPT Issue fix
//function httpRequestPatch(data, url, dtd, callback, noRetry) {
//    var results = "Failed";
//    var req = new XMLHttpRequest();
//    var accessToken = getAccessToken();
//    req.open("PATCH", url, dtd ? true : false);
//    req.setRequestHeader("OData-MaxVersion", "4.0");
//    req.setRequestHeader("OData-Version", "4.0");
//    req.setRequestHeader("Accept", "application/json");
//    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
//    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
//    req.setRequestHeader("If-Match", "*");
//    req.setRequestHeader("Authorization", "Bearer " + accessToken);
//    if (dtd) {
//        req.onreadystatechange = function () {
//            if (this.readyState === 4) {
//                req.onreadystatechange = null;
//                if (this.status === 204) {
//                    results = "Success";
//                    if (callback) {
//                        callback();
//                        dtd.resolve(results);
//                    } else {
//                        dtd.resolve(results);
//                    }
//                } else if (this.status === 401) {
//                    if (!noRetry) {
//                        sessionStorage.removeItem("token_sitlearn");
//                        httpRequestPatch(data, url, dtd, callback, true);
//                    } else {
//                        dtd.reject(results);
//                    }
//                } else {
//                    dtd.reject(results);
//                }
//            }
//        };
//        req.send(JSON.stringify(data));
//    } else {
//        req.send(JSON.stringify(data));
//        if (req.status === 204) {
//            results = "Success";
//            if (callback) {
//                callback();
//            }
//        } else if (req.status === 401) {
//            if (!noRetry) {
//                sessionStorage.removeItem("token_sitlearn");
//                results = httpRequestPatch(data, url, dtd, callback, true);
//            }
//        }
//        return results;
//    }
//}

async function httpRequestPatch(data, url, dtd, callback, noRetry) {
    var results = "Failed";
    var response = await portalWebApiUpdateData(url, JSON.stringify(data));
    if (req.status === 204) {
        results = "Success";
        if (callback) {
            callback();
        }
    }
    else if (req.status === 401) {
        if (!noRetry) {
            sessionStorage.removeItem("token_sitlearn");
            results = await httpRequestPatch(data, url, dtd, callback, true);
        }
    }
    return results;
}

//commented on 10th Aug 2023 VAPT Issue fix
//function webApiUpdateFinalPromise(data, entityName, entityId, callback, sync) {
//    var dtd = sync ? null : $.Deferred(), result = null;
//    var clientUri = getClientUrl();
//    try {
//        result = httpRequestPatch(data, clientUri + "/api/data/v8.2/" + entityName + "(" + entityId + ")", dtd, callback);
//    } catch (e) {
//        dtd && dtd.reject("Failed");
//    }
//    return dtd ? dtd.promise() : result;
//}

async function webApiUpdateFinalPromise(data, entityName, entityId, callback, sync) {
    var dtd = sync ? null : $.Deferred(), result = null;
    //var clientUri = getClientUrl();
    try {
        result = await httpRequestPatch(data, "/_api/" + entityName + "(" + entityId + ")", dtd, callback);
    } catch (e) {
        dtd && dtd.reject("Failed");
    }
    return dtd ? dtd.promise() : result;
}

//commented on 10th Aug 2023 VAPT Issue fix
//function webApiUpdateFinal(entityAttributes, entityId, entityName, async, token) {
//    try {
//        var callBackStatus = "";
//        var clientUri = getClientUrl();
//        var uri = clientUri + "/api/data/v8.2/" + entityName + "(" + entityId + ")";
//        var req = new XMLHttpRequest();
//        req.open("PATCH", uri, async);
//        req.setRequestHeader("OData-MaxVersion", "4.0");
//        req.setRequestHeader("OData-Version", "4.0");
//        req.setRequestHeader("Accept", "application/json");
//        req.setRequestHeader("Authorization", "Bearer " + token);
//        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
//        req.setRequestHeader("If-Match", "*");
//        req.onreadystatechange = function () {
//            if (this.readyState === 4) {
//                req.onreadystatechange = null;
//                if (this.status === 204) {
//                    callBackStatus = "Success";
//                } else {
//                    callBackStatus = "Failed";
//                    alert("An error occurred .Please contact system administrator . Error details:" + this.responseText)
//                }
//            }
//        };
//        req.send(JSON.stringify(entityAttributes));
//    }
//    catch (e) {
//        alert(e.message);
//    }
//    return callBackStatus;
//}

async function webApiUpdateFinal(entityAttributes, entityId, entityName, async, token) {
    try {
        var callBackStatus = "";
        var url = "/_api/" + entityName + "(" + entityId + ")";
        var response = await portalWebApiUpdateData(url, JSON.stringify(entityAttributes));
        if (response.status === 204) {
            callBackStatus = "Success";
        }
        else {
            callBackStatus = "Failed";
            alert("An error occurred .Please contact system administrator . Error details:" + response.statustext);
        }

    }
    catch (e) {
        alert(e.message);
    }
    return callBackStatus;
}

//commented on 10th Aug 2023 VAPT Issue fix
//function webApiCreatePromise(data, entityName, callback, sync) {
//    var dtd = sync ? null : $.Deferred(), result = null;
//    var clientUri = getClientUrl();
//    try {
//        result = httpRequestPost(data, clientUri + "/api/data/v8.2/" + entityName, dtd, callback);
//    } catch (e) {
//        dtd && dtd.reject("Failed");
//    }
//    return dtd ? dtd.promise() : result;
//}

function webApiCreatePromise(data, entityName, callback, sync) {
    var dtd = sync ? null : $.Deferred(), result = null;
    //var clientUri = getClientUrl();
    try {
        result = httpRequestPost(data, "/_api/" + entityName, dtd, callback);
    } catch (e) {
        dtd && dtd.reject("Failed");
    }
    return dtd ? dtd.promise() : result;
}

function httpRequestAction(actionName, actionParameters, SuccessCallBack, errorCallback, clientURL) {
    var result = null;
    var accessToken = getAccessToken();
    var req = new XMLHttpRequest();
    req.open("POST", encodeURI(clientURL + "/api/data/v9.0/" + actionName), true);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.setRequestHeader("Authorization", "Bearer " + accessToken);
    req.onreadystatechange = function () {
        if (this.readyState == 4 /* complete */) {
            req.onreadystatechange = null;
            if (this.status == 200 || this.status == 204) {
                result = JSON.parse(this.response);
                SuccessCallBack(result);
            } else if (this.status == 401) {
                httpRequestAction(actionName, actionParameters, SuccessCallBack, errorCallback, clientURL);
            } else {
                var error = JSON.parse(this.response).error;
                errorCallback(error);
            }

        }
    };
    req.send(JSON.stringify(actionParameters));
}

//function httpRequestPost(data, url, dtd, callback, noRetry) {

//    var recordID = null;
//    var req = new XMLHttpRequest();
//    var accessToken = getAccessToken();
//    req.open("POST", url, dtd ? true : false);
//    req.setRequestHeader("OData-MaxVersion", "4.0");
//    req.setRequestHeader("OData-Version", "4.0");
//    req.setRequestHeader("Accept", "application/json");
//    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
//    req.setRequestHeader("Authorization", "Bearer " + accessToken);
//    if (dtd) {
//        req.onreadystatechange = function () {
//            if (this.readyState === 4) {
//                req.onreadystatechange = null;
//                if (this.status === 204) {
//                    var recordUri = this.getResponseHeader("OData-EntityId");
//                    var regExp = /\(([^)]+)\)/;
//                    var matches = regExp.exec(recordUri);
//                    recordID = matches[1];
//                    if (callback) {
//                        callback(recordID);
//                    }
//                    dtd.resolve(recordID);
//                } else if (this.status === 401) {
//                    if (!noRetry) {
//                        sessionStorage.removeItem("token_sitlearn");
//                        httpRequestPost(data, url, dtd, callback, true);
//                    } else {
//                        dtd.reject(null);
//                    }
//                } else {
//                    dtd.reject(null);
//                }
//            }
//        };
//        req.send(JSON.stringify(data));
//    } else {
//        req.send(JSON.stringify(data));
//        if (req.status === 204) {
//            var recordUri = req.getResponseHeader("OData-EntityId");
//            var regExp = /\(([^)]+)\)/;
//            var matches = regExp.exec(recordUri);
//            recordID = matches[1];
//            if (callback) {
//                callback(recordID);
//            }
//        } else if (req.status === 401) {
//            if (!noRetry) {
//                sessionStorage.removeItem("token_sitlearn");
//                recordID = httpRequestPost(data, url, dtd, callback, true);
//            }
//        }
//        return recordID;
//    }
//}

async function httpRequestPost(data, url, dtd, callback, noRetry)
{
    var recordID = null;
    var response = await portalWebApiCreateData(url, JSON.stringify(data));
    if (response.status === 204) {
        var recordUri = req.getResponseHeader("newentityid");
        var regExp = /\(([^)]+)\)/;
        var matches = regExp.exec(recordUri);
        recordID = matches[1];
        if (callback) {
            callback(recordID);
        }
    }
    else if (req.status === 401) {
        if (!noRetry) {
            sessionStorage.removeItem("token_sitlearn");
            recordID = httpRequestPost(data, url, dtd, callback, true);
        }
    }
    return recordID;    
}

//commented on 10th Aug 2023 VAPT Issue fix
//function httpRequestGet(url, dtd, callback, noRetry) {
//    var req = new XMLHttpRequest();
//    var results = null;
//    var accessToken = getAccessToken();
//    req.open("GET", url, dtd ? true : false);
//    req.setRequestHeader("OData-MaxVersion", "4.0");
//    req.setRequestHeader("OData-Version", "4.0");
//    req.setRequestHeader("Accept", "application/json");
//    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
//    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
//    req.setRequestHeader("Authorization", "Bearer " + accessToken);
//    if (dtd) {
//        req.onreadystatechange = function () {
//            if (this.readyState === 4) {
//                req.onreadystatechange = null;
//                if (this.status === 200) {
//                    results = JSON.parse(this.response);
//                    if (callback) {
//                        callback(results);
//                    }
//                    dtd.resolve(results);
//                } else if (this.status === 401) {
//                    if (!noRetry) {
//                        sessionStorage.removeItem("token_sitlearn");
//                        httpRequestGet(url, dtd, callback, true);
//                    } else {
//                        dtd.reject(null);
//                    }
//                } else {
//                    dtd.reject(null);
//                }
//            }
//        };
//        req.send();
//    }
//    else {
//        req.send();
//        if (req.status === 200) {
//            results = JSON.parse(req.response);
//            if (callback) {
//                callback(results);
//            }
//        } else if (req.status === 401) {
//            if (!noRetry) {
//                sessionStorage.removeItem("token_sitlearn");
//                results = httpRequestGet(url, dtd, callback, true);
//            }
//        }
//        return results;
//    }

//}

async function httpRequestGet(url, dtd, callback, noRetry) {
    var response = null;
    response = await portalWebApiRetrieveData(url);      
    if (response.status === 200)
    {
        if (callback)
        {
                callback(response.results);
        }
    } else if (response.status === 401)
    {
            if (!noRetry) {
                sessionStorage.removeItem("token_sitlearn");
                response = httpRequestGet(url, dtd, callback, true);
            }
    }
    return response.results;   

}


async function retrieveDataPromise(url, callback, sync) {
    var dtd = sync ? null : $.Deferred(), result = null;
    //var clientUri = getClientUrl();
    try {
        result = await httpRequestGet(url, dtd, callback);
    } catch (e) {
        dtd && dtd.reject(null);
    }
    return dtd ? dtd.promise() : result;
}

//Commented on 10th Aug 2023 VAPT Issue fix
//function retrieveDataFetchPromise(entity, fetchXml, callback, sync) {
//    var uri = "/api/data/v9.1/" + entity + "?fetchXml=" + encodeURIComponent(fetchXml);
//    return retrieveDataPromise(uri, callback, sync);
//}


async function retrieveDataFetchPromise(entity, fetchXml, callback, sync) {
    var uri = "/_api/" + entity + "?fetchXml=" + encodeURIComponent(fetchXml);
    return await retrieveDataPromise(uri, callback, sync);
}

//VAPT Issue Changes Updated the changes on 28th July 2023 added common query to all the pages 
(function (webapi, $) {
    function safeAjax(ajaxOptions) {
        var deferredAjax = $.Deferred();
        shell.getTokenDeferred().done(function (token) {
            // add headers for AJAX
            if (!ajaxOptions.headers) {
                $.extend(ajaxOptions, {
                    headers: {
                        "__RequestVerificationToken": token
                    }
                });
            } else {
                ajaxOptions.headers["__RequestVerificationToken"] = token;
            }
            $.ajax(ajaxOptions).done(function (data, textStatus, jqXHR) {
                validateLoginSession(data, textStatus, jqXHR, deferredAjax.resolve);
            }).fail(deferredAjax.reject);
            //AJAX
        }).fail(function () {
            deferredAjax.rejectWith(this, arguments);
            // on token failure pass the token AJAX and args
        });
        return deferredAjax.promise();
    }
    webapi.safeAjax = safeAjax;
})(window.webapi = window.webapi || {}, jQuery)

function portalWebApiRetrieveData(url) {
    return webapi.safeAjax({
        type: "GET",
        url: url,
        contentType: "application/json",
    }).then(function (res, status, xhr) {
        var response = {
            "results": res,
            "newentityid": xhr.getResponseHeader("OData-EntityId"),
            "status": xhr.status,
            "statustext": xhr.statusText
        }
        return response;
    }).catch(er => {
        return null;
    });
}

/* TeBS iTrack 0013536 Changes - SITLearn VAPT Changes - Returning error response */
function portalWebApiCreateData(url, data) {
    return webapi.safeAjax({
        type: "POST",
        url: url,
        contentType: "application/json",
        data: data
    }).then(function (res, status, xhr) {
        var response = {
            "newentityid": xhr.getResponseHeader("OData-EntityId"),
            "status": xhr.status,
            "statustext": xhr.statusText
        };
        return response;
    }).catch(er => {
        return JSON.parse(er.responseText);
    });
}

function portalWebApiUpdateData(url, entitydata) {
    return webapi.safeAjax({
        type: "PATCH",
        url: url,
        contentType: "application/json",
        data: entitydata
    }).then(function (res, status, xhr) {
        var response = {
            "newentityid": xhr.getResponseHeader("OData-EntityId"),
            "status": xhr.status,
            "statustext": xhr.statusText
        };
        return response;
    }).catch(er => {
        return null;
    });
}

function portalWebApiDeleteData(url) {
    return webapi.safeAjax({
        type: "DELETE",
        url: url,
        contentType: "application/json",
    }).then(function (res, status, xhr) {
        var response = {
            "res": res,
            "status": xhr.status,
            "statustext": xhr.statusText
        };
        return response;
    }).catch(er => {
        return null;
    });
}
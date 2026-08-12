var accessToken = "";
var userId = "";
var studentId = "";
var dtdHeader = null;

$(document).ready(async function () {
    if ($("#lblRegistrationsType").val() == "Corporate" && $("#sit_sitlearnportalaccess").val() == "No Access") {
        alert("Your access has been denied. Please contact system administrator.");
        window.location = "/Account/Login/LogOff?returnUrl=/SignIn";
        return;
    }

    /* TeBS iTrack 0012679 changes - start */
    if (window.location.pathname.toLowerCase() === '/signin') {
        $("#alert-top").show();
    }
    else {
        $("#alert-top").hide();
    }
    /* TeBS iTrack 0012679 changes - end */

    userId = $("#lblLoginUserHeader").val();
    studentId = $("#sit_studentid").val();
    clearSession();
    /* TeBS CR VAPT Issues - Start */
    //accessToken = getAccessToken();
    /* TeBS CR VAPT Issues - End */
    /* TeBS CR1924 Learn for Life Token Changes - Commented code - Start */
    //$("[href='/slcbalance/']").hide();
    /* TeBS CR1924 Learn for Life Token Changes - End */

    $("form").attr('autocomplete', 'off');
    $('.navbar-default').addClass('scroll');
    if (window.location.href.split('?')[0].toLowerCase().indexOf("changelogin") > -1) {
        $('.dropdown-toggle').css('color', '#800');
    }
    $('#search_button').click(function () {
        $('#search_div').slideToggle('fast');
    });
    $('.previewCMS').hide();
    var link = document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "icon";
    link.href = "/favicon.ico";
    document.getElementsByTagName('head')[0].appendChild(link);
    if (window.location.href.split('?')[0].toLowerCase().indexOf("changelogin") > -1) {

        $('.page-header').hide();
        $('.breadcrumb').hide();
        $("a[title|='Set password']").hide();
        $("a[title|='Change Email']").hide();
        $('#bannerID').html('Manage External Authentication');
        $('#bannerID').val('Manage External Authentication');
        //mobnavmenu
        $('.navbar-brand').css('margin-top', '-10px');
    }
    if (userId && sessionStorage[userId + "_sit_slcfirstlogin"] != "true") {
        sessionStorage[userId + "_sit_slcfirstlogin"] = $("#sit_slcfirstlogin").val();
    }

    /* TeBS CR VAPT Issues - Added await - Start */
    await initData();
    /* TeBS CR VAPT Issues - End */

    $("#search_button").hide();
    $('link[href="bootstrap.min.css"]').prop('disabled', true);
    $('link[src="bootstrap.min.css"]').remove();

    if (window.location.href.split('?')[0].toLowerCase().indexOf("mycourses") > -1) {
        top.document.title = "SITLEARN - My Courses";
    }
    if (window.location.href.split('?')[0].toLowerCase().indexOf("contact-us") > -1) {
        top.document.title = "SITLEARN - Contact Us";
        $("label").css('padding-left', '10px');
        $(".actions").css('float', 'right');
        $(".actions").css('border-top', '0px');
        $('#telephone2').attr('type', 'number');
        $('.actions').append('<input type="button" value="Cancel" onclick="cancelEvent()" id="CancelButton" class="submit-btn btn btn-primary">');
    }

    if (window.location.href.split('?')[0].toLowerCase().indexOf("search") > -1) {
        $('.dropdown').click(function () {
            if ($(this).attr('class').toLowerCase().indexOf("open") > -1) {
                $(this).removeClass('open');

                $(this).closest('a').attr("aria-expanded", "false");
                $(this).closest('a').removeClass('hover');
                $(this).closest('.dropdown-menu').css('display', 'none');
            } else {
                $(this).addClass('open');
            }
        });
    }

    if (window.location.href.split('?')[0].toLowerCase().indexOf("register") > -1) {
        $('.banner').show();
        document.getElementById("RedeemByLogin").checked = true;
        document.getElementById("InvitationCode").readOnly = true;
        document.getElementById("RedeemByLogin").onclick = function () { return false };
        document.getElementById('submit-redeem-invitation').click();

    } else if (window.location.href.toLowerCase().indexOf("contact-us") > -1) {
        $('.banner').show();
        $('.page-heading').hide();
        $(".page-heading").after("<div class='programmes_page_desc'></div>");

        $('#bannerID').html('Contact Us');
        $('#bannerImgID').css('height', '240px');
        $('.page-header').hide();

        $('#EntityFormControl').parent().addClass('whitebackground container-padding registration-style');
        $($('#EntityFormControl').parent()).appendTo(".programmes_page_desc");
    }
    if (window.location.href.split('?')[0].toLowerCase().indexOf("signin") > -1) {

        top.document.title = "SITLEARN - Signin";
    }
});

function acceptSLC() {
    $("#slcTermsAcceptBtn").text("Processing");
    $.when(webApiUpdateFinalPromise({ sit_slcfirstlogin: true }, "contacts", userId)).done(function (data) {
        $("#slcTerms").hide();
        sessionStorage[userId + "_sit_slcfirstlogin"] = "true";
        $("#sit_slcfirstlogin").val("true");
        if (sessionStorage && sessionStorage["contact-header_" + userId]) {
            var contact = JSON.parse(sessionStorage["contact-header_" + userId]);
            contact["sit_slcfirstlogin"] = "true";
            sessionStorage["contact-header_" + userId] = JSON.stringify(contact);
        }
    }).fail(function (err) {
        $("#slcTermsAcceptBtn").text("Accept");
    });
}

function loadcurrentmonthcourse() {
    var today = new Date();
    // var dd = '01'; //entire month
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }
    window.location.href = '/courseforindividuals/';
}

function cancelEvent() {
    window.location.href = '/';
}

function checkSLCTermsWithoutFirstLogin() {
    return userId && $("#slc_student").val() == 'true'
        && $("#slc_enable").val() == 'true'
        && $("#sit_slceligible").val() == 'true'
        && $("#lblRegistrationsType").val() == 'Self';
}

function showSLCTermsDialog() {
    if (sessionStorage[userId + "_sit_slcfirstlogin"] != "true" && checkSLCTermsWithoutFirstLogin()
        && $("#sit_slcfirstlogin").val() != 'true') {
        $("#slcTerms").show();
    }
}

function Cloud() {
    $.ajax({
        url: 'https://developers.onemap.sg/commonapi/search?searchVal=' + $('#address1_postalcode').val() + '&returnGeom=Y&getAddrDetails=Y&pageNum=1',
        success: function (result) {
            //Set result to a variable for writing
            var TrueResult = JSON.stringify(result);

            var oldArr = TrueResult.split('results')[1].substr(1).split(',');
            var AddressVal = '';
            for (var i = 0, l = oldArr.length; i < l; i++) {
                if (i != 0 && i < 4) {
                    var item = oldArr[i].split(':')[1];
                    AddressVal += item.replace(/"/g, ' ');
                }
                if (i == 4) {
                    var item = oldArr[i].split(':')[1];
                    item = item.replace(/"/g, ' ');
                }
            }
            $('#address1_line2').val(AddressVal);
        }
    });
}

function GetParameterValues(param) {
    var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < url.length; i++) {
        var urlparam = url[i].split('=');
        if (urlparam[0] == param) {
            return urlparam[1];
        }
    }
}

function closeSearch() {

    $('#search_div').css('display', 'none');
    $('#navbardefaultID').removeClass('defaultShowHeight');

    return false;
}

function showSearch() {
    $('#navbardefaultID').addClass('navbar-defaultShow');

    var classname = $('#navbardefaultID').attr('class').split(' ').join('.');

    if (classname.indexOf('defaultShowHeight') == -1) {
        $('#search_div').css('display', 'block');
        $('#navbardefaultID').addClass('defaultShowHeight');
    }
    else {
        $('#search_div').css('display', 'none');
        $('#navbardefaultID').removeClass('defaultShowHeight');
    }
    return false;
}

function moveMobileMenu() {
    $('.navbar-offcanvas').addClass(' offcanvas in canvas-slid');
}

function loadPopup() {
    // Get the modal
    var modal = document.getElementById('myModal');
    modal.style.display = "block";
}

function popupClose() {
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
}

/* TeBS CR 0996 Changes - Start */
/*function loadProfile() {
    window.location.href = "http://eepurl.com/haSn5v";
}*/
/* TeBS CR 0996 Changes - End */

function validateNRIC() {
    var str;
    /* TeBS CR1421 Changes - Registration Form Changes Start */
    var residencyStatus = $("#sit_residencystatus").val();
    var identificationType = $("#sit_identificationtype").val();

    if (residencyStatus != null && identificationType != null) {
        /* TeBS CR1421 Changes - Registration Form Changes End */
        if (identificationType != "3") {
            if ($("#sit_identificationnumber").val() != null) {
                str = $("#sit_identificationnumber").val().toUpperCase();
                $("div#errNRIC").remove();
                if (str.length != 9) {
                    $('#sit_identificationnumber').after("<div id='errNRIC' style='color:red'> Please enter valid Identification number. </div>");
                    return false;
                }
                else {
                    /* TeBS CR1421 Changes - Registration Form Changes Start */
                    if (residencyStatus == "1" || residencyStatus == "2") {
                        if (str.charAt(0) != "S" && str.charAt(0) != "T") {
                            $('#sit_identificationnumber').after("<div id='errNRIC' style='color:red'> Please enter valid Identification number. </div>");
                            return false;
                        }
                    }
                    else if (residencyStatus == "3" || residencyStatus == "4") {
                        if (str.charAt(0) != "F" && str.charAt(0) != "G" && str.charAt(0) != "M") {
                            $('#sit_identificationnumber').after("<div id='errNRIC' style='color:red'> Please enter valid Identification number. </div>");
                            return false;
                        }
                    }
                    /* TeBS CR1421 Changes - Registration Form Changes End */
                }

                str = str.toUpperCase();
                var i = 0;
                var icArray = [];
                for (i = 0; i < 9; i++) {
                    icArray[i] = str.charAt(i);
                }
                icArray[1] = parseInt(icArray[1], 10) * 2;
                icArray[2] = parseInt(icArray[2], 10) * 7;
                icArray[3] = parseInt(icArray[3], 10) * 6;
                icArray[4] = parseInt(icArray[4], 10) * 5;
                icArray[5] = parseInt(icArray[5], 10) * 4;
                icArray[6] = parseInt(icArray[6], 10) * 3;
                icArray[7] = parseInt(icArray[7], 10) * 2;
                var weight = 0;
                for (i = 1; i < 8; i++) {
                    weight += icArray[i];
                }

                /* TeBS CR - Added code to validate FIN series starting M */
                var offset = (icArray[0] == "M") ? 3 : ((icArray[0] == "T" || icArray[0] == "G") ? 4 : 0);
                var temp = (offset + weight) % 11;
                var st = ["J", "Z", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
                var fg = ["X", "W", "U", "T", "R", "Q", "P", "N", "M", "L", "K"];
                /* TeBS CR - Added code to validate FIN series starting M */
                var mSeries = ["X", "W", "U", "T", "R", "Q", "P", "N", "J", "L", "K"];
                var theAlpha;
                if (icArray[0] == "S" || icArray[0] == "T") { theAlpha = st[temp]; }
                else if (icArray[0] == "F" || icArray[0] == "G") { theAlpha = fg[temp]; }
                /* TeBS CR - Added code to validate FIN series starting M */
                else if (icArray[0] == "M") { theAlpha = mSeries[temp]; }
                var validNRIC = false;
                if (icArray[8] === theAlpha) {
                    validNRIC = true;
                }
                if (validNRIC == false) {
                    $('#sit_identificationnumber').after("<div id='errNRIC' style='color:red'> Please enter valid Identification number. </div>");
                    return validNRIC;
                }
                else {
                    return validNRIC;
                }
            }
        }
        else {
            return true;
        }
    }
}

$('#MobMenu').on('click', '.canvas-slid', function () {
    $('body.canvas-slid').removeClass('canvas-slid');
});

/* TeBS CR 0996 Changes - Start */
/*function closeMailingList() {
    $('#alert-top').hide();
    $('.previewCMS').hide();
    if (screen.width < 767) { //handle mobile banner
        if (top.document.title == "SITLEARN - Home") { //main page
            $('.banner').css('height', '290');
        } else {
            $('.banner').css('height', '130');
        }
    } else {
        $('.banner').css('margin-top', '0px');
    }
}*/
/* TeBS CR 0996 Changes - End */

// Scroll to element and focus on element.
function SIT_scrollToAndFocus(scollToId, focusOnId) {

    if (focusOnId == null || focusOnId.length <= 0) {
        return;
    }
    if (scollToId == null || scollToId.length <= 0) {
        SIT_scrollToPosition(focusOnId);
    } else {
        SIT_scrollToPosition(scollToId);
    }
    setFocus(focusOnId);
}

async function getContact(userId) {
    var isProfilePage = window.location.href.split('?')[0].toLowerCase().indexOf("profile") > -1;
    /* TeBS CR1421 Changes - Registration Form Changes Start - Added Return Check */
    if (isProfilePage && GetParameterValues("return") != null && GetParameterValues("return") != "" &&
        (sessionStorage[userId + "_sit_slcfirstlogin"] == 'true' || !checkSLCTermsWithoutFirstLogin())) {
        return null;
    }
    if (checkSLCTermsWithoutFirstLogin() && (sessionStorage[userId + "_sit_slcfirstlogin"] != "true"
        || $.inArray(window.location.pathname.toLowerCase(), ["/slcbalance/", "/mycourses/", "/paymentsummary/"] > -1))) {
        sessionStorage.removeItem("contact-header_" + userId);
    }
    if (sessionStorage && sessionStorage["contact-header_" + userId]) {
        return JSON.parse(sessionStorage["contact-header_" + userId]);
    }
    else {
        //commented on 10th Aug 2023 VAPT Issue fix
        //return retrieveDataPromise("/api/data/v9.1/contacts(" + userId + ")?$select=sit_howdidyoulearnaboutus,firstname,lastname,department,sit_officialfullname,mobilephone,sit_jobtitle,sit_salutation,sit_countrycode,_parentcustomerid_value,sit_slcfirstlogin,sit_available,sit_utilized,sit_pending", contactCallback);
        var dataUri = "/_api/contacts(" + userId + ")?$select=sit_howdidyoulearnaboutus,firstname,lastname,department,sit_officialfullname,mobilephone,sit_jobtitle,sit_salutation,sit_countrycode,_parentcustomerid_value,sit_slcfirstlogin,sit_available,sit_utilized,sit_pending";
        var response = await portalWebApiRetrieveData(dataUri);
        if (response.status == 200) {
            contactCallback(response.results);
            return response.results;
        }
        else {
            return null;
        }
    }
}

function contactCallback(data) {
    if (data) {
        sessionStorage["contact-header_" + userId] = JSON.stringify(data);
    }
    return data;
}

async function getNoOfInterests(userId) {
    if (sessionStorage && sessionStorage["interest-no-header_" + userId]) {
        var num = Number.parseInt(sessionStorage["interest-no-header_" + userId]);
        return isNaN(num) ? 0 : num;
    } else {
        //commented on 10th Aug 2023 VAPT Issue fix
        //return retrieveDataPromise("/api/data/v9.1/sit_sit_categorypreference_contactset?$select=sit_categorypreferenceid&$filter=contactid eq " + userId, noOfInterestCallback);
        //return await retrieveDataPromise("/_api/sit_sit_categorypreference_contactset?$select=sit_categorypreferenceid&$filter=contactid eq " + userId, noOfInterestCallback);
        //var dataUri = "/_api/contacts?$expand=sit_sit_categorypreference_contact($select=sit_categorypreferenceid)&$filter=contactid eq " + userId;//commented on 10th Jan 2024 VAPT Issue fix
        var dataUri = "/_api/contacts?$select=contactid&$expand=sit_sit_categorypreference_contact($select=sit_categorypreferenceid)&$filter=contactid eq " + userId; //added on 10th Jan 2024 VAPT Issue fix
        var response = await portalWebApiRetrieveData(dataUri);
        if (response.status == 200) {
            noOfInterestCallback(response.results);
            return response.results;
        }
        else {
            return null;
        }
    }
}

function noOfInterestCallback(data) {
    var result = 0;
    if (data && data.value) {
        result = data.value.length;
    }
    sessionStorage["interest-no-header_" + userId] = result;
    return result;
}

async function getStudent(userId, studentId) {
    if (sessionStorage && sessionStorage["student-enable-header_" + userId]) {
        $("#slc_student").val(sessionStorage["student-enable-header_" + userId] == 'true' ? 'true' : 'false');
        return $("#slc_student").val();
    } else {
        //commented on 10th Aug 2023 VAPT Issue fix
        //return retrieveDataPromise("/api/data/v9.2/sit_studentses?$select=sit_programstatus,createdon,sit_studentsid,sit_name&$filter=(sit_name eq '" + studentId + "' and Microsoft.Dynamics.CRM.In(PropertyName='sit_programstatus',PropertyValues=['1','3']))&$orderby=createdon desc&$top=1", studentCallback);
        var dataUri = "/_api/sit_studentses?$select=sit_programstatus,createdon,sit_studentsid,sit_name&$filter=(sit_name eq '" + studentId + "' and Microsoft.Dynamics.CRM.In(PropertyName='sit_programstatus',PropertyValues=['1','3']))&$orderby=createdon desc&$top=1";
        var response = await portalWebApiRetrieveData(dataUri);
        if (response.status == 200) {
            studentCallback(response.results);
            return response.results;
        }
        else {
            return null;
        }
    }
}

function studentCallback(data) {
    var result = false;
    if (data && data.value && data.value.length) {
        result = true;
    }
    $("#slc_student").val(result);
    sessionStorage["student-enable-header_" + userId] = result;
    return result;
}

async function getSLCBlackList(userId, studentId) {
    if (sessionStorage && sessionStorage["slc-enable-header_" + userId]) {
        $("#slc_enable").val(sessionStorage["slc-enable-header_" + userId] == 'true');
        return $("#slc_enable").val();
    } else {
        //commented on 10th Aug 2023 VAPT Issue fix
        //return retrieveDataPromise("/api/data/v9.2/sit_slcblacklists?$select=sit_enddate,sit_startdate,sit_name,statecode,sit_studentid&$filter=(statecode eq 0 and sit_studentid eq '" + studentId + "' and Microsoft.Dynamics.CRM.OnOrBefore(PropertyName='sit_startdate',PropertyValue='" + $("#nowDateStr").val() + "') and Microsoft.Dynamics.CRM.OnOrAfter(PropertyName='sit_enddate',PropertyValue='" + $("#nowDateStr").val() + "'))&$top=1", slcBlackListCallback);
        var dataUri = "/_api/sit_slcblacklists?$select=sit_enddate,sit_startdate,sit_name,statecode,sit_studentid&$filter=(statecode eq 0 and sit_studentid eq '" + studentId + "' and Microsoft.Dynamics.CRM.OnOrBefore(PropertyName='sit_startdate',PropertyValue='" + $("#nowDateStr").val() + "') and Microsoft.Dynamics.CRM.OnOrAfter(PropertyName='sit_enddate',PropertyValue='" + $("#nowDateStr").val() + "'))&$top=1";
        var response = await portalWebApiRetrieveData(dataUri);
        if (response.status == 200) {
            slcBlackListCallback(response.results);
            return response.results;
        }
        else {
            return null;
        }
    }
}

function slcBlackListCallback(data) {
    var result = true;
    if (data && data.value && data.value.length) {
        result = false;
    }
    $("#slc_enable").val(result);
    sessionStorage["slc-enable-header_" + userId] = result;
    return result;
}

async function initData() {
    try {
        var drupalUrl = $("#sit_drupalurl").val();
        /* TeBS CR VAPT Issues - Start */
        //dtdHeader = $.Deferred();
        /* TeBS CR VAPT Issues - End */
        var isProfilePage = window.location.href.split('?')[0].toLowerCase().indexOf("profile") > -1;
        var isMailingpreferencesPage = window.location.href.split('?')[0].toLowerCase().indexOf("mailingpreferences") > -1;
        if (isProfilePage && userId) {
            sessionStorage.removeItem("contact-header_" + userId);
            sessionStorage.removeItem("interest-no-header_" + userId);
        }
        if (!userId) {
            if (window.location.pathname == "/") {
                window.location = drupalUrl;
                return;
            }

            /* TeBS CR VAPT Issues - Start */
            //dtdHeader.resolve();
            //return dtdHeader.promise();
            return;
            /* TeBS CR VAPT Issues - End */
        }
        //commented on 13th Aug 2023 VAPT Issue fix
        //$.when(getContact(userId),
        //    !isMailingpreferencesPage && getNoOfInterests(userId),
        //    $("#sit_slceligible").val() == 'true' && $("#lblRegistrationsType").val() == 'Self' && getStudent(userId, studentId),
        //    $("#sit_slceligible").val() == 'true' && $("#lblRegistrationsType").val() == 'Self' && getSLCBlackList(userId, studentId)).done(function (contact, interestNumber) {
        //        if (contact) {
        //            $("#sit_slcfirstlogin").val(contact["sit_slcfirstlogin"]);
        //            sessionStorage[userId + "_sit_slcfirstlogin"] = contact["sit_slcfirstlogin"];
        //            $("#sit_available").val(contact["sit_available"]);
        //            $("#sit_utilized").val(contact["sit_utilized"]);
        //            $("#sit_pending").val(contact["sit_pending"]);
        //            if (isGoProfile(contact, interestNumber, isProfilePage, isMailingpreferencesPage)) {
        //                /* TeBS CR 0996 Changes - Start */
        //                if (window.location.pathname != "/" && window.location.pathname != "/profile/") {
        //                    var returnUrl = window.location.pathname + window.location.search;
        //                    sessionStorage.setItem("returnUrl", returnUrl);
        //                }
        //                else {
        //                    sessionStorage.setItem("returnUrl", drupalUrl);
        //                }
        //                /* TeBS CR 0996 Changes - End */
        //                /* TeBS CR1421 Changes - Registration Form Changes Start - Added Return Check */
        //                if (GetParameterValues("return") == null || GetParameterValues("return") == "") {
        //                    window.location.href = "/profile/?return=true";
        //                }
        //                /* TeBS CR1421 Changes - Registration Form Changes End */
        //                return;
        //            } else {
        //                showSLCTermsDialog();
        //            }
        //        }
        //        /* TeBS CR 0996 Changes - Start */
        //        if (userId) {
        //            if ((document.referrer == "" || document.referrer.contains("google") ||
        //                document.referrer.contains("b2c") || document.referrer.contains("fs.")) &&
        //                window.location.pathname == "/") {
        //                window.location = drupalUrl;
        //                return;
        //            }
        //        }
        //        /* TeBS CR 0996 Changes - End */
        //        if ($("#slc_enable").val() == 'true' && $("#slc_student").val() == 'true' && $("#sit_slceligible").val() == 'true' && $("#lblRegistrationsType").val() == 'Self') {
        //            $("[href='/slcbalance/']").show();
        //        }

        //        dtdHeader.resolve();
        //    }).fail(function (err) {
        //        dtdHeader.resolve();
        //        console.log(err);
        // });   
        const [contact, interestNumber, student, blackList] = await Promise.all([getContact(userId), !isMailingpreferencesPage && getNoOfInterests(userId), $("#sit_slceligible").val() == 'true' && $("#lblRegistrationsType").val() == 'Self' && getStudent(userId, studentId), $("#sit_slceligible").val() == 'true' && $("#lblRegistrationsType").val() == 'Self' && getSLCBlackList(userId, studentId)]);
        if (contact) {
            $("#sit_slcfirstlogin").val(contact["sit_slcfirstlogin"]);
            sessionStorage[userId + "_sit_slcfirstlogin"] = contact["sit_slcfirstlogin"];
            $("#sit_available").val(contact["sit_available"]);
            $("#sit_utilized").val(contact["sit_utilized"]);
            $("#sit_pending").val(contact["sit_pending"]);
            if (isGoProfile(contact, interestNumber, isProfilePage, isMailingpreferencesPage)) {
                /* TeBS CR 0996 Changes - Start */
                if (window.location.pathname != "/" && window.location.pathname != "/profile/") {
                    var returnUrl = window.location.pathname + window.location.search;
                    sessionStorage.setItem("returnUrl", returnUrl);
                }
                else {
                    sessionStorage.setItem("returnUrl", drupalUrl);
                }
                /* TeBS CR 0996 Changes - End */
                /* TeBS CR1421 Changes - Registration Form Changes Start - Added Return Check */
                if (GetParameterValues("return") == null || GetParameterValues("return") == "") {
                    window.location.href = "/profile/?return=true";
                }
                /* TeBS CR1421 Changes - Registration Form Changes End */
                return;
            } else {
                showSLCTermsDialog();
            }
        }
        /* TeBS CR 0996 Changes - Start */
        if (userId) {
            if ((document.referrer == "" || document.referrer.contains("google") ||
                document.referrer.contains("b2c") || document.referrer.contains("fs.")) &&
                window.location.pathname == "/") {
                window.location = drupalUrl;
                return;
            }
        }
        /* TeBS CR 0996 Changes - End */
        /* TeBS CR1924 Learn for Life Token Changes - Commented code - Start */
        /*if ($("#slc_enable").val() == 'true' && $("#slc_student").val() == 'true' && $("#sit_slceligible").val() == 'true' && $("#lblRegistrationsType").val() == 'Self') {
            $("[href='/slcbalance/']").show();
        }*/
        /* TeBS CR1924 Learn for Life Token Changes - End */

    }
    catch (error) {

    }
    /* TeBS CR VAPT Issues - Start */
    // return dtdHeader.promise();
    /* TeBS CR VAPT Issues - End */
}

function isGoProfile(contact, interestNumber, isProfilePage, isMailingpreferencesPage) {
    var result = false;
    var howdoyoulearn1 = contact["sit_howdidyoulearnaboutus"];
    var firstName = contact["firstname"];
    var lastname = contact["lastname"];
    var Department = contact["department"];
    var fullName = contact["sit_officialfullname"];
    var MobileNumber = contact["mobilephone"];
    var _jobtitle = contact["sit_jobtitle"];
    var _salutation = contact["sit_salutation"];
    var conuntrycode = contact["sit_countrycode"];
    var Company = contact["_parentcustomerid_value"];
    /* TeBS CR1421 Registration Form Changes - Commented Profile Page Check */
    //if (!isProfilePage) {
    /* TeBS CR1421 Registration Form Changes - End */
    if ($('#lblRegistrationsType').val() != "Self") {
        if (!isMailingpreferencesPage) {
            if (isNull(_salutation) || isNull(firstName) || isNull(lastname) || isNull(fullName) || isNull(Department) || isNull(_jobtitle) || isNull(conuntrycode) || isNull(howdoyoulearn1) || isNull(MobileNumber) || interestNumber == 0 || (isNaN(interestNumber) && interestNumber.value.length == 0)) {
                result = true;
            }
        }
    } else if (!isMailingpreferencesPage) {
        if (isNull(_salutation) || isNull(firstName) || isNull(lastname) || isNull(fullName) || isNull(_jobtitle) || isNull(howdoyoulearn1) || isNull(Company) || interestNumber == 0 || (isNaN(interestNumber) && interestNumber.value.length == 0)) {
            result = true;
        }
    }
    /* TeBS CR1421 Registration Form Changes - Commented Profile Page Check */
    //}
    /* TeBS CR1421 Registration Form Changes - End */
    return result;
}

function isNull(str) {
    if (str == "" || str == null || str == undefined) {
        return true;
    }
    return false;
}

// Scroll to the position of the element with the specified id.
function SIT_scrollToPosition(id) {

    if (id == null) {
        return;
    }
    var element = document.getElementById(id);
    var posX = element.offsetLeft;
    var posY = element.offsetTop;

    var parentElement = element.offsetParent;
    while (parentElement != null) {
        posX += parentElement.offsetLeft;
        posY += parentElement.offsetTop;
        parentElement = parentElement.offsetParent;
    }

    window.scrollTo(posX, posY - 140);
}

function clearSession() {
    if (userId && sessionStorage && sessionStorage["token_active_time"] && new Date().getTime() + 60000 >= sessionStorage["token_active_time"]) {
        sessionStorage.removeItem("contact-header_" + userId);
        sessionStorage.removeItem("interest-no-header_" + userId);
        sessionStorage.removeItem("student-enable-header_" + userId);
        sessionStorage.removeItem("slc-enable-header_" + userId);
    }
}

/* CR1245 SCTP changes start */
function showHideField(field, showField, defaultValue, defaultValueIndex) {
    if (showField) {
        $(field).closest('td').show();
    }
    else {
        $(field).closest('td').hide();
        clearField(field, defaultValue, defaultValueIndex);
    }
}

function clearField(field, defaultValue, defaultValueIndex) {
    if ($(field).hasClass("boolean-radio")) {
        $(field + "_1").prop("checked", false);
        $(field + "_0").prop("checked", true);
    }
    else if ($(field).hasClass("picklist") && $(field).find("input").attr("type") === "radio") {
        $(field).find("input").prop("checked", false);
        if (defaultValue) {
            $(field + "_" + defaultValueIndex).prop("checked", true);
        }
    }
    else {
        $(field).val("");
    }
}
/* CR1245 SCTP changes end */

/* TeBS CR1421 Changes - Registration Form Changes Start */
function validateEmail(input) {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (input.match(validRegex)) {
        return true;
    }
    else {
        return false;
    }
}

function isNumeric(input) {
    var validRegex = /^\d*$/;

    if (input.match(validRegex)) {
        return true;
    }
    else {
        return false;
    }
}

function validateDate(input) {
    if (input == '')
        return false;

    //Declare Regex  
    var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
    var dtArray = input.match(rxDatePattern); // is format OK?

    if (dtArray == null)
        return false;

    //Checks for dd/mm/yyyy format.
    dtDay = dtArray[1];
    dtMonth = dtArray[3];
    dtYear = dtArray[5];

    if (dtMonth < 1 || dtMonth > 12)
        return false;
    else if (dtDay < 1 || dtDay > 31)
        return false;
    else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31)
        return false;
    else if (dtMonth == 2) {
        var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
        if (dtDay > 29 || (dtDay == 29 && !isleap))
            return false;
    }
    return true;
}
/* TeBS CR1421 Changes - Registration Form Changes End */
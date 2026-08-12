var idCourseVal = GetParameterValues('cid');
var idVal = GetParameterValues('id');
var fromPG = GetParameterValues('fromPG');
var fromPage = GetParameterValues('Fpage');
var invoiceId = null;
var GSTAmt = 0;
var skillfutuStatusMan = false;
var totalAmtFinal = 0;
var sfcMaxValue = 0;
var sit_promocodeid;
var sit_quotaremaining;
var sit_quoteused;
var sit_quota;
var registrationNumber;
var existingUsingSLC = false;
/* TeBS CR1924 Learn for Life Token Changes - Start */
var existingUsingLFL = false;
var lflEnable = false;
/* TeBS CR1924 Learn for Life Token Changes - End */
var usedSSGFunding = false;
var adminFee = {};
var feeSetup = null;
var fundings = null;
var hasAdminFeelineItem = false, hasslclineItem = false, participants = null, usedCount = 0, invoiceData = null, sit_inslcblacklist = -1;
var sfcLineItemTitle = "Less: Applied SkillsFuture Credit amount {0}", course = null, registrationInfo = null, slcEnable = false, sfcEnable = false, sfcSelecedValue = 0;
/* TeBS CR1231 Changes - Remove Execution Paticipant Limit Start */
/* TeBS iTrack 0015427 Changes - Commented - Start */
//var processedparticipants = 0;
/* TeBS iTrack 0015427 Changes - End */
var regparticipants = 0;
/* TeBS CR1231 Changes - Remove Execution Paticipant Limit End */
$(document).ready(function () {
    if (userId) {
        /* TeBS CR VAPT Issues - Start */
        init();
        /*$.when(dtdHeader).done(function () {
            init();
        }).fail(function () {
            hideloading();
        });*/
        /* TeBS CR VAPT Issues - End */
    } else {
        window.location.href = '/SignIn?returnUrl=' + window.location.pathname;
    }
});
function loadRegistrationCallback(results) {
    if (results && results.value && results.value.length) {
        var item = results.value[0];
        registrationInfo = item;
        registrationNumber = item["sit_name"];
        $('#lblUseskillsfuturecredit').val(item["sit_useskillsfuturecredit"]);
        $('#lblSkillfuturecreditamountsgd').val(item["sit_skillfuturecreditamountsgd"]);
        $('#lblsit_paymentmethod').val(item["sit_paymentmethod"]);
        $('#lblRegistrationstatus').val(item["sit_registrationstatus@OData.Community.Display.V1.FormattedValue"]);
        $('#lblRegsit_age').val(item["sit_age"]);
        $('#lblsit_promocode').val(item["sit_promocode"]);

        /* TeBS CR1924 Learn for Life Token Changes - Start */
        if ($("#sit_enableslc").val() == "true") {
            $('#sit_useslccredit').val(item["sit_useslccredit"] ? 1 : 0);
        }
        else {
            $('#sit_useslccredit').val(0);
        }
        /* TeBS CR1924 Learn for Life Token Changes - End */

        $('#sit_retake').val(item["sit_retake"]);
        $('#lblSponsorship').val(item["sit_sponsorship@OData.Community.Display.V1.FormattedValue"]);
        $('#lblsit_invoiceprogress').val(item["sit_invoiceprogress@OData.Community.Display.V1.FormattedValue"]);
        $('#lblsit_residencystatus').val(item["sit_residencystatus@OData.Community.Display.V1.FormattedValue"]);
        $('#lblFirstname').val(item["sit_firstname"]);
        sit_inslcblacklist = item["sit_inslcblacklist"] == "1" ? 1 : item["sit_inslcblacklist"] == "0" ? 0 : -1;
        course = item.sit_Programme;
        course["_sit_adminfee_value"] && $('#sit_adminfee').val(course["_sit_adminfee_value"]);
        $('#sit_slcpayable').val(course["sit_slcpayable"]);
        /* TeBS CR1924 Learn for Life Token Changes - Start */
        $('#sit_learntokenpayable').val(course["sit_learntokenpayable"]);
        $('#sit_uselearntoken').val(item["sit_uselearntoken"] ? 1 : 0);
        /* TeBS CR1924 Learn for Life Token Changes - End */
        $('#lblsit_age').val(course["sit_age"]);
        $('#lblsit_thresholdforthesfcredit').val(course["sit_thresholdforthesfcredit"]);
        $('#lblsit_courseeligibleforsfcredit').val(course["sit_courseeligibleforsfcredit@OData.Community.Display.V1.FormattedValue"]);
        $('#lblregistrationapprovalrequired').val(course["sit_registrationapprovalrequired"]);
        $(".payment-table-header").text("Payment Summary for Course: {0} - {1} to {2}".format(course["sit_name"], convertDate(course["sit_startdate"]), convertDate(course["sit_enddate"])));
    }
}
function convertDate(dateStr) {
    return new Date(dateStr).toString("dd MMM yyyy");
}

//commented on 12th Aug 2023 VAPT Issue fix
//function loadRegistration() {
//    var dataUri = "/api/data/v9.2/sit_registrations?$select=sit_skillsfuturestatus,sit_ssgfaild,sit_sfcclaimid,sit_personalemail,sit_inslcblacklist,sit_residencystatus,sit_age,sit_name,sit_retake,sit_sponsorship,sit_registrationstatus,sit_invoiceprogress,sit_identificationnumber,sit_useslccredit,sit_promocode,_sit_contactname_value,sit_useskillsfuturecredit,sit_skillfuturecreditamountsgd,sit_firstname,sit_paymentmethod&$expand=sit_Programme($select=sit_myskillsfuturecoursenum,sit_programmefee,sit_adminsetup,_sit_adminfee_value,sit_age,sit_registrationapprovalrequired,sit_slcpayable,sit_courseeligibleforsfcredit,sit_startdate,sit_thresholdforthesfcredit,sit_enddate,sit_name)&$filter=(_sit_contactname_value eq {0} and _sit_programme_value eq {2} and sit_registrationid eq {1}) and (sit_Programme/sit_programmeid ne null)&$top=1";
//    dataUri = dataUri.format(userId, idVal, idCourseVal);
//    return retrieveDataPromise(dataUri, loadRegistrationCallback);
//}

async function loadRegistration() {
    // TeBS CR1924 Learn for Life Token Changes - Add sit_uselearntoken, sit_learntokenpayable columns
    var dataUri = "/_api/sit_registrations?$select=sit_skillsfuturestatus,sit_ssgfaild,sit_sfcclaimid,sit_personalemail,sit_inslcblacklist,sit_residencystatus,sit_age,sit_name,sit_retake,sit_sponsorship,sit_registrationstatus,sit_invoiceprogress,sit_identificationnumber,sit_useslccredit,sit_promocode,_sit_contactname_value,sit_useskillsfuturecredit,sit_skillfuturecreditamountsgd,sit_firstname,sit_paymentmethod,sit_uselearntoken&$expand=sit_Programme($select=sit_myskillsfuturecoursenum,sit_programmefee,sit_adminsetup,_sit_adminfee_value,sit_age,sit_registrationapprovalrequired,sit_slcpayable,sit_courseeligibleforsfcredit,sit_startdate,sit_thresholdforthesfcredit,sit_enddate,sit_name,sit_learntokenpayable)&$filter=(_sit_contactname_value eq {0} and _sit_programme_value eq {2} and sit_registrationid eq {1}) and (sit_Programme/sit_programmeid ne null)&$top=1";
    dataUri = dataUri.format(userId, idVal, idCourseVal);
    var response = await portalWebApiRetrieveData(dataUri);
    if (response.status == 200) {
        loadRegistrationCallback(response.results);
        return response.results;
    }
    else {
        return null;
    }
}

//commented on 12th Aug 2023 VAPT Issue fix
//function loadRegistrationParticipants() {
//    var dataUri = "/api/data/v9.2/sit_registrationparticipants?$select=sit_registrationparticipantid,sit_name,sit_officialfullname,_sit_programmeregistrationsid_value,sit_promocode&$filter=(_sit_programmeregistrationsid_value eq {0})&$orderby=sit_name asc";
//    dataUri = dataUri.format(idVal);
//    return retrieveDataPromise(dataUri, loadRegistrationParticipantsCallback);
//}

async function loadRegistrationParticipants() {
    var dataUri = "/_api/sit_registrationparticipants?$select=sit_registrationparticipantid,sit_name,sit_officialfullname,_sit_programmeregistrationsid_value,sit_promocode&$filter=(_sit_programmeregistrationsid_value eq {0})&$orderby=sit_name asc";
    dataUri = dataUri.format(idVal);
    var response = await portalWebApiRetrieveData(dataUri);
    if (response.status == 200) {
        loadRegistrationParticipantsCallback(response.results);
    }
}

function loadRegistrationParticipantsCallback(results) {
    if (results && results.value && results.value.length) {
        participants = {};
        participants.usedSSGFunding = [];
        participants.data = results.value;
        for (var i = 0; i < results.value.length; i++) {
            participants[results.value[i].sit_registrationparticipantid] = results.value[i];
        }
    }
}


async function init() {
    top.document.title = "SITLEARN - Payment Summary";
    showloading();
    $('#idrunRedirectForm').click(function () {
        popupClose();
        showloading();
        setTimeout(async function () {
            await runRedirectForm();
            window.open('/ePayments/?invID=' + invoiceId + '&couID=' + idCourseVal + '&regID=' + idVal + '&payID=' + $('#lblsit_paymentid').val().replace(new RegExp('#'), ''));
            window.location.href = '/mycourses/?popup=1';
        }, 10);
    });
    var clicks = 0;
    $('#idPaymentSubmitFinal').click(function () {
        if (clicks == 0) {
            PaymentSubmitFinal();
        }
        ++clicks;
    });

    /* TeBS CR1924 Learn for Life Token Changes - Start */
    var buttonClicks = 0;
    $('#lflPaymentSubmitFinal').click(async function () {
        if (buttonClicks == 0) {
            $("#lflPaymentSubmitFinal").attr("disabled", true);
            var InsrtUpdatePaymentStatus = await InsertUpdatePaymentStatus();

            if (InsrtUpdatePaymentStatus) {
                /* TeBS CR2269 and CR2352 Changes - Start */
                //window.location.href = "/mycourses/";
                window.location.href = $("#thankYouPage").val();
                /* TeBS CR2269 and CR2352 Changes - End */
            }
            else {
                alert("Erro: Payment Status Not Update");
            }
        }
        ++buttonClicks;
    });
    /* TeBS CR1924 Learn for Life Token Changes - End */

    //commented on 12th Aug 2023 VAPT issue fix
    //$.when(loadRegistration(), retrieveFunding(idCourseVal), $("#lblRegistrationsType").val() != 'Self' && loadRegistrationParticipants()).done(function (data) {
    //    if (!data || !data.value || !data.value.length) {
    //        //window.location.href = "/access-denied/";
    //        return;
    //    }
    //    var obj = $('#lblSponsorship').val().toLowerCase() == "self-sponsored" ? UpdateUseSlcCreditRequestData() : "";
    //    var canUpdate = fromPage == undefined || fromPG && fromPG.replace('#', '') == "2";
    //    $.when(canUpdate && InsertUpdatePaymentProgress(obj),
    //        canUpdate && $('#lblSponsorship').val().toLowerCase() == "self-sponsored" && obj.sit_promocode == "" && processPromoCodeForSLCChange($('#lblsit_promocode').val())).done(function () {
    //            $('#lblsit_promocode').val() && obj.sit_promocode == "" && $('#lblsit_promocode').val("");
    //            pageLoad();
    //            showSFCUnSuccessDialog();
    //        }).fail(function () {
    //            hideloading();
    //        });
    //    }).fail(function () {
    //    hideloading();
    //});


    Promise.all([await loadRegistration(), await retrieveFunding(idCourseVal), $("#lblRegistrationsType").val() != 'Self' && await loadRegistrationParticipants()]).then(async function (data) {
        if (!data[0] || !data[0].value || !data[0].value.length) {
            //window.location.href = "/access-denied/";
            return;
        }

        /* TeBS CR1924 Learn for Life Token Changes - Start */
        var obj = {};
        if ($("#sit_enableslc").val() == "true") {
            obj = $('#lblSponsorship').val().toLowerCase() == "self-sponsored" ? UpdateUseSlcCreditRequestData() : "";
        }
        else {
            $('#sit_useslccredit').val(0);
            obj.sit_useslccredit = false;
            obj.sit_usedslcamount = 0.00;
            obj.sit_inslcblacklist = null;

            if ($('#lblsit_promocode').val()) {
                obj.sit_promocode = "";
            }
        }
        /* TeBS CR1924 Learn for Life Token Changes - End */

        var canUpdate = fromPage == undefined || fromPG && fromPG.replace('#', '') == "2";
        await Promise.all([canUpdate && InsertUpdatePaymentProgress(obj),
        canUpdate && $('#lblSponsorship').val().toLowerCase() == "self-sponsored" && obj.sit_promocode == "" && processPromoCodeForSLCChange($('#lblsit_promocode').val())]).then(async function () {
            $('#lblsit_promocode').val() && obj.sit_promocode == "" && $('#lblsit_promocode').val("");
            await pageLoad();
            await showSFCUnSuccessDialog();
        }).catch(function () {
            hideloading();
        });
    }).catch(function () {
        hideloading();
    });
}

async function showSFCUnSuccessDialog() {
    if (registrationInfo["sit_ssgfaild"] == "true" && !isUsedSFC()) {
        $("#sfcNotSuccessModal").show();
        var entityattributes = { sit_ssgfaild: false };
        //var url = "/_api/sit_registrations(" + idVal + ")"; //commented on 9th Jan 2024 VAPT Issue fix
        var url = "/_api/sit_registrations(" + idVal + ")?$select=sit_ssgfaild"; //added on 9th Jan 2024 VAPT Issue fix
        await portalWebApiUpdateData(url, JSON.stringify(entityattributes));
        //webApiUpdateFinalPromise({ sit_ssgfaild: false }, "sit_registrations", idVal, null, true); //commented on 12th Aug 2023 VAPT Issue fix
    }
}

//commented on 13th Aug 2023 VAPT Issue fix
//function showSFCUnSuccessDialog() {
//    if (registrationInfo["sit_ssgfaild"] == "true" && !isUsedSFC()) {
//        $("#sfcNotSuccessModal").show();
//        webApiUpdateFinalPromise({ sit_ssgfaild: false }, "sit_registrations", idVal, null, true);
//    }
//}

function cancelGoBack() {
    try {
        if (fromPG != undefined) {
            if (fromPG.replace('#', '') == "1") {
                var FD = GetParameterValues('FD');
                if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
                    if (fromPage == undefined) {
                        window.location.href = "/courseregistrationedit/?id=" + idVal + "&cid=" + idCourseVal + "&FD=" + FD + "&fromPG=" + fromPG;
                    }
                    else { window.location.href = "/mycourses/"; }
                }
                else {
                    var FD = GetParameterValues('FD');
                    if (fromPage == undefined) {
                        window.location.href = "/courseregistrationcorpedit/?id=" + idVal + "&cid=" + idCourseVal + "&FD=" + FD + "&fromPG=" + fromPG;
                    }
                    else { window.location.href = "/mycourses/"; }
                }
            } else {
                window.location.href = "/mycourses/";
            }
        } else {
            window.location.href = "/mycourses/";
        }
    }
    catch (err) {
        window.location.href = "/mycourses/";
    }
}

async function InsertPayments() {
    var resultStatus = false;
    try {
        var entity = {};
        //entity.sit_paymenttype = $('#PaymentMode').val(); //907700006;//$('#PaymentMode').val();
        entity.sit_paymentmode = 907700000; //$('#PaymentMode').val(); //907700000;
        entity.sit_payerid = registrationNumber;
        entity.sit_payername = $('#lblFirstname').val();
        entity.sit_acceptedpdpa = true;
        entity.sit_description = "SIT Online Payments";
        entity["sit_Invoice@odata.bind"] = "/invoices(" + invoiceId + ")";

        entity.sit_totalamount = Number(parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')).toFixed(4));
        entity["sit_Programme@odata.bind"] = "/sit_programmes(" + idCourseVal + ")";
        entity["sit_ProgrammeRegistrationId@odata.bind"] = "/sit_registrations(" + idVal + ")";
        /*addded on 14th Aug 2023 VAPT Issue fix*/
        //var url = "/_api/sit_payments";     //commented on 9th Jan 2024 VAPT  Issue fix
        var url = "/_api/sit_payments?$select=sit_paymentmode,sit_payerid,sit_payername,sit_acceptedpdpa,sit_description,sit_Invoice,sit_totalamount,sit_Programme,sit_ProgrammeRegistrationId";       //added on 9th Jan 2024 VAPT Issue fix
        var response = await portalWebApiCreateData(url, JSON.stringify(entity));
        //var currentRecordId = webApiCreatePromise(entity, "sit_payments", null, true); //commented on 14th Aug 2023 VAPT Issue fix
        var uri = response.newentityid;
        var regExp = /\(([^)]+)\)/;
        var matches = regExp.exec(uri);
        var newEntityId = matches[1];
        var currentRecordId = newEntityId;
        /*VAPT Issue fix end here*/
        if (currentRecordId.length > 0) {
            $('#lblsit_paymentid').val(currentRecordId);
            resultStatus = true;
        }
        else {
            resultStatus = false;
        }
    }
    catch (err) {
        alert("InsertPayments --- > " + err);
    }
    return resultStatus;
}

async function InsertUpdatePaymentStatus() {
    var resultStatus = false;
    try {

        if ($('#lblRegistrationstatus').val().toLowerCase() != "pending payment") {
            var entity1 = {};
            //if(parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',','')) > 0 )
            {
                if ($('#lblregistrationapprovalrequired').val() == "false") {
                    if (parseFloat(Math.abs($('#IDamtVal').val())) > 0) {
                        if (parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) == 0) {
                            entity1["sit_registrationstatus"] = 7;
                        } else {
                            entity1["sit_registrationstatus"] = 3;
                            $('#lblRegistrationstatus').val('pending payment');
                        }
                    }
                    else {
                        entity1["sit_registrationstatus"] = 3;
                        $('#lblRegistrationstatus').val('pending payment');
                        if (parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) == 0) {
                            entity1["sit_registrationstatus"] = 6;
                        }
                    }
                }
                else {
                    if (($('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "pending approval")
                        || ($('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "draft")) {
                        entity1["sit_registrationstatus"] = 2;
                    }
                    else if ($('#PaymentMode').val() == "907700001") {
                        if ($('#lblSponsorship').val().toLowerCase() != "self-sponsored") {
                            if (($('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "pending payment")) {
                                $('#lblRegistrationstatus').val('pending payment');
                            }
                        }
                    }
                    else {
                        if (parseFloat(Math.abs($('#IDamtVal').val())) > 0) {
                            if (parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) == 0) {
                                entity1["sit_registrationstatus"] = 7;
                            }
                            else {
                                if (($('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "pending payment")) {
                                    $('#lblRegistrationstatus').val('pending payment');
                                } else {
                                    entity1["sit_registrationstatus"] = 2;
                                }
                            }
                        } else {
                            if (($('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "pending payment")) {
                                $('#lblRegistrationstatus').val('pending payment');
                            } else {
                                entity1["sit_registrationstatus"] = 2;
                            }
                        }
                    }
                }
            }
            if ($('#PaymentMode').val() == "907700001") {
                entity1["sit_paymentmethod"] = 907700001;
            }
            entity1["sit_registrationdatetime"] = new Date().toISOString();
            //var recordResponse11 = webApiUpdateFinalPromise(entity1, "sit_registrations", idVal, null, true); //commented on 13th Aug 2023 VAPT Issue fix
            //var url = "/_api/sit_registrations(" + idVal + ")"; //commented on 9th Jan 2024 VAPT Issue fix
            var url = "/_api/sit_registrations(" + idVal + ")?$select=sit_registrationstatus,sit_paymentmethod,sit_registrationdatetime"; //added on 9th Jan 2024 VAPT Issue fix
            var recordResponse11 = await portalWebApiUpdateData(url, JSON.stringify(entity1));
            if (recordResponse11.status === 204) {
                resultStatus = true;
                if ($("#sit_uselearntoken").val() == "1") {
                    await updateContactLFLTokenUsage();
                }
            }
            else {
                resultStatus = false;
            }
        }
        else {
            {
                if (parseFloat(Math.abs($('#IDamtVal').val())) > 0) {
                    if (parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) == 0 && parseFloat(Math.abs($('#IDamtVal').val())) == parseFloat(Math.abs(totalAmtFinal))) {
                        var entity1 = {};
                        entity1["sit_registrationstatus"] = 7;
                        if ($('#PaymentMode').val() == "907700001") {
                            entity1["sit_paymentmethod"] = 907700001;
                        }
                        entity1["sit_registrationdatetime"] = new Date().toISOString();
                        //var url = "/_api/sit_registrations(" + idVal + ")"; //commented on 9th Jan 2024 VAPT Issue fix
                        var url = "/_api/sit_registrations(" + idVal + ")?$select=sit_registrationstatus,sit_paymentmethod,sit_registrationdatetime"; //added on 9th Jan 2024 VAPT Issue fix
                        //var recordResponse11 = webApiUpdateFinalPromise(entity1, "sit_registrations", idVal, null, true);
                        var recordResponse11 = await portalWebApiUpdateData(url, JSON.stringify(entity1));
                        if (recordResponse11.status == 204) {
                            resultStatus = true;
                        }
                        else {
                            resultStatus = false;
                        }
                    }
                }
            }
            resultStatus = true;
        }
    }
    catch (err) {
        resultStatus = false;
        alert("InsertUpdatePaymentStatus --- > " + err);
    }
    return resultStatus;
}

async function InsertUpdatePaymentProgress(obj) {
    var entity1 = {};
    if (obj) {
        entity1 = obj;
    }
    entity1["sit_invoiceprogress"] = 907700001;
    //var url = "/_api/sit_registrations(" + idVal + ")"; //commented on 9th Jan 2024 VAPT Issue fix
    var url = "/_api/sit_registrations(" + idVal + ")?$select=sit_invoiceprogress"; //added on 9th Jan 2024 VAPT Issue fix
    //return webApiUpdateFinalPromise(entity1, "sit_registrations", idVal);
    var response = await portalWebApiUpdateData(url, JSON.stringify(entity1));
}

function isproformainvoice() {
    var result = 0;
    if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored" && parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) == 0
        && (!$('#IDamtVal')[0] || parseFloat(Math.abs($('#IDamtVal').val())) <= 0)) {
        result = 1;
    } else if ($('#lblregistrationapprovalrequired').val() != "true"
        || $('#lblSponsorship').val().toLowerCase() == "self-sponsored"
        || $('#PaymentMode').val() != 907700001) {
        result = 2;
    }
    return result;
}

async function UpdateInvoicePerforma() {
    var resultStatus = false;
    try {
        var entityInvoice = {}; //Ravi
        if (($('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "pending approval")
            || ($('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "draft")) {
        } else {
            if (invoiceData["statuscode"] == "907700001" && !invoiceData["sit_isproformainvoice"]) {
                var isproformainvoiceResult = isproformainvoice();
                if (isproformainvoiceResult == 1) {
                    entityInvoice.sit_paidamount = 0;
                } else if (isproformainvoiceResult == 2) {
                    entityInvoice.sit_isproformainvoice = true;
                }
                entityInvoice.statuscode = 1;
                // Start Registration Update
                if ($('#PaymentMode').val() == 907700001) {
                    var entity1 = {};
                    entity1.sit_paymentmethod = "907700001";
                    //var recordResponse11 = webApiUpdateFinalPromise(entity1, "sit_registrations", idVal, null, true); //commented on 13th Aug 2023 VAPT Issue fix
                    // var url = "/_api/sit_registrations(" + idVal + ")"; //commented on 9th Jan 2024 VAPT Issue fix
                    var url = "/_api/sit_registrations(" + idVal + ")?$select=sit_paymentmethod"; //added on 9th Jan 2024 VAPT Issue fix
                    var recordResponse11 = await portalWebApiUpdateData(url, JSON.stringify(entity1));
                }
                else {
                    var entity1 = {};
                    entity1.sit_paymentmethod = "907700000";
                    //var recordResponse11 = webApiUpdateFinalPromise(entity1, "sit_registrations", idVal, null, true); //commented on 13th Aug 2023 VAPT Issue fix
                    //var url = "/_api/sit_registrations(" + idVal + ")";//commented on 9th Jan 2024 VAPT Issue fix
                    var url = "/_api/sit_registrations(" + idVal + ")?$select=sit_paymentmethod"; //added on 9th Jan 2024 VAPT Issue fix
                    var recordResponse11 = await portalWebApiUpdateData(url, JSON.stringify(entity1));
                }
            }
        }
        entityInvoice.sit_approvalstatus = 1;
        // entityInvoice.datedelivered = new Date().toISOString(); Commented on 27-08-2019 to stop Invoice due dae update multiple time
        if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
        }
        if ($('#lblRegistrationstatus').val().toLowerCase() != "pending payment"
            && $('#lblregistrationapprovalrequired').val() == "false"
            && (!$('#IDamtVal')[0] || parseFloat(Math.abs($('#IDamtVal').val())) <= 0)
            && parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) == 0) {
            entityInvoice.statecode = 2;
            entityInvoice.statuscode = 100001;
        }

        //var recordResponse11 = webApiUpdateFinalPromise(entityInvoice, "invoices", invoiceId, null, true); commented on 13th Aug 2023 VAPT Issue fix
        //var url1 = "/_api/invoices(" + invoiceId + ")"; //commented on 9th Jan 2024 VAPT Issue fix
        var url1 = "/_api/invoices(" + invoiceId + ")?$select=sit_paidamount,sit_isproformainvoice,statuscode,sit_approvalstatus,statecode"; //added on 9th Jan 2024 VAPT Issue fix
        var recordResponse11 = await portalWebApiUpdateData(url1, JSON.stringify(entityInvoice));
        if (recordResponse11.status === 204) {
            resultStatus = true;
        }
    }
    catch (err) {
        resultStatus = false;
    }
    return resultStatus;
}

var blnsubmitStatus = false;
async function PaymentSubmitFinal() {
    try {
        if (!blnsubmitStatus) {
            blnsubmitStatus = true;
            $("#idPaymentSubmitFinal").attr("disabled", true);
            var updateinvperforma = await UpdateInvoicePerforma();
            //if (!UpdateInvoicePerforma()) //commented on 13th Aug 2023 VAPT Issue fix
            if (!updateinvperforma) {
                alert("Erro: Invoice Perform Not Update");
            }
            var InsrtUpdatePaymentStatus = await InsertUpdatePaymentStatus();
            //if (InsertUpdatePaymentStatus()) //commented on 13th Aug 2023 VAPT Issue fix
            if (InsrtUpdatePaymentStatus) {
                /* TeBS CR2269 and CR2352 Changes - Start */
                //window.location.href = "/mycourses/";
                window.location.href = $("#thankYouPage").val();
                /* TeBS CR2269 and CR2352 Changes - End */
            }
            else {
                alert("Erro: Payment Status Not Update");
            }
            blnsubmitStatus = false;
        }
    }
    catch (err) {
        alert("PaymentSubmitFinal --- > " + err);
    }
}

/*function retrieveInvoice(regID) {
    var dataUri = "/api/data/v8.2/invoices?$select=sit_newslcinvoice,invoiceid,invoicenumber,name,sit_name,sit_isproformainvoice,statuscode&$filter=_sit_registration_value eq " + regID;
    if (fromPage == undefined) {
        dataUri += " and statuscode eq 907700001&$orderby=createdon desc";
    } else if (fromPage == "1") {
        dataUri += " &$orderby=createdon desc";
    } else {
        return;
    }
    return retrieveDataPromise(dataUri);
}*/

async function retrieveInvoice(regID) {
    var dataUri = "/_api/invoices?$select=sit_newslcinvoice,invoiceid,invoicenumber,name,sit_name,sit_isproformainvoice,statuscode&$filter=_sit_registration_value eq " + regID;
    if (fromPage == undefined) {
        dataUri += " and statuscode eq 907700001&$orderby=createdon desc";
    } else if (fromPage == "1") {
        dataUri += " &$orderby=createdon desc";
    } else {
        return;
    }
    var response = await portalWebApiRetrieveData(dataUri);
    if (response.status == 200) {
        return response.results;
    }
    else {
        return null;
    }
}

async function pageLoad(callback) {
    /* TeBS CR1231 Changes - Remove Execution Paticipant Limit Start */
    var canUpdate = fromPage == undefined || fromPG && fromPG.replace('#', '') == "2";
    if ($('#lblSponsorship').val().toLowerCase() == "company-sponsored" && canUpdate) {
        /* TeBS iTrack 0015427 Changes - Start */
        var processedparticipants = 0;
        /* TeBS iTrack 0015427 Changes - End */
        //TeBS iTrack 0013040 Changes - Added Statecode = 0(active) check
        //var regDataUri = "/api/data/v9.2/sit_registrationparticipants?$select=sit_registrationparticipantid&$filter=(_sit_programmeregistrationsid_value eq " + idVal + ")&$orderby=sit_name asc";
        var regDataUri = "/_api/sit_registrationparticipants?$select=sit_registrationparticipantid&$filter=(statecode eq 0 and _sit_programmeregistrationsid_value eq " + idVal + ")&$orderby=sit_name asc";
        //var regParticipantsColl = retrieveDataPromise(regDataUri, null, true);
        var regParticipantsColl = await portalWebApiRetrieveData(regDataUri);

        if (regParticipantsColl && regParticipantsColl.results && regParticipantsColl.results.value && regParticipantsColl.results.value.length > 0) {
            regparticipants = regParticipantsColl.results.value.length;
        }

        /* TeBS iTrack T04948 Changes - Start */
        /* TeBS iTrack 0015427 Changes - Added Length Check - Start */
        //if ($("#mydiv div h3").length == 0) {
        //    $("#mydiv div").append("<h3 style='margin-top: -80px;'>Processing... (<span id='processedparticipants'>0</span>/<span>" + regparticipants + "</span>)</h3>");
        //}
        /* TeBS iTrack 0015427 Changes - End */
        if ($("#loadingdiv div h3").length == 0) {
            $("#loadingdiv div").append("<h3 style='margin-top: -80px;'>Processing... (<span id='processedparticipants'>0</span>/<span>" + regparticipants + "</span>)</h3>");
        }
        /* TeBS iTrack T04948 Changes - End */
    }
    else {
        regparticipants = 1;
    }

    /* TeBS CR1231 Changes - Remove Execution Paticipant Limit End */
    //$.when(retrieveInvoice(idVal)).done(function (data) {
    //    invoiceData = data.value[0];
    //    /* TeBS CR1231 Changes - Remove Execution Paticipant Limit Start */
    //    loadInvoiceDetails(callback, invoiceData, canUpdate);

    //    /*$.when(retriveveInvoiceDetails(invoiceData["invoicenumber"]),
    //        $('#lblSponsorship').val().toLowerCase() == "self-sponsored" && retrieveSFCBaseInfo(idCourseVal, invoiceData["sit_newslcinvoice"])).done(function (detail) {
    //            if (detail && detail.value && detail.value.length) {
    //                detail = detail.value;
    //                existingUsingSLC = false;
    //                invoiceDetailCallback(detail, invoiceData);
    //                if (callback) {
    //                    callback();
    //                }
    //                if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
    //                    displayAdminFeeDescription();
    //                    calcuateSFCMaxValue(idCourseVal, detail, invoiceData["sit_newslcinvoice"]);
    //                    if (isUsedSFC() && usedSFCAmount() > sfcMaxValue) {
    //                        $(".sfcMaxAmountTxt").text('$ ' + addSeperator(sfcMaxValue.toFixed(2)));
    //                        $("#sfcAmountInvalidModal").show();
    //                        $(".tablepaymentsummbottom a").hide();
    //                        $(".cancel").show();
    //                    } else if ((!isUsedSFC() || $('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "pending payment") && sfcMaxValue <= 0) {
    //                        $(".sfctr").hide();
    //                    }
    //                }
    //            }
    //            hideloading();
    //        }).fail(function () {
    //            hideloading();
    //        });*/
    //    /* TeBS CR1231 Changes - Remove Execution Paticipant Limit End */
    //}).fail(function () {
    //    hideloading();
    //});

    Promise.all([await retrieveInvoice(idVal)]).then(async function (data) {
        if (!data[0] || !data[0].value || !data[0].value.length) {
            hideloading();
            return;
        }
        invoiceData = data[0].value[0];
        await loadInvoiceDetails(callback, invoiceData, canUpdate, processedparticipants);
    }).catch(function () {
        hideloading();
    });
}

/* TeBS CR1231 Changes - Remove Execution Paticipant Limit Start */
async function retrieveInvoiceProcessedParticipants(invoiceId) {
    //var invoiceDataUri = "/api/data/v9.2/invoices(" + invoiceId + ")?$select=sit_noofprocessedparticipants"; //commented on 14th Aug 2023 VAPT Issue fix
    //var invoiceRecord = retrieveDataPromise(invoiceDataUri, null, true);
    /* updating the portal chache field in CRM VAPT Issue fix*/
    var entity = {};
    entity["sit_sitlearn_portal_chache"] = true;
    //var url = "/_api/invoices(" + invoiceId + ")"; //commented on 9th Jan 2023 VAPT 
    var url = "/_api/invoices(" + invoiceId + ")?$select=sit_sitlearn_portal_chache"; //added on 9th Jan VAPT 
    var invoiceupdateres = await portalWebApiUpdateData(url, JSON.stringify(entity));
    if (invoiceupdateres.status == 204) {
        var invoiceDataUri = "/_api/invoices(" + invoiceId + ")?$select=sit_noofprocessedparticipants";
        var invoiceResponse = await portalWebApiRetrieveData(invoiceDataUri);
        var invoiceRecord = invoiceResponse.results;
        if (invoiceRecord != null) {
            processedparticipants = invoiceRecord.sit_noofprocessedparticipants != null ? invoiceRecord.sit_noofprocessedparticipants : 0;
        }

    }
    else {
        alert("portal chache is not cleared");
    }

    return processedparticipants;
}

/*async function retrieveInvoiceProcessedParticipants(invoiceId) {
    var invoiceDataUri = "/_api/invoices(" + invoiceId + ")?$select=sit_noofprocessedparticipants";
    var invoiceResponse = await portalWebApiRetrieveData(invoiceDataUri);

    if (invoiceResponse && invoiceResponse.results) {
        invoiceRecord = invoiceResponse.results;
        processedparticipants = invoiceRecord.sit_noofprocessedparticipants != null ? invoiceRecord.sit_noofprocessedparticipants : 0;
    }

    return processedparticipants;
}*/

async function loadInvoiceDetails(callback, invoiceData, canUpdate, processedparticipants) {
    processedparticipants = await retrieveInvoiceProcessedParticipants(invoiceData["invoiceid"]);
    if ($('#lblSponsorship').val().toLowerCase() == "company-sponsored") {
        $("#processedparticipants").text(processedparticipants);
    }

    if (processedparticipants == regparticipants || !canUpdate) {
        //commented on 13th Aug 2023 VAPT Issue fix
        //$.when(retriveveInvoiceDetails(invoiceData["invoicenumber"]),
        //    $('#lblSponsorship').val().toLowerCase() == "self-sponsored" && retrieveSFCBaseInfo(idCourseVal, invoiceData["sit_newslcinvoice"])).done(function (detail) {
        //        if (detail && detail.value && detail.value.length) {
        //            detail = detail.value;
        //            existingUsingSLC = false;
        //            invoiceDetailCallback(detail, invoiceData);
        //            if (callback) {
        //                callback();
        //            }
        //            /* TeBS CR1231 Changes - Remove Execution Paticipant Limit End */
        //            if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
        //                displayAdminFeeDescription();
        //                calcuateSFCMaxValue(idCourseVal, detail, invoiceData["sit_newslcinvoice"]);
        //                if (isUsedSFC() && usedSFCAmount() > sfcMaxValue) {
        //                    $(".sfcMaxAmountTxt").text('$ ' + addSeperator(sfcMaxValue.toFixed(2)));
        //                    $("#sfcAmountInvalidModal").show();
        //                    $(".tablepaymentsummbottom a").hide();
        //                    $(".cancel").show();
        //                } else if ((!isUsedSFC() || $('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "pending payment") && sfcMaxValue <= 0) {
        //                    $(".sfctr").hide();
        //                }
        //            }
        //        }
        //        hideloading();
        //    }).fail(function () {
        //        hideloading();
        //    });

        await Promise.all([retriveveInvoiceDetails(invoiceData["invoicenumber"]),
        $('#lblSponsorship').val().toLowerCase() == "self-sponsored" && retrieveSFCBaseInfo(idCourseVal, invoiceData["sit_newslcinvoice"])]).then(function (detail) {
            if (detail[0] && detail[0].value && detail[0].value.length) {
                detail = detail[0].value;
                existingUsingSLC = false;
                /* TeBS CR1924 Learn for Life Token Changes - Start */
                existingUsingLFL = false;
                /* TeBS CR1924 Learn for Life Token Changes - End */
                invoiceDetailCallback(detail, invoiceData);
                if (callback) {
                    callback();
                }
                /* TeBS CR1231 Changes - Remove Execution Paticipant Limit End */
                if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
                    displayAdminFeeDescription();
                    calcuateSFCMaxValue(idCourseVal, detail, invoiceData["sit_newslcinvoice"]);
                    if (isUsedSFC() && usedSFCAmount() > sfcMaxValue) {
                        $(".sfcMaxAmountTxt").text('$ ' + addSeperator(sfcMaxValue.toFixed(2)));
                        $("#sfcAmountInvalidModal").show();
                        $(".tablepaymentsummbottom a").hide();
                        $(".cancel").show();
                    } else if ((!isUsedSFC() || $('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "pending payment") && sfcMaxValue <= 0) {
                        $(".sfctr").hide();
                    }
                }
            }

            /* TeBS iTrack 0015427 Changes - Removing Processing Message - Start */
            $("#processedparticipants").closest("h3").remove();
            /* TeBS iTrack 0015427 Changes - End */

            hideloading();
        }).catch(function () {
            /* TeBS iTrack 0015427 Changes - Removing Processing Message - Start */
            $("#processedparticipants").closest("h3").remove();
            /* TeBS iTrack 0015427 Changes - End */

            hideloading();
        });
    }
    else {
        setTimeout(async function () {
            if (processedparticipants < regparticipants) {
                await loadInvoiceDetails(callback, invoiceData, canUpdate, processedparticipants);
            }
        }, 2000);
    }
}
/* TeBS CR1231 Changes - Remove Execution Paticipant Limit End */

//commented on 13th Aug 2023 VAPT Issue fix
//function retriveveInvoiceDetails(invoiceNumber) {
//    var appXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>";
//    appXml += "  <entity name='invoicedetail'>";
//    appXml += "    <all-attributes />";
//    appXml += "    <order attribute='sequencenumber' descending='false' />";
//    appXml += "    <link-entity name='invoice' from='invoiceid' to='invoiceid' link-type='inner' alias='ab'>";
//    appXml += "    <attribute name='totallineitemamount' />";
//    appXml += "    <filter type='and'>";
//    appXml += "    <condition attribute='invoicenumber' operator='eq'  value='" + invoiceNumber + "' />";
//    appXml += "    </filter>";
//    appXml += "    </link-entity>";
//    appXml += "  </entity>";
//    appXml += "</fetch>";
//    return retrieveDataFetchPromise("invoicedetails", appXml);
//}

async function retriveveInvoiceDetails(invoiceNumber) {
    var res = "";
    var appXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>";
    appXml += "  <entity name='invoicedetail'>";
    appXml += "    <all-attributes />";
    appXml += "    <order attribute='sequencenumber' descending='false' />";
    appXml += "    <link-entity name='invoice' from='invoiceid' to='invoiceid' link-type='inner' alias='ab'>";
    appXml += "    <attribute name='totallineitemamount' />";
    appXml += "    <filter type='and'>";
    appXml += "    <condition attribute='invoicenumber' operator='eq'  value='" + invoiceNumber + "' />";
    appXml += "    </filter>";
    appXml += "    </link-entity>";
    appXml += "  </entity>";
    appXml += "</fetch>";
    //return retrieveDataFetchPromise("invoicedetails", appXml);
    entity = "invoicedetails";
    var url = "/_api/" + entity + "?fetchXml=" + encodeURIComponent(appXml);
    var response = await portalWebApiRetrieveData(url);
    if (response.status === 200) {
        res = response.results;
    }
    else if (response.status === 401) {
        if (!noRetry) {
            sessionStorage.removeItem("token_sitlearn");
            response = await portalWebApiRetrieveData(url);
            res = response.results;
        }
    }
    else {
        alert("Error " + response.statustext);
    }
    return res;
}

function invoiceDetailCallback(appCycleResult, invoiceData) {
    var skillfutuStatus = false;
    var PaymentHTMLVal = '<table  class="table table-hover datatable tablepayment tablepaymentsumm"><thead><tr><th class="Firsttd">Description</th><th class="Secondtd">Amount (SGD)</th></tr></thead><tbody id="paymentID">';
    if (appCycleResult && appCycleResult.length > 0) {
        var i;
        if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
            var i;
            var CombinedVal = '';
            for (i = 0; i < appCycleResult.length; i++) {
                var appCycleValue = appCycleResult[i];
                if (!usedSSGFunding && isSSGFunding(appCycleValue)) {
                    usedSSGFunding = true;
                }
                if (!hasAdminFeelineItem && appCycleValue["_sit_adminfeeforcoa_value"]) {
                    hasAdminFeelineItem = true;
                }

                /* TeBS CR1924 Learn for Life Token Changes - Start */
                if ($("#sit_enableslc").val() == "true") {
                    if (!hasslclineItem && appCycleValue["_sit_slcforcoa_value"]) {
                        hasslclineItem = true;
                    }
                }
                /* TeBS CR1924 Learn for Life Token Changes - End */

                totalAmtFinal = appCycleValue["ab.totallineitemamount"];
                var feetypeVal = appCycleValue["sit_feetype"];
                var registrationparticipantVal = appCycleValue["_sit_registrationparticipant_value"];
                invoiceId = appCycleValue["_invoiceid_value"];
                var combinedStatus = false;
                var filteredNames = $(appCycleResult).filter(function (idx) {
                    return feetypeVal === "Fee Applicable for Grant (combined)" && appCycleResult[idx].sit_feetype === "Fee Applicable for Grant (combined)" && parseFloat(appCycleResult[idx].extendedamount) > 0;
                });
                if (feetypeVal == "Fee Not Applicable for Grant (Combined)") {
                    filteredNames = $(appCycleResult).filter(function (idx) {
                        return feetypeVal === "Fee Not Applicable for Grant (Combined)" && appCycleResult[idx].sit_feetype === "Fee Not Applicable for Grant (Combined)" && parseFloat(appCycleResult[idx].extendedamount) > 0;
                    });
                }

                var combinedVal = 0;
                var feeNames = "";
                if (filteredNames.length >= 2) {
                    for (j = 0; j < filteredNames.length; j++) {
                        combinedVal += parseFloat(filteredNames[j]["extendedamount"]);
                        if (j == 0) { feeNames = filteredNames[j]["productdescription"] }
                        else if (j == filteredNames.length - 1) { feeNames += " & " + filteredNames[j]["productdescription"] }
                        else { feeNames += ", " + filteredNames[j]["productdescription"] }
                    }
                    {
                    }

                    if (filteredNames.length >= 2) {
                        if (CombinedVal.indexOf(registrationparticipantVal + ":" + feetypeVal) > -1) {
                            combinedStatus = true;
                        }
                        else {
                            CombinedVal += registrationparticipantVal + ":" + feetypeVal + "@";
                        }
                    }

                    if ((i + 1) < (appCycleResult.length)) {
                        //Fee Not Applicable for Grant(Combined)
                        if (appCycleResult[0]["sit_feetype"] == appCycleResult[i + 1]["sit_feetype"] && appCycleResult[0]["sit_feetype"] == "Fee Applicable for Grant (combined)") {
                            i++;
                        }
                        if (appCycleResult[i]["sit_feetype"] == appCycleResult[i + 1]["sit_feetype"] && appCycleResult[i]["sit_feetype"] == "Fee Not Applicable for Grant (Combined)") {
                            i++;
                        }
                    }
                }

                /* TeBS CR1924 Learn for Life Token Changes - Start */
                if ($("#sit_enableslc").val() == "true") {
                    if (appCycleValue["productdescription"] == "Less: SITizens Learning Credit (SLC)") {
                        PaymentHTMLVal += loadSLC();
                    }
                }

                if (appCycleValue["productdescription"] == "Less: " + sessionStorage["lfl_funding_title"]) {
                    PaymentHTMLVal += loadLFLToken();
                }
                /* TeBS CR1924 Learn for Life Token Changes - End */

                if (appCycleValue["productdescription"] == "Less : SkillsFuture Credit") {
                }
                else if (combinedStatus == true) { }
                else {
                    PaymentHTMLVal += '<tr>';
                    if (feetypeVal == "Fee Not Applicable for Grant (Combined)") {
                        if (feeNames == "") { feeNames = appCycleValue["productdescription"]; }
                        PaymentHTMLVal += '<td class="Firsttd">' + feeNames + '</td>';
                    } else {
                        PaymentHTMLVal += '<td class="Firsttd">' + appCycleValue["productdescription"] + '</td>';
                    }

                    if (i == 0) {
                        if (filteredNames.length >= 2) {
                            PaymentHTMLVal += '<td class="Secondtd" id="paySummaryID' + i + '">$ ' + addSeperator(Number(parseFloat(combinedVal)).toFixed(2)) + ' </td>';
                        }
                        else {
                            PaymentHTMLVal += '<td class="Secondtd" id="paySummaryID' + i + '">$ ' + addSeperator(Number(parseFloat(appCycleValue["extendedamount"])).toFixed(2)) + ' </td>';
                        }
                    }
                    else {
                        if (parseFloat(appCycleValue["extendedamount"]) < 0) {
                            PaymentHTMLVal += '<td class="Secondtd" id="paySummaryID' + i + '">($ ' + addSeperator(Number(Math.abs(parseFloat(appCycleValue["extendedamount"]))).toFixed(2)) + ' )</td>';
                        }
                        else {
                            if (filteredNames.length >= 2) {
                                PaymentHTMLVal += '<td class="Secondtd" id="paySummaryID' + i + '">$ ' + addSeperator(Number(parseFloat(combinedVal)).toFixed(2)) + ' </td>';
                            }
                            else {
                                PaymentHTMLVal += '<td class="Secondtd" id="paySummaryID' + i + '">$ ' + addSeperator(Number(parseFloat(appCycleValue["extendedamount"])).toFixed(2)) + ' </td>';
                            }
                        }
                    }
                }
                PaymentHTMLVal += '</tr>';
            }
        }
        else {
            var i;
            var CombinedVal = '';
            for (i = 0; i < appCycleResult.length; i++) {
                var appCycleValue = appCycleResult[i];
                totalAmtFinal = appCycleValue["ab.totallineitemamount"];
                var feetypeVal = appCycleValue["sit_feetype"];
                var registrationparticipantVal = appCycleValue["_sit_registrationparticipant_value"];
                var combinedStatus = false;
                if (participants && $.inArray(registrationparticipantVal, participants.usedSSGFunding) < 0 && isSSGFunding(appCycleValue)) {
                    participants.usedSSGFunding.push(registrationparticipantVal);
                }
                invoiceId = appCycleValue["_invoiceid_value"];
                var filteredNames = $(appCycleResult).filter(function (idx) {
                    return feetypeVal === "Fee Applicable for Grant (combined)" && appCycleResult[idx].sit_feetype === "Fee Applicable for Grant (combined)" && appCycleResult[idx]._sit_registrationparticipant_value === registrationparticipantVal && parseFloat(appCycleResult[idx].extendedamount) > 0;
                });
                if (feetypeVal == "Fee Not Applicable for Grant (Combined)") {
                    filteredNames = $(appCycleResult).filter(function (idx) {
                        return feetypeVal === "Fee Not Applicable for Grant (Combined)" && appCycleResult[idx].sit_feetype === "Fee Not Applicable for Grant (Combined)" && appCycleResult[idx]._sit_registrationparticipant_value === registrationparticipantVal && parseFloat(appCycleResult[idx].extendedamount) > 0;
                    });
                }
                var combinedVal = 0;
                var feeNames = "";
                if (filteredNames.length >= 2) {
                    for (j = 0; j < filteredNames.length; j++) {
                        combinedVal += parseFloat(filteredNames[j]["extendedamount"]);
                        if (j == 0) { feeNames = filteredNames[j]["productdescription"] }
                        else if (j == filteredNames.length - 1) { feeNames += " & " + filteredNames[j]["productdescription"] }
                        else { feeNames += ", " + filteredNames[j]["productdescription"] }
                    }
                }
                if (filteredNames.length >= 2) {
                    if (CombinedVal.indexOf(registrationparticipantVal + ":" + feetypeVal) > -1) {
                        combinedStatus = true;
                    }
                    else {
                        CombinedVal += registrationparticipantVal + ":" + feetypeVal + "@";
                    }
                }
                if (i == 0 || appCycleResult[i - 1]._sit_registrationparticipant_value != appCycleResult[i]._sit_registrationparticipant_value) {
                    if (participants && participants[registrationparticipantVal]) {
                        var appCycleResultPart = participants[registrationparticipantVal];
                        if (appCycleResultPart["sit_promocode"]) {
                            $('#lblsit_promocode').val(appCycleResultPart["sit_promocode"]);
                        }
                        PaymentHTMLVal += '<tr><td class="Firsttd">' + appCycleResultPart["sit_officialfullname"] + '</td><td class="Secondtd"></td></tr>';
                    }
                }

                if (filteredNames.length >= 2) {
                    if ((i + 1) < (appCycleResult.length)) {
                        if (appCycleResult[0]["sit_feetype"] == appCycleResult[i + 1]["sit_feetype"] && appCycleResult[0]["sit_feetype"] == "Fee Applicable for Grant (combined)" && appCycleResult[i]._sit_registrationparticipant_value == registrationparticipantVal) {
                            i++;
                        }
                        if (appCycleResult[0]["sit_feetype"] == appCycleResult[i + 1]["sit_feetype"] && appCycleResult[0]["sit_feetype"] == "Fee Not Applicable for Grant (Combined)" && appCycleResult[i]._sit_registrationparticipant_value == registrationparticipantVal) {
                            i++;
                        }
                    }
                }
                if (appCycleValue["productdescription"] == "Less : SkillsFuture Credit") {
                }
                else if (combinedStatus) {
                }
                else {
                    PaymentHTMLVal += '<tr>';
                    if (feetypeVal == "Fee Not Applicable for Grant (Combined)") {
                        if (feeNames == "") { feeNames = appCycleValue["productdescription"]; }
                        PaymentHTMLVal += '<td class="Firsttd">' + feeNames + '</td>';
                    } else { PaymentHTMLVal += '<td class="Firsttd">' + appCycleValue["productdescription"] + '</td>'; }

                    if (i == 0) {
                        if (filteredNames.length >= 2) {
                            PaymentHTMLVal += '<td class="Secondtd" id="paySummaryID' + i + '">$ ' + addSeperator(Number(parseFloat(combinedVal)).toFixed(2)) + ' </td>';
                        } else {
                            PaymentHTMLVal += '<td class="Secondtd" id="paySummaryID' + i + '">$ ' + addSeperator(Number(parseFloat(appCycleValue["extendedamount"])).toFixed(2)) + ' </td>';
                        }
                    }
                    else {
                        if (parseFloat(appCycleValue["extendedamount"]) < 0) {
                            PaymentHTMLVal += '<td class="Secondtd" id="paySummaryID' + i + '">($ ' + addSeperator(Number(Math.abs(parseFloat(appCycleValue["extendedamount"]))).toFixed(2)) + ' )</td>';
                        }
                        else {
                            if (filteredNames.length >= 2) {
                                PaymentHTMLVal += '<td class="Secondtd" id="paySummaryID' + i + '">$ ' + addSeperator(Number(parseFloat(combinedVal)).toFixed(2)) + ' </td>';
                            }
                            else {
                                PaymentHTMLVal += '<td class="Secondtd" id="paySummaryID' + i + '">$ ' + addSeperator(Number(parseFloat(appCycleValue["extendedamount"])).toFixed(2)) + ' </td>';
                            }
                        }
                    }
                }
                PaymentHTMLVal += '</tr>';
            }
        }
        if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
            /* TeBS CR1924 Learn for Life Token Changes - Start */
            if ($("#sit_enableslc").val() == "true") {
                if ($('#sit_uselearntoken').val() == 0) {
                    PaymentHTMLVal += loadSLC();
                }
            }

            PaymentHTMLVal += loadLFLToken();
            /* TeBS CR1924 Learn for Life Token Changes - End */
            PaymentHTMLVal += loadSFC();
			/* TeBS CR3364 Alumini Campain - Start */
			 var isAlumni = $("#sit_sitalumni").val() == 'true';
			
            if ((!usedSSGFunding || isAlumni) && $("#sit_uselearntoken").val() != 1) {
                PaymentHTMLVal += '<tr class="promocode">' + loadPromoCode() + '</tr>';
            }
			/* TeBS CR3364 Alumini Campain - End */
            PaymentHTMLVal += '<tr><td class="Firsttd bold">Total Amount Payable</td><td class="Secondtd bold" id="tdTotal"></td></tr>';
            if ($("#lblregistrationapprovalrequired").val() == "true" && $("#lblRegistrationstatus").val() != "Draft"
                || $("#lblregistrationapprovalrequired").val() == "false") {
                PaymentHTMLVal += '<tr><td class="Firsttd">Payment Mode</td><td class="Secondtd"><select  id="PaymentMode" name="sit_paymenttype">';
                PaymentHTMLVal += '<option value="907700000">Online</option></select></td></tr>';
            }
        }
        else if ($('#lblSponsorship').val().toLowerCase() == "company-sponsored") {
            $('#lblapprovalMsg').hide();
            if ($('#lblregistrationapprovalrequired').val() == "true"
                && ($('#lblRegistrationstatus').val().toLowerCase() == "pending approval" || $('#lblRegistrationstatus').val().toLowerCase() == "draft")) {
                $('#lblapprovalMsg').show();
            }
			/* TeBS CR3364 Alumini Campain - Start */
			var isAlumni = $("#sit_sitalumni").val() == 'true';
			if (participants.usedSSGFunding.length != participants.data.length || isAlumni) {
                PaymentHTMLVal += '<tr class="promocode">' + loadPromoCode() + '</tr>';
            }
			/* TeBS CR3364 Alumini Campain - Start */
            PaymentHTMLVal += '<tr><td class="Firsttd bold">Total Amount Payable</td><td class="Secondtd bold" id="tdTotal"></td></tr>';
            if ($("#lblregistrationapprovalrequired").val() == "true" && $("#lblRegistrationstatus").val() != "Draft"
                || $("#lblregistrationapprovalrequired").val() == "false" && $("#lblRegistrationstatus").val() == "Pending Payment") {
                PaymentHTMLVal += '<tr><td class="Firsttd">Payment Mode</td><td class="Secondtd"><select onchange="PaymentModeChanges(this);"  id="PaymentMode" name="sit_paymenttype">';
                PaymentHTMLVal += '<option value="907700000">Online</option></select></td></tr>';
            } else if ($("#lblregistrationapprovalrequired").val() == "false" && $("#lblRegistrationstatus").val() == "Draft"
                && invoiceData["statuscode"] == "907700001" && !invoiceData["sit_isproformainvoice"]) {
                PaymentHTMLVal += '<tr><td class="Firsttd">Payment Mode</td><td class="Secondtd"><select onchange="PaymentModeChanges(this);"  id="PaymentMode" name="sit_paymenttype">';
                PaymentHTMLVal += '<option value="907700000">Online</option></select></td></tr>';
            }
        }
    }
    if (PaymentHTMLVal.length > 10) {
        PaymentHTMLVal += '</tbody></table>';
        $('#PaymentDtls').html(PaymentHTMLVal);
        $('#tdTotal').html('$ ' + addSeperator(Number(parseFloat(totalAmtFinal.toFixed(2)) - usedSFCAmount()).toFixed(2)));
        if ($('#lblregistrationapprovalrequired').val() == "true" && ($('#lblRegistrationstatus').val().toLowerCase() == "pending approval" || $('#lblRegistrationstatus').val().toLowerCase() == "draft")) {
            $('#lblapprovalMsg').show();
        }
        $($("#sfcErrorMessage").children()[0]).clone().appendTo("#sfcMessage");
        displayFooterButton(true);
    }
    initPromoCodeDisplay();
}

function isUsedSFC() {
    //915,200,000 Cancelled   907,700,002 Rejected
    return $('#lblSponsorship').val().toLowerCase() == "self-sponsored"
        && $('#lblUseskillsfuturecredit').val() == "true"
        && $('#lblSkillfuturecreditamountsgd').val()
        && (!registrationInfo["sit_skillsfuturestatus"] || registrationInfo["sit_skillsfuturestatus"] && registrationInfo["sit_skillsfuturestatus"] != '907700002' && registrationInfo["sit_skillsfuturestatus"] != '915200000');
}

function usedSFCAmount() {
    return isUsedSFC() ? parseFloat(Math.abs($('#lblSkillfuturecreditamountsgd').val())) : 0;
}

function showSFC() {
    if ($('#lblregistrationapprovalrequired').val() == "true" && $('#lblRegistrationstatus').val().toLowerCase() == "draft") {
        return false;
    }
    if (course["sit_programmefee"] && $('#lblsit_residencystatus').val() == "Singapore Citizen (SC)"
        && $('#lblsit_courseeligibleforsfcredit').val() == "Yes"
        && parseInt($('#lblsit_age').val()) <= parseInt($('#lblRegsit_age').val())) {
        return true;
    }
    return false;
}

function loadSFC() {
    sfcEnable = false;
    $('#sfcSubmitBtn').hide();
    var sfcHtml = "";
    if (showSFC()) {
        sfcHtml += '<tr class="sfctr"><td class="Firsttd"><div>Use SkillsFuture Credit</div>';
        if (checkSFCStatusBySiteSetting()) {
            sfcHtml += '<div id="sfcMessage"></div>';
        }
        sfcHtml += '</td>';
        sfcHtml += '<td class="Secondtd"><input type="radio" id="SkillYes" ' + initSFCChecked(1) + ' ' + initSFCDisabled(true) + ' name="SkillsFuture" value="yes" onchange="SkillsFutureChange(1);"> Yes';
        sfcHtml += ' <input type="radio" name="SkillsFuture" id="SkillNo" ' + initSFCChecked(2) + ' ' + initSFCDisabled(true) + ' value="no" onchange="SkillsFutureChange(2);"> No';
        sfcHtml += '</td></tr>';
        var sfcAmount = usedSFCAmount();
        if (sfcAmount) {
            sfcHtml += "<tr id='SkillsFutureTR'><td class='Firsttd'>Less: Applied SkillsFuture Credit Amount &lt;SFC Claim ID: " + registrationInfo["sit_sfcclaimid"] + "&gt;" + "</td><input id='IDamtVal' class='amtVal' type='hidden' value=" + sfcAmount + "><td class='Secondtd' id='SkillFutID'>($ " + sfcAmount.toFixed(2) + " )<span style='margin-left: 11px'></span>";
            if (displaySFCClearBtn()) {
                sfcHtml += "<a class='btn btn-default btn-register-menu btnpay' id='clearSkill'" + (checkSFCStatusBySiteSetting() ? "disabled" : " onclick='CalcuatePaymentsClearSkill()'") + " style='background-color:#800;color:#fff'>Cancel SFC Claim</a>";
            }
            sfcHtml += "</td></tr>";
        }
    }
    return sfcHtml;
}

function displaySFCClearBtn() {
    //907700000 pending
    return registrationInfo["sit_sfcclaimid"] && registrationInfo["sit_skillsfuturestatus"]
        && registrationInfo["sit_skillsfuturestatus"] == '907700000'
        && ($('#lblRegistrationstatus').val().toLowerCase() == "draft" || $('#lblRegistrationstatus').val().toLowerCase() == "pending payment");
}

function initSFCChecked(value) {
    if (sfcSelecedValue) {
        if (sfcSelecedValue == value) {
            return "checked";
        }
    } else {
        if (value == 1 && isUsedSFC()) {
            sfcSelecedValue = value;
            return "checked";
        } else if (value == 2 && !isUsedSFC()) {
            sfcSelecedValue = value;
            return "checked";
        }
    }
    return "";
}

function initSFCDisabled(isCheckSitSetting) {
    if ((isCheckSitSetting && checkSFCStatusBySiteSetting()) || isUsedSFC() || ($('#lblRegistrationstatus').val().toLowerCase() != "draft" && $('#lblRegistrationstatus').val().toLowerCase() != "pending payment")) {
        return "disabled";
    }
    return "";
}

async function UpdatePromocode(intVal) {
    var entity = {};
    if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
        if (intVal == "1") {
            entity.sit_promocode = $('#sit_promocode').val();
        }
        else {
            entity.sit_promocode = "";
        }
    }
    $('#lblsit_promocode').val(intVal == "1" && $('#sit_promocode').val() ? $('#sit_promocode').val() : "");
    entity.sit_invoiceprogress = 907700001;
    /*VAPT Issue fix on 14th Aug 2023*/
    //return webApiUpdateFinalPromise(entity, "sit_registrations", idVal); //commented on 14th Aug 2023 VAPT Issue fix
    //var url = "/_api/sit_registrations(" + idVal + ")"; //commented on 9th Jan 2024 VAPT Issue
    var url = "/_api/sit_registrations(" + idVal + ")?$select=sit_invoiceprogress"; //added on 9th Jan 2024 VAPT Issue
    return await portalWebApiUpdateData(url, JSON.stringify(entity));
    /*VAPT Issue fix end here*/
}

function loadPromoCode() {
    if ($('#lblsit_promocode').val()) {
        return '<td class="Firsttd">Promo Code</td><td class="Secondtd" id="tdPromocode"><input type="text" id="sit_promocode" readonly="readonly" value="' + $('#lblsit_promocode').val() + '" style="width:250px!important;background:#ccc" /> <span style="margin-left: 10px"></span><button class="btn btn-default btn-register-menu btnpay" style="border-radius:4px !important;" id="RemovepromocodeBTN" onclick="removePromoCode()">Remove</button><span id="valMsgPromocode"></span></td>';
    }
    else {
        return '<td class="Firsttd">Promo Code</td><td class="Secondtd" id="tdPromocode"><input type="text" id="sit_promocode" value="" /><span style="margin-left: 10px"></span><button class="btn btn-default btn-register-menu btnpay" style="border-radius: 4px !important;" id="promocodeBTN" onclick="checkPromoCode()">Apply</button><span id="valMsgPromocode"></span></td>';
    }
}

async function checkPromoCode() {
	 /* TeBS CR - Promo code only for SIT Alumni/Staff (SITizens/Staff) logins - Start */
    /* Google-login users have the SIT Alumni flag unticked (sit_sitalumni != 'true') and are blocked from applying promo codes. */
    if ($("#sit_sitalumni").val() != 'true') {
        hideloading();
        $('#PromoMSG') && $('#PromoMSG').remove();
        $("#valMsgPromocode").html('<div id="PromoMSG"><br><span style="color:red">Promo codes can only be applied when you sign in with your SITizens/Staff account.</span></div>');
        return;
    }
    /* TeBS CR - Promo code only for SIT Alumni/Staff (SITizens/Staff) logins - End */
    showloading();
    $('#PromoMSG') && $('#PromoMSG').remove();
    var pCode = $('#sit_promocode').val();
    //commented on 14th Aug 2023 VAPT Issue fix
    //$.when(retrievePromoCode(pCode)).done(function (resultsPromo) {
    //    if (resultsPromo && resultsPromo.value && resultsPromo.value.length) {
    //        sit_promocodeid = resultsPromo.value[0]["sit_promocodeid"];
    //        sit_quoteused = parseInt(resultsPromo.value[0]["p.sit_quoteused"]);
    //        isNaN(sit_quoteused) && (sit_quoteused = 0);
    //        sit_quota = parseInt(resultsPromo.value[0]["p.sit_quota"]);
    //        isNaN(sit_quota) && (sit_quota = 0);
    //        if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored" && parseFloat(resultsPromo.value[0]["p.sit_discount"]) > parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', ''))) {
    //            hideloading();
    //            $('#sit_promocode').val("");
    //            $("#valMsgPromocode").html('<div id="PromoMSG"><br><span  style="color:red">The discount is greater than the total amount.</span></div>');
    //            return;
    //        }
    //        var dtdList = [];
    //        usedCount = 0;
    //        if (participants) {
    //            usedCount = sit_quota - sit_quoteused;
    //            if (usedCount > participants.data.length) {
    //                usedCount = participants.data.length;
    //            }
    //            if (usedCount > participants.data.length - participants.usedSSGFunding.length) {
    //                usedCount = participants.data.length - participants.usedSSGFunding.length;
    //            }
    //            for (var d = 0; d < participants.data.length; d++) {
    //                var item = participants.data[d];
    //                if ($.inArray(item.sit_registrationparticipantid, participants.usedSSGFunding) < 0 && --usedCount >= 0) {
    //                    /*VAPT Issue fix on 14th Aug 2023 */
    //                    //dtdList.push(webApiUpdateFinalPromise({ sit_promocode: pCode }, "sit_registrationparticipants", item.sit_registrationparticipantid));
    //                    var url = "/_api/sit_registrationparticipants(" + item.sit_registrationparticipantid +")";
    //                    dtdList.push(await portalWebApiUpdateData(url, JSON.stringify({ sit_promocode: pCode })));
    //                    /*VAPT Issue fix end here */
    //                    item.sit_promocode = pCode;
    //                }
    //            }
    //            usedCount = dtdList.length;
    //        } else {
    //            usedCount = sit_quota - sit_quoteused > 0 ? 1 : 0;
    //        }
    //        if (usedCount) {
    //            var entityPromo = {};
    //            entityPromo.sit_quoteused = sit_quoteused + usedCount;
    //            entityPromo.sit_quotaremaining = sit_quota - entityPromo.sit_quoteused;
    //            /*VAPT Issue fix on 14th Aug 2023 */
    //            //dtdList.push(webApiUpdateFinalPromise(entityPromo, "sit_promocodes", sit_promocodeid));
    //            var url = "/_api/sit_promocodes(" + sit_promocodeid + ")";
    //            dtdList.push(await portalWebApiUpdateData(url, JSON.stringify(entityPromo)));
    //            /*VAPT Issue fix end here */
    //            $.when.apply(null, dtdList.map(function (d) {
    //                return d;
    //            })).done(function () {
    //                $.when(UpdatePromocode(1)).done(function () {
    //                    pageLoad(function () {
    //                        if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
    //                            $("#valMsgPromocode").html('<div id="PromoMSG"><br><span style="color:green">Promo code is applied successfully.</span></div>');
    //                        } else {
    //                            $("#valMsgPromocode").html('<div id="PromoMSG"><br><span style="color:green">Promo code is applied to ' + usedCount + ' participant(s) successfully.</span></div>');
    //                        }
    //                    });
    //                }).fail(function () {
    //                    hideloading();
    //                });
    //            }).fail(function () {
    //                hideloading();
    //            });
    //        } else {
    //            hideloading();
    //            $("#valMsgPromocode").html('<div id="PromoMSG"><br><span  style="color:red"> This promo code is fully redeemed.</span></div>');
    //        }
    //    } else {
    //        hideloading();
    //        $("#valMsgPromocode").html('<div id="PromoMSG"><br><span  style="color:red"> Invalid Promo Code. Please enter valid Promo Code.</span></div>');
    //    }
    //}).fail(function () {
    //    hideloading();
    //    $("#valMsgPromocode").html('<div id="PromoMSG"><br><span  style="color:red"> Invalid Promo Code. Please enter valid Promo Code.</span></div>');
    //});


    await Promise.all([retrievePromoCode(pCode)]).then(function (resultsPromo) {
        /* TeBS iTrack 0015427 Changes - Start */
        var promoVal = resultsPromo[0];
        if (promoVal && promoVal.value && promoVal.value.length) {
            /* TeBS iTrack 0015427 Changes - End */
            sit_promocodeid = promoVal.value[0]["sit_promocodeid"];
            sit_quoteused = parseInt(promoVal.value[0]["sit_quoteused"]);
            isNaN(sit_quoteused) && (sit_quoteused = 0);
            sit_quota = parseInt(promoVal.value[0]["sit_quota"]);
            isNaN(sit_quota) && (sit_quota = 0);
            if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored" && parseFloat(promoVal.value[0]["p.sit_discount"]) > parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', ''))) {
                hideloading();
                $('#sit_promocode').val("");
                $("#valMsgPromocode").html('<div id="PromoMSG"><br><span  style="color:red">The discount is greater than the total amount.</span></div>');
                return;
            }
            var dtdList = [];
            usedCount = 0;
            if (participants) {
                usedCount = sit_quota - sit_quoteused;
                if (usedCount > participants.data.length) {
                    usedCount = participants.data.length;
                }
                if (usedCount > participants.data.length - participants.usedSSGFunding.length) {
                    usedCount = participants.data.length - participants.usedSSGFunding.length;
                }
                for (var d = 0; d < participants.data.length; d++) {
                    var item = participants.data[d];
                    if ($.inArray(item.sit_registrationparticipantid, participants.usedSSGFunding) < 0 && --usedCount >= 0) {
                        /*VAPT Issue fix on 14th Aug 2023 */
                        var entitypromocode = {};
                        entitypromocode.sit_promocode = pCode;
                        //dtdList.push(webApiUpdateFinalPromise({ sit_promocode: pCode }, "sit_registrationparticipants", item.sit_registrationparticipantid));                        
                        //var url = "/_api/sit_registrationparticipants(" + item.sit_registrationparticipantid + ")"; //commented on 9th Jan 2024 VAPT Issue
                        var url = "/_api/sit_registrationparticipants(" + item.sit_registrationparticipantid + ")?$select=sit_promocode"; //added on 9th Jan 2024 VAPT Issue
                        dtdList.push(portalWebApiUpdateData(url, JSON.stringify(entitypromocode)));
                        /*VAPT Issue fix end here */
                        item.sit_promocode = pCode;
                    }
                }
                usedCount = dtdList.length;
            } else {
                usedCount = sit_quota - sit_quoteused > 0 ? 1 : 0;
            }
            if (usedCount) {
                var entityPromo = {};
                entityPromo.sit_quoteused = sit_quoteused + usedCount;
                entityPromo.sit_quotaremaining = sit_quota - entityPromo.sit_quoteused;
                /*VAPT Issue fix on 14th Aug 2023 */
                //dtdList.push(webApiUpdateFinalPromise(entityPromo, "sit_promocodes", sit_promocodeid));
                //var url = "/_api/sit_promocodes(" + sit_promocodeid + ")"; //commented on 9th Jan 2024 VAPT Issue fix
                var url = "/_api/sit_promocodes(" + sit_promocodeid + ")?$select=sit_quoteused,sit_quotaremaining"; //added on 9th Jan 2024 VAPT Issue fix
                dtdList.push(portalWebApiUpdateData(url, JSON.stringify(entityPromo)));
                /*VAPT Issue fix end here */
                $.when.apply(null, dtdList.map(function (d) {
                    return d;
                })).done(async function () {
                    await Promise.all([UpdatePromocode(1)]).then(async function () {
                        await pageLoad(function () {
                            if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
                                $("#valMsgPromocode").html('<div id="PromoMSG"><br><span style="color:green">Promo code is applied successfully.</span></div>');
                            } else {
                                $("#valMsgPromocode").html('<div id="PromoMSG"><br><span style="color:green">Promo code is applied to ' + usedCount + ' participant(s) successfully.</span></div>');
                            }
                        });
                    }).catch(function () {
                        hideloading();
                    });
                }).fail(function () {
                    hideloading();
                });
            } else {
                hideloading();
                $("#valMsgPromocode").html('<div id="PromoMSG"><br><span  style="color:red"> This promo code is fully redeemed.</span></div>');
            }
        }
        else {
            hideloading();
            $("#valMsgPromocode").html('<div id="PromoMSG"><br><span  style="color:red"> Invalid Promo Code. Please enter valid Promo Code.</span></div>');
        }
    }).catch(function () {
        hideloading();
        $("#valMsgPromocode").html('<div id="PromoMSG"><br><span  style="color:red"> Invalid Promo Code. Please enter valid Promo Code.</span></div>');
    });
}

async function removePromoCode() {
    showloading();
    $('#PromoMSG') && $('#PromoMSG').remove();
    var pCode = $('#sit_promocode').val();
    //commented on 14th Aug 2023 VAPT Issue fix
    //$.when(retrievePromoCode(pCode)).done(function (resultsPromo) {
    //    if (resultsPromo && resultsPromo.value && resultsPromo.value.length) {
    //        sit_promocodeid = resultsPromo.value[0]["sit_promocodeid"];
    //        sit_quoteused = parseInt(resultsPromo.value[0]["p.sit_quoteused"]);
    //        isNaN(sit_quoteused) && (sit_quoteused = 0);
    //        sit_quota = parseInt(resultsPromo.value[0]["p.sit_quota"]);
    //        isNaN(sit_quota) && (sit_quota = 0);
    //        var dtdList = [];
    //        if (participants) {
    //            for (var d = 0; d < participants.data.length; d++) {
    //                if (participants.data[d].sit_promocode == pCode) {
    //                    /*VAPT Issue fix on 14th Aug 2023 */
    //                    //dtdList.push(webApiUpdateFinalPromise({ sit_promocode: "" }, "sit_registrationparticipants", participants.data[d].sit_registrationparticipantid));
    //                    var url = "/_api/sit_registrationparticipants(" + participants.data[d].sit_registrationparticipantid + ")";                        
    //                    dtdList.push(await portalWebApiUpdateData(url, JSON.stringify({ sit_promocode: "" })));
    //                    /*VAPT Issue fix end here*/
    //                    participants.data[d].sit_promocode = "";
    //                }

    //            }
    //        }
    //        var entityPromo = {};
    //        usedCount = dtdList.length == 0 ? 1 : dtdList.length;
    //        entityPromo.sit_quoteused = sit_quoteused - usedCount < 0 ? 0 : sit_quoteused - usedCount;
    //        entityPromo.sit_quotaremaining = sit_quota - entityPromo.sit_quoteused;
    //        /*VAPT Issue fix on 14th Aug 2023 */
    //        //dtdList.push(webApiUpdateFinalPromise(entityPromo, "sit_promocodes", sit_promocodeid));
    //        var url = "/_api/sit_promocodes(" + sit_promocodeid + ")";
    //        dtdList.push(await portalWebApiUpdateData(url, JSON.stringify(entityPromo)));
    //        /*VAPT Issue fix end here*/
    //        $.when.apply(null, dtdList.map(function (d) {
    //            return d;
    //        })).done(function () {
    //            $.when(UpdatePromocode(2)).done(function () {
    //                pageLoad(function () {
    //                    if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
    //                        $("#valMsgPromocode").html('<div id="PromoMSG"><br><span style="color:green">Promo code is removed successfully.</span></div>');
    //                    } else {
    //                        $("#valMsgPromocode").html('<div id="PromoMSG"><br><span style="color:green">Promo code is removed from ' + usedCount + ' participant(s) successfully.</span></div>');
    //                    }
    //                });
    //            }).fail(function () {
    //                hideloading();
    //            });
    //        }).fail(function () {
    //            hideloading();
    //        });
    //    } else {
    //        hideloading();
    //    }
    //}).fail(function () {
    //    hideloading();
    //});
    await Promise.all([retrievePromoCode(pCode)]).then(function (resultsPromo) {
        /* TeBS iTrack 0015427 Changes - Start */
        var promoVal = resultsPromo[0];
        if (promoVal && promoVal.value && promoVal.value.length) {
            /* TeBS iTrack 0015427 Changes - End */
            sit_promocodeid = promoVal.value[0]["sit_promocodeid"];
            sit_quoteused = parseInt(promoVal.value[0]["sit_quoteused"]);
            isNaN(sit_quoteused) && (sit_quoteused = 0);
            sit_quota = parseInt(promoVal.value[0]["sit_quota"]);
            isNaN(sit_quota) && (sit_quota = 0);
            var dtdList = [];
            if (participants) {
                for (var d = 0; d < participants.data.length; d++) {
                    if (participants.data[d].sit_promocode == pCode) {
                        /*VAPT Issue fix on 14th Aug 2023 */
                        //dtdList.push(webApiUpdateFinalPromise({ sit_promocode: "" }, "sit_registrationparticipants", participants.data[d].sit_registrationparticipantid));
                        //var url = "/_api/sit_registrationparticipants(" + participants.data[d].sit_registrationparticipantid + ")"; //commented on 9th Jan 2024 VAPT Issue fix
                        var url = "/_api/sit_registrationparticipants(" + participants.data[d].sit_registrationparticipantid + ")?$select=sit_promocode"; //added on 9th Jan 2024 VAPT Issue fix
                        dtdList.push(portalWebApiUpdateData(url, JSON.stringify({ sit_promocode: "" })));
                        /*VAPT Issue fix end here*/
                        participants.data[d].sit_promocode = "";
                    }

                }
            }
            var entityPromo = {};
            usedCount = dtdList.length == 0 ? 1 : dtdList.length;
            entityPromo.sit_quoteused = sit_quoteused - usedCount < 0 ? 0 : sit_quoteused - usedCount;
            entityPromo.sit_quotaremaining = sit_quota - entityPromo.sit_quoteused;
            /*VAPT Issue fix on 14th Aug 2023 */
            //dtdList.push(webApiUpdateFinalPromise(entityPromo, "sit_promocodes", sit_promocodeid));
            //var url = "/_api/sit_promocodes(" + sit_promocodeid + ")"; //commented on 9th Jan 2024 VAPT Issue fix 
            var url = "/_api/sit_promocodes(" + sit_promocodeid + ")?$select=sit_quoteused,sit_quotaremaining"; //added on 9th Jan 2024 VAPT Issue fix
            dtdList.push(portalWebApiUpdateData(url, JSON.stringify(entityPromo)));
            /*VAPT Issue fix end here*/
            $.when.apply(null, dtdList.map(function (d) {
                return d;
            })).done(async function () {
                await Promise.all([UpdatePromocode(2)]).then(async function () {
                    await pageLoad(function () {
                        if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
                            $("#valMsgPromocode").html('<div id="PromoMSG"><br><span style="color:green">Promo code is removed successfully.</span></div>');
                        } else {
                            $("#valMsgPromocode").html('<div id="PromoMSG"><br><span style="color:green">Promo code is removed from ' + usedCount + ' participant(s) successfully.</span></div>');
                        }
                    });
                }).catch(function () {
                    hideloading();
                });
            }).fail(function () {
                hideloading();
            });
        } else {
            hideloading();
        }
    }).catch(function () {
        hideloading();
    });
}

function PaymentModeChanges(thisVal) {
    $('#lblapprovalMsg').hide();
    if ($('#lblregistrationapprovalrequired').val() == "true") {
        if ($('#lblRegistrationstatus').val().toLowerCase() == "pending approval" || $('#lblRegistrationstatus').val().toLowerCase() == "draft") {
            $('#lblapprovalMsg').show();
        }
    }
    displayFooterButton(false);
}

function addSeperator(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function SkillsFutureChange(intVal) {
    sfcSelecedValue = intVal;
    if (intVal == "1") {
        $('#sfcSubmitBtn').show();
        sfcEnable = true;
        $('#submitId').hide();
        $('#PayId').hide();
    }
    else {
        sfcEnable = false;
        $('#sfcSubmitBtn').hide();
        displayFooterButton(false);
    }
}
function clearSFCCallback() {
    $('#lblSkillfuturecreditamountsgd').val(0);
    $('#lblUseskillsfuturecredit').val(false);
    $('#tdTotal').html('$ ' + addSeperator(Number(parseFloat(totalAmtFinal.toFixed(2))).toFixed(2)));
    $('#SkillsFutureTR').remove();
    $("#SkillNo").attr('checked', 'checked');
    $("#SkillYes").removeAttr("disabled");
    $("#SkillNo").removeAttr("disabled");

    /* TeBS CR1924 Learn for Life Token Changes - Start */
    if ($("#sit_enableslc").val() == "true") {
        $("#usingSLCYes").removeAttr("disabled");
        $("#usingSLCNo").removeAttr("disabled");
    }
    /* TeBS CR1924 Learn for Life Token Changes - End */

    hideloading();
}
function clickSFCCancelYesBtn() {
    $("#sfcCancelModal").hide();
    if (!idVal || !registrationInfo["sit_sfcclaimid"]) {
        return;
    }
    showloading();
    var requestData = JSON.stringify({ Action: "CancelClaimAction", Id: idVal });
    callSFCAPI(requestData, function (response) {
        var data = typeof response == "object" ? response : JSON.parse(response);
        if (data && data.status == 200 && data.data && data.data.claim) {
            clearSFCCallback();
        } else {
            window.document.location.reload();
            console.log(response);
            hideloading();
        }
    }, hideloading);
}
function callSFCAPI(requestData, successCallback, failCallback) {
    var dtd = $.Deferred();
    var settings = {
        url: $("#sfcApiURL").val(),
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": $("#sfcApiKey").val()
        },
        data: requestData
    };
    $.ajax(settings).done(function (response) {
        if (response && response.ReasonPhrase) {
            response = response.ReasonPhrase;
        } else {
            response = "";
            console.log("Call SFC API Result is Empty.");
        }
        if (successCallback) {
            successCallback(response);
        }
        dtd.resolve(response);
    }).fail(function (e) {
        if (failCallback) {
            failCallback();
        }
        console.log("Call SFC API Failed.");
        dtd.reject(e);
    });
    return dtd.promise();
}
function CalcuatePaymentsClearSkill() {
    $("#sfcCancelModal").show();
}
function canApplySFC() {

}
function canClearSFC() {

}
function GetParameterValues(param) {
    var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < url.length; i++) {
        var urlparam = url[i].split('=');
        if (urlparam[0] == param) {
            return urlparam[1].replace("#", "");
        }
    }
}
function loadPopup() {
    document.getElementById('myModalNew').style.display = "block";
}
function loadPopupSubmit() {
    if (parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) >= 0) {
        if ($('#lblregistrationapprovalrequired').val() == "true") {
            if (parseFloat(Math.abs($('#IDamtVal').val())) > 0) {
                if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored" && parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) == 0) {
                    if ($('#lblRegistrationstatus').val().toLowerCase() == "pending payment") {
                        $('#PaySubmitInforma').hide();
                        /* TeBS CR2269 and CR2352 Changes - Start */
                        //$('#PaySubmitThanks').hide();
                        /* TeBS CR2269 and CR2352 Changes - End */
                        $('#PaySubmitSkills').show();
                    }
                    else {
                        $('#PaySubmitInforma').hide();
                        $('#PaySubmitSkills').hide();
                        /* TeBS CR2269 and CR2352 Changes - Start */
                        //$('#PaySubmitThanks').show();
                        $('#idPaymentSubmitFinal').click();
                        return;
                        /* TeBS CR2269 and CR2352 Changes - End */
                    }
                } else {
                    if ($('#PaymentMode').val() == "907700001") {
                        if ($('#lblSponsorship').val().toLowerCase() != "self-sponsored") {
                            if ($('#lblRegistrationstatus').val().toLowerCase() == "pending payment") {
                                $('#PaySubmitInforma').show();
                                /* TeBS CR2269 and CR2352 Changes - Start */
                                //('#PaySubmitThanks').hide();
                                /* TeBS CR2269 and CR2352 Changes - End */
                                $('#PaySubmitSkills').hide();
                            } else {
                                $('#PaySubmitInforma').hide();
                                $('#PaySubmitSkills').hide();
                                /* TeBS CR2269 and CR2352 Changes - Start */
                                //$('#PaySubmitThanks').show();
                                $('#idPaymentSubmitFinal').click();
                                return;
                                /* TeBS CR2269 and CR2352 Changes - End */
                            }
                        }
                    }
                    else {
                        if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored" && parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) > 0) {
                            $('#PaySubmitInforma').hide();
                            $('#PaySubmitSkills').hide();
                            /* TeBS CR2269 and CR2352 Changes - Start */
                            //$('#PaySubmitThanks').show();
                            $('#idPaymentSubmitFinal').click();
                            return;
                            /* TeBS CR2269 and CR2352 Changes - End */
                        } else {
                            $('#PaySubmitInforma').show();
                            /* TeBS CR2269 and CR2352 Changes - Start */
                            //$('#PaySubmitThanks').hide();
                            /* TeBS CR2269 and CR2352 Changes - End */
                            $('#PaySubmitSkills').hide();
                        }
                    }
                }
            } else {
                if ($('#PaymentMode').val() == "907700001") {
                    if ($('#lblSponsorship').val().toLowerCase() != "self-sponsored") {
                        if ($('#lblRegistrationstatus').val().toLowerCase() == "pending payment") {
                            $('#PaySubmitInforma').show();
                            /* TeBS CR2269 and CR2352 Changes - Start */
                            //$('#PaySubmitThanks').hide();
                            /* TeBS CR2269 and CR2352 Changes - End */
                            $('#PaySubmitSkills').hide();
                        } else {
                            $('#PaySubmitInforma').hide();
                            $('#PaySubmitSkills').hide();
                            /* TeBS CR2269 and CR2352 Changes - Start */
                            //$('#PaySubmitThanks').show();
                            $('#idPaymentSubmitFinal').click();
                            return;
                            /* TeBS CR2269 and CR2352 Changes - End */
                        }
                    }
                } else {
                    $('#PaySubmitInforma').hide();
                    $('#PaySubmitSkills').hide();
                    /* TeBS CR2269 and CR2352 Changes - Start */
                    //$('#PaySubmitThanks').show();
                    $('#idPaymentSubmitFinal').click();
                    return;
                    /* TeBS CR2269 and CR2352 Changes - End */
                }
            }
        }
        else {
            if ($('#lblSponsorship').val().toLowerCase() == "self-sponsored") {
                $('#PaySubmitInforma').hide();
                /* TeBS CR2269 and CR2352 Changes - Start */
                //$('#PaySubmitThanks').hide();
                /* TeBS CR2269 and CR2352 Changes - End */
                $('#PaySubmitSkills').show();
            } else {
                if ($('#PaymentMode').val() == "907700001") {
                    $('#PaySubmitInforma').show();
                    /* TeBS CR2269 and CR2352 Changes - Start */
                    //$('#PaySubmitThanks').hide();
                    /* TeBS CR2269 and CR2352 Changes - End */
                    $('#PaySubmitSkills').hide();
                } else {
                    $('#PaySubmitInforma').show();
                    $('#PaySubmitSkills').hide();
                }
            }
        }
        // When the user clicks the button, open the modal
        document.getElementById('myModalNewsubmit').style.display = "block";
    }
    else {
        $(".sfc_normal").show();
        $(".sfcMaxValueMessage").text('A negative value is not allowed in the payment.');
        $("#sfcAlert").show();
    }
}

function popupClose() {
    var modalNew = document.getElementById('myModalNew');
    modalNew.style.display = "none";
}

function popupCloseSubmit() {
    var modalNew = document.getElementById('myModalNewsubmit');
    modalNew.style.display = "none";
}

async function updateRegistrationInfo() {
    var entity = {};
    if ($('#lblRegistrationstatus').val().toLowerCase() != "pending payment") {
        entity["sit_registrationstatus"] = 3;
        entity["sit_registrationdatetime"] = new Date().toISOString();
        $('#lblRegistrationstatus').val('pending payment');
    }
    if ($('#PaymentMode').val() == 907700001) { // Update Registration Payment Mode
        entity.sit_paymentmethod = "907700001";
    }
    else {
        entity.sit_paymentmethod = "907700000";
    }
    /*VAPT Issue fix on 14th Aug 2023 */
    //webApiUpdateFinalPromise(entity, "sit_registrations", idVal, null, true);
    //var url = "/_api/sit_registrations(" + idVal + ")"; //commented on 9th Jan 2024 VAPt Issue fix
    var url = "/_api/sit_registrations(" + idVal + ")?$select=sit_registrationstatus,sit_registrationdatetime,sit_paymentmethod"; //added on 9th Jan 2024 VAPT Issue fix
    await portalWebApiUpdateData(url, JSON.stringify(entity));
    /*VAPT Issue fix end here*/

}

async function runRedirectForm() {
    try {
        await updateRegistrationInfo();
        if (await InsertPayments()) {
            // checking invoice status is not equal to approved
            //var checkapprovedInvoice = retrieveDataPromise("/api/data/v9.1/invoices(" + invoiceId + ")", null, true);
            //var response = await portalWebApiRetrieveData("/_api/invoices(" + invoiceId + ")", null, true); //commented on 9th Jan 2024 VAPT Issue fix
            var response = await portalWebApiRetrieveData("/_api/invoices(" + invoiceId + ")?$select=sit_approvalstatus", null, true); //added on 9th Jan 2024 VAPT Issue fix
            var checkapprovedInvoice = response.results;
            if (checkapprovedInvoice.sit_approvalstatus != 1) {
                /*VAPT Issue fix on 14th Aug 2023*/
                // webApiUpdateFinalPromise({ sit_approvalstatus: 1 }, "invoices", invoiceId, null, true);
                //var url = "/_api/invoices(" + invoiceId + ")"; //commented on 9th Jan 2024 VAPT Issue fix
                var url = "/_api/invoices(" + invoiceId + ")?$select=sit_approvalstatus"; //added on 9th Jan 2024 VAPT Issue fix
                await portalWebApiUpdateData(url, JSON.stringify({ sit_approvalstatus: 1 }));
                /*VAPT Issue fix end here*/
            }
        }
    } catch (err) {
        alert("PaymentSubmitPay --- > " + err);
    }
}
function sfcAlertShow() {
    if (sfcMaxValue <= 0) {
        $(".sfc_zero").show();
    } else {
        $(".sfc_normal").show();
        $(".sfcMaxValueMessage").text('The maximum SkillsFuture Credit amount allowed is ' + '$ ' + addSeperator(Number(parseFloat(sfcMaxValue)).toFixed(2)) + '.');
    }
    $("#sfcAlert").show();
}
function sfcAlertClose() {
    $("#sfcAlert").hide();
    $(".sfc_zero").hide();
    $(".sfc_normal").hide();
    $("#txtSkillsFutureAmt").focus();
}
function clickSubmit() {
    if ($('#IDamtVal').val() && parseFloat(Math.abs($('#IDamtVal').val())) > sfcMaxValue) {
        sfcAlertShow();
        return;
    }
    if ($("#lblRegistrationstatus").val() != "Pending Payment") {
        if ($("#sit_uselearntoken").val() == "1" && $("#sit_learntokenusage").val() == "true") {
            $("#lflModalSubmitCheck").show();
            return;
        }
        if (enableLFL() && lflEnable) {
            $("#lflConfirm").show();
        }
        /* TeBS CR1924 Learn for Life Token Changes - Start */
        else if ($("#sit_enableslc").val() == "true") {
            if (enableSLC() && slcEnable) {
                if ($('input:radio[name="usingSLC"]:checked').val() == "1") {
                    $(".slc_selected_yes").show();
                    $(".slc_selected_no").hide();
                } else {
                    $(".slc_selected_no").show();
                    $(".slc_selected_yes").hide();
                }
                $("#slcConfirm").show();
            }
        }
        else {
            loadPopupSubmit();
        }
        /* TeBS CR1924 Learn for Life Token Changes - End */
    } else {
        loadPopupSubmit();
    }
}
function clickNext() {
    if ($('#IDamtVal').val() && parseFloat(Math.abs($('#IDamtVal').val())) > sfcMaxValue) {
        sfcAlertShow();
        return;
    }

    /* TeBS CR1924 Learn for Life Token Changes - Start */
    if ($("#sit_enableslc").val() == "true") {
        if ($("#lblRegistrationstatus").val() == "Pending Payment" || !enableSLC()) {
            loadPopup();
        } else if (slcEnable) {
            if ($('input:radio[name="usingSLC"]:checked').val() == "1") {
                $(".slc_selected_yes").show();
                $(".slc_selected_no").hide();
            } else {
                $(".slc_selected_no").show();
                $(".slc_selected_yes").hide();
            }
            $("#slcConfirm").show();
        } else {
            loadPopup();
        }
    }
    /* TeBS CR1924 Learn for Life Token Changes - End */
    else {
        loadPopup();
    }
}
function clickSFCSubmit() {
    if ($("#sit_enableslc").val() == "true" && slcEnable) {
        if ($('input:radio[name="usingSLC"]:checked').val() == "1") {
            $(".slc_selected_yes").show();
            $(".slc_selected_no").hide();
        } else {
            $(".slc_selected_no").show();
            $(".slc_selected_yes").hide();
        }
        $("#slcConfirm").show();
    } else {
        $(".sfcProceedAmountMessage").text("Please key in NOT MORE than {0} in MySkillsFuture Portal.".format('$ ' + addSeperator(sfcMaxValue.toFixed(2))));
        $("#sfcProceedModal").show();
    }
}
function clickSFCProceedBtn() {
    showloading();
    $("#sfcProceedModal").hide();
    var requestData = JSON.stringify({ "Url": $("#sfcApiEncryptRequests").val(), "Method": "post", "Action": "SendRequestAction", "Json": JSON.stringify(encryptionRequest()) });
    callSFCAPI(requestData, function (response) {
        var data = typeof response == "object" ? response : JSON.parse(response);
        if (data && data.status == 200) {
            var iframe = $('<iframe id="sfc_target" name="sfc_target" style="display:none"></iframe>');
            var form = $('<form target="_blank" method="POST" accept-charset="UTF-8" onsubmit="document.charset=\'UTF-8\'" action="' + $("#sfcPaymentGateway").val() + '">'
                + '<input type="text" name="encryptedPayload" id="encryptedPayload" value="' + data.data.claimRequest + '" hidden="true">' + '</form>');
            iframe.append(form);
            iframe.appendTo('body');
            $('#sfc_target>form').trigger('submit');
            $("#sfcRefreshModal").show();
        } else {
            hideloading();
        }
    }, hideloading);
}
function checkSFCStatusBySiteSetting() {
    var status = $("#sfcStatus").val().trim().toLowerCase();
    var result = 0;
    switch (status) {
        case "enable": result = 0; break;
        case "disable": result = 1; break;
        default: result = 0;
    }
    return result;
}
function encryptionRequest() {
    return {
        claimRequest: {
            course: {
                id: course["sit_myskillsfuturecoursenum"],
                fee: "" + course["sit_programmefee"],
                runId: "",
                startDate: new Date(course["sit_startdate"]).toString("yyyy-MM-dd")
            },
            individual: {
                nric: registrationInfo["sit_identificationnumber"],
                email: registrationInfo["sit_personalemail"],
                homeNumber: "",
                mobileNumber: ""
            },
            additionalInformation: idVal
        }
    };
}
function getaway() {
    $("#encryptedPayload").val($("#encryptStr").val());
    $("#redirectSSG").attr("action", $("#getawayURL").val());
    $("#redirectSSG").submit();
}
function clickSFCRefreshBtn() {
    window.document.location.reload();
}
function showloading() {
    /* TeBS iTrack T04948 Changes - Start */
    //$('#mydiv').show();
    $('#loadingdiv').show();
    /* TeBS iTrack T04948 Changes - End */
    window.scrollTo(0, 0);
    $('body').addClass("lock");
}
function hideloading() {
    /* TeBS iTrack T04948 Changes - Start */
    //$('#mydiv').hide();
    $('#loadingdiv').hide();
    /* TeBS iTrack T04948 Changes - End */
    $('body').removeClass("lock");
}
function slcConfirmClose() {
    $("#slcConfirm").hide();
}
function slcConfirmOK() {
    slcConfirmClose();
    if (sfcEnable) {
        $(".sfcProceedAmountMessage").text("Please key in NOT MORE than {0} in MySkillsFuture Portal.".format('$ ' + addSeperator(sfcMaxValue.toFixed(2))));
        $("#sfcProceedModal").show();
        return;
    }
    if ($("#submitId").css("display") != "none") {
        if ($('#lblregistrationapprovalrequired').val() == "false"
            && parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) == 0
            && (!$('#IDamtVal').val() || parseFloat(Math.abs($('#IDamtVal').val())) == 0)) {
            slcSubmit();
        } else {
            loadPopupSubmit();
        }
    } else {
        loadPopup();
    }
}
async function slcSubmit() {
    await UpdateInvoicePerforma();
    await InsertUpdatePaymentStatus();
    window.location.href = "/mycourses/";
}
function loadSLC() {
    var slcHtml = "";

    // TeBS CR1924 Learn for Life Token Changes - Added sit_enableslc check
    if (!enableSLC() || existingUsingSLC) {
        return slcHtml;
    }
    existingUsingSLC = true;
    initPromoCodeDisplay();
    slcHtml += "<tr>";
    slcHtml += '<td class="Firsttd">Using SITizens Learning Credits</td>';
    slcHtml += '<td class="Secondtd"><input type="radio" id="usingSLCYes" ' + initSLCChecked(1) + ' ' + initSLCDisabled(1) + ' name="usingSLC" value="1" onchange="slcChange(1);"> Yes';
    slcHtml += ' <input type="radio" name="usingSLC" id="usingSLCNo" ' + initSLCChecked(0) + ' ' + initSLCDisabled(0) + ' value="0" onchange="slcChange(0);"> No';
    slcHtml += '</tr>';
    return slcHtml;
}
function initSLCChecked(value) {
    if ($('#sit_useslccredit').val() == value) {
        return "checked";
    }
    return "";
}
function initSLCDisabled() {
    slcEnable = false;
    if ($("#lblRegistrationstatus").val() == "Pending Payment" || isUsedSFC()) {
        return "disabled";
    }
    slcEnable = true;
    return "";
}
function UpdateUseSlcCreditRequestData() {
    var obj = {};
    var slcStatus = enableSLC();
    if ($('#sit_useslccredit').val() == "1") {
        if (!slcStatus) {
            $('#sit_useslccredit').val(0);
            obj.sit_useslccredit = false;
        }
        if ($('#lblsit_promocode').val()) {
            obj.sit_promocode = "";
        }
    } else if (slcStatus) {
        if (!isUsedSFC() && !($('#lblregistrationapprovalrequired').val() == "true" && $("#lblRegistrationstatus").val() == "Pending Payment")) {
            $('#sit_useslccredit').val(1);
            obj.sit_useslccredit = true;
        }
        if ($('#lblsit_promocode').val()) {
            obj.sit_promocode = "";
        }
    }
    var inBlacklistValue = checkInSLCBlackList();
    if (inBlacklistValue == 1 && sit_inslcblacklist != 1) {
        obj.sit_inslcblacklist = 1;
    } else if (inBlacklistValue == 0 && sit_inslcblacklist != 0) {
        obj.sit_inslcblacklist = 0;
    } else if (inBlacklistValue == -1 && sit_inslcblacklist != -1) {
        obj.sit_inslcblacklist = null;
    }
    return obj;
}
function enableSLC() {
    // TeBS CR1924 Learn for Life Token Changes - Added sit_enableslc check
    var result = Number.parseFloat($("#sit_retake").val()) <= 1
        && $("#sit_slcpayable").val() == 'true'
        && $("#slc_student").val() == 'true'
        && $("#slc_enable").val() == 'true'
        && $("#sit_slceligible").val() == 'true'
        && $("#lblRegistrationsType").val() == 'Self'
        && Number.parseFloat($("#sit_available").val()) > 0
        && $("#sit_enableslc").val() == 'true';
    return result;
}
function checkInSLCBlackList() {
    // TeBS CR1924 Learn for Life Token Changes - Added sit_enableslc check
    var result = Number.parseFloat($("#sit_retake").val()) <= 1
        && $("#sit_slcpayable").val() == 'true'
        && $("#slc_student").val() == 'true'
        && $("#sit_slceligible").val() == 'true'
        && $("#lblRegistrationsType").val() == 'Self'
        && Number.parseFloat($("#sit_available").val()) > 0
        && $("#sit_enableslc").val() == 'true';
    if (result) {
        return $("#slc_enable").val() != 'true' ? 1 : 0;
    }
    return -1;
}
function initPromoCodeDisplay() {
    if ($('#sit_useslccredit').val() == "1") {
        $(".promocode").hide();
    } else {
        $(".promocode").show();
    }
}
async function slcChange(value) {
    if ($("#lblRegistrationstatus").val() == "Pending Payment") {
        return;
    }
    showloading();
    $('#sit_useslccredit').val(value);
    await updateUseSLCForRegistration(value);
}
async function updateUseSLCForRegistration(value) {
    var entity = {};
    entity["sit_useslccredit"] = value == '1' ? true : false;
    if (value == '1') {
        entity["sit_promocode"] = "";
        $('#lblsit_promocode').val('');
    }
    entity.sit_inslcblacklist = null;
    if (entity["sit_useslccredit"]) {
        entity.sit_inslcblacklist = 0;
    }
    //commented on 13th Aug 2023 VAPT Issue fix
    //$.when(InsertUpdatePaymentProgress(entity),
    //    value == '1' && $('#sit_promocode').val() && processPromoCodeForSLCChange($('#sit_promocode').val())).done(function () {
    //        pageLoad();
    //    }).fail(function () {
    //        hideloading();
    //    });

    await Promise.all([InsertUpdatePaymentProgress(entity),
    value == '1' && $('#sit_promocode').val() && processPromoCodeForSLCChange($('#sit_promocode').val())]).then(async function () {
        await pageLoad();
    }).catch(function () {
        hideloading();
    });
}

async function retrievePromoCode(promocode) {
    var resultColl = null;
    var checkDateStr = new Date().addDays(-1).toString("yyyy-MM-dd") + 'T16:00:00.000Z';
    /* TeBS iTrack 0015427 Changes - Start */
    //var fetchXml = [
    //    "<fetch>",
    //    "<entity name='sit_sit_promocode_sit_programme'>",
    //    "<attribute name='sit_programmeid' />",
    //    "<attribute name='sit_promocodeid' />",
    //    "<filter>",
    //    "<condition attribute='sit_programmeid' operator='eq' value='", idCourseVal, "'/>",
    //    "<condition entityname='p' attribute='sit_name' operator='eq' value='", promocode, "' />",
    //    "<condition entityname='p' attribute='sit_validfrom' operator='le' value='", checkDateStr, "' />",
    //    "<condition entityname='p' attribute='sit_validto' operator='ge' value='", checkDateStr, "' />",
    //    "</filter>",
    //    "<link-entity name='sit_programme' from='sit_programmeid' to='sit_programmeid' link-type='outer' alias='c'>",
    //    "<attribute name='sit_name' />",
    //    "</link-entity>",
    //    "<link-entity name='sit_promocode' from='sit_promocodeid' to='sit_promocodeid' link-type='outer' alias='p'>",
    //    "<attribute name='sit_name' />",
    //    "<attribute name='sit_quotaremaining' />",
    //    "<attribute name='sit_quoteused' />",
    //    "<attribute name='sit_quota' />",
    //    "<attribute name='sit_validfrom' />",
    //    "<attribute name='sit_validto' />",
    //    "<attribute name='sit_discount' />",
    //    "</link-entity>",
    //    "</entity>",
    //    "</fetch>"].join("");
    //return retrieveDataFetchPromise("sit_sit_promocode_sit_programmeset", fetchXml, callback);
    //var entity = "sit_sit_promocode_sit_programmes";

    var fetchXml = [
        "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'>",
        "<entity name='sit_promocode'>",
        "<attribute name='sit_promocodeid' />",
        "<attribute name='sit_name' />",
        "<attribute name='sit_validto' />",
        "<attribute name='sit_validfrom' />",
        "<attribute name='sit_quoteused' />",
        "<attribute name='sit_quotaremaining' />",
        "<attribute name='sit_quota' />",
        "<attribute name='sit_programme' />",
        "<attribute name='sit_discount' />",
        "<order attribute='sit_name' descending='false' />",
        "<filter type='and'>",
        "<condition attribute='sit_name' operator='eq' value='", promocode, "' />",
        "<condition attribute='sit_validfrom' operator='le' value='", checkDateStr, "' />",
        "<condition attribute='sit_validto' operator='ge' value='", checkDateStr, "' />",
        "</filter>",
        "<link-entity name='sit_sit_promocode_sit_programme' from='sit_promocodeid' to='sit_promocodeid' visible='false' intersect='true'>",
        "<link-entity name='sit_programme' from='sit_programmeid' to='sit_programmeid' alias='aa'>",
        "<filter type='and'>",
        "<condition attribute='sit_programmeid' operator='eq' value='", idCourseVal, "' />",
        "</filter>",
        "</link-entity>",
        "</link-entity>",
        "</entity>",
        "</fetch>"].join("");
    var entity = "sit_promocodes";
    /* TeBS iTrack 0015427 Changes - End */
    var url = "/_api/" + entity + "?fetchXml=" + encodeURIComponent(fetchXml);
    var response = await portalWebApiRetrieveData(url);
    if (response.status === 200) {
        /* TeBS iTrack 0015427 Changes - Start */
        if (response.results != null) {
            resultColl = response.results;
        }
        /* TeBS iTrack 0015427 Changes - End */
    }
    else if (response.status === 401) {
        if (!noRetry) {
            sessionStorage.removeItem("token_sitlearn");
            response = await portalWebApiRetrieveData(url);
            /* TeBS iTrack 0015427 Changes - Start */
            if (response.results != null) {
                resultColl = response.results;
            }
            /* TeBS iTrack 0015427 Changes - End */
        }
    }
    else {
        alert("Error " + response.statustext);
    }

    return resultColl;
}

async function processPromoCodeForSLCChange(promocode) {
    //var dtd = $.Deferred();
    //$.when(retrievePromoCode(promocode)).done(function (resultsPromo) {
    //    if (resultsPromo && resultsPromo.value && resultsPromo.value.length) {
    //        sit_promocodeid = resultsPromo.value[0]["sit_promocodeid"];
    //        sit_quoteused = parseInt(resultsPromo.value[0]["p.sit_quoteused"]);
    //        isNaN(sit_quoteused) && (sit_quoteused = 0);
    //        sit_quota = parseInt(resultsPromo.value[0]["p.sit_quota"]);
    //        isNaN(sit_quota) && (sit_quota = 0);
    //        var entityPromo = {};
    //        entityPromo.sit_quoteused = sit_quoteused - 1 < 0 ? 0 : sit_quoteused - 1;
    //        entityPromo.sit_quotaremaining = sit_quota - entityPromo.sit_quoteused;
    //        $.when(webApiUpdateFinalPromise(entityPromo, "sit_promocodes", sit_promocodeid)).done(function () {
    //            dtd.resolve(1);
    //        }).fail(function () {
    //            dtd.resolve(-1)
    //        });
    //    } else {
    //        dtd.resolve(0);
    //    }
    //}).fail(function () {
    //    dtd.resolve(-1)
    //});
    await Promise.all([retrievePromoCode(promocode)]).then(async function (resultsPromo) {
        /* TeBS iTrack 0015427 Changes - Start */
        var promoVal = resultsPromo[0];
        if (promoVal && promoVal.value && promoVal.value.length) {
            /* TeBS iTrack 0015427 Changes - End */
            sit_promocodeid = promoVal.value[0]["sit_promocodeid"];
            sit_quoteused = parseInt(promoVal.value[0]["sit_quoteused"]);
            isNaN(sit_quoteused) && (sit_quoteused = 0);
            sit_quota = parseInt(promoVal.value[0]["sit_quota"]);
            isNaN(sit_quota) && (sit_quota = 0);
            var entityPromo = {};
            entityPromo.sit_quoteused = sit_quoteused - 1 < 0 ? 0 : sit_quoteused - 1;
            entityPromo.sit_quotaremaining = sit_quota - entityPromo.sit_quoteused;
            await Promise.all([webApiUpdateFinalPromise(entityPromo, "sit_promocodes", sit_promocodeid)]).then(function () {
                //dtd.resolve(1);
            }).catch(function () {
                //dtd.resolve(-1)
            });
        }
        else {
            //dtd.resolve(0);
        }
    }).catch(function () {
        // dtd.resolve(-1)
    });
    //return dtd.promise();
}
function isSSGFunding(lineItem) {
    var isSSG = false;
    if (fundings && fundings["ssgFundingNameList"] && fundings["ssgFundingNameList"].length && lineItem["_sit_fundingtypeforcoa_value"]) {
        var subFundings = fundings.ssgFundingNameList.filter(function (a) {
            return lineItem["productdescription"].indexOf(a) >= 0;
        });
        if (subFundings.length) {
            isSSG = true;
        }
    }
    return isSSG;
}
function skipCalcuateSFCMaxValue(courseId, newslcinvoice) {
    if (!courseId || $('#lblsit_courseeligibleforsfcredit').val() != "Yes" || !newslcinvoice) {
        return true;
    }
    return false;
}

async function retrieveSFCBaseInfo(courseId, newslcinvoice) {
    if (feeSetup || skipCalcuateSFCMaxValue(courseId, newslcinvoice)) {
        return;
    }
    if (sessionStorage["sfc"] && sessionStorage["sfc"] == "off") {
        sessionStorage.removeItem("sfc_" + courseId);
    }
    if (sessionStorage["sfc_" + courseId]) {
        var baseInfo = JSON.parse(sessionStorage["sfc_" + courseId]);
        feeSetup = baseInfo.feeSetup;
        adminFee = baseInfo.adminFee;
        return;
    } else {
        var dtd = $.Deferred();
        //commented on 14th AUg 2023 VAPT Issue fix
        //$.when(retrieveFeeSetup(courseId), $("#sit_adminfee").val() && retrieveAdminFee($("#sit_adminfee").val())).done(function () {
        //    sessionStorage["sfc_" + courseId] = JSON.stringify({ feeSetup: feeSetup, adminFee: adminFee, fundings: fundings });
        //    dtd.resolve();
        //}).fail(function () {
        //    dtd.reject()
        //});

        await Promise.all([retrieveFeeSetup(courseId), $("#sit_adminfee").val() && retrieveAdminFee($("#sit_adminfee").val())]).then(function () {
            sessionStorage["sfc_" + courseId] = JSON.stringify({ feeSetup: feeSetup, adminFee: adminFee, fundings: fundings });
            //dtd.resolve();
        }).catch(function () {
            //dtd.reject()
        });
        //return dtd.promise();
    }
}
//commented on 14th Aug 2023 VAPT Issue fix
//function retrieveFeeSetup(courseId) {
//    var dataSetUri = "/api/data/v9.1/sit_feesetups?$select=sit_amount,_sit_gstcode_value,sit_slcpayable,sit_sfcpayable,sit_feesetupid&$expand=sit_GSTCode($select=sit_value)&$filter=(_sit_programme_value eq " + courseId + ")";
//    return retrieveDataPromise(dataSetUri, feeSetupCallback);
//}

async function retrieveFeeSetup(courseId) {
    var dataSetUri = "/_api/sit_feesetups?$select=sit_amount,_sit_gstcode_value,sit_slcpayable,sit_sfcpayable,sit_feesetupid&$expand=sit_GSTCode($select=sit_value)&$filter=(_sit_programme_value eq " + courseId + ")";
    var response = await portalWebApiRetrieveData(dataSetUri);
    if (response.status == 200) {
        feeSetupCallback(response.results);
    }
    return response.results;
}
function feeSetupCallback(data) {
    if (data && data.value) {
        data = data.value;
    }
    if (data && data.length) {
        feeSetup = {};
        for (var index = 0; index < data.length; index++) {
            var item = data[index];
            feeSetup[item.sit_feesetupid] = {
                slc: item.sit_slcpayable,
                sfc: item.sit_sfcpayable,
                amount: parseFloat(item.sit_amount ? item.sit_amount : 0),
                gst: parseFloat(item.sit_GSTCode && item.sit_GSTCode.sit_value ? item.sit_GSTCode.sit_value : 0)
            };
        }
    }
    printLog(feeSetup);
}

//commented on 14th Aug 2023 VAPT Issue fix
//function retrieveAdminFee(adminfeeId) {
//    var dataSetUri = "/api/data/v9.1/sit_adminfees?$select=sit_adminfeeid,sit_payablebyslc,sit_payablebysfc,sit_amount,_sit_gstcode_value&$expand=sit_GSTCode($select=sit_value)&$filter=(sit_adminfeeid eq " + adminfeeId + ")";
//    return retrieveDataPromise(dataSetUri, adminFeeCallback);
//}


async function retrieveAdminFee(adminfeeId) {
    var dataSetUri = "/_api/sit_adminfees?$select=sit_adminfeeid,sit_payablebyslc,sit_payablebysfc,sit_amount,_sit_gstcode_value&$expand=sit_GSTCode($select=sit_value)&$filter=(sit_adminfeeid eq " + adminfeeId + ")";
    var response = await portalWebApiRetrieveData(dataSetUri);
    if (response.status == 200) {
        adminFeeCallback(response.results);
    }
    return response.results;
}
function adminFeeCallback(data) {
    if (data && data.value) {
        data = data.value;
    }
    if (data && data.length) {
        data = data[0];
        adminFee = {
            slc: data.sit_payablebyslc, sfc: data.sit_payablebysfc,
            amount: parseFloat(data.sit_amount ? data.sit_amount : 0),
            gst: parseFloat(data.sit_GSTCode && data.sit_GSTCode.sit_value ? data.sit_GSTCode.sit_value : 0)
        };
    }
    printLog(adminFee);
}

async function retrieveFunding(courseId) {
    if (fundings) {
        return;
    }
    if (sessionStorage["sfc"] && sessionStorage["sfc"] == "off") {
        sessionStorage.removeItem("sfc_fundings_" + courseId);
        sessionStorage.removeItem("lfl_funding_title");
    }
    if (sessionStorage["sfc_fundings_" + courseId]) {
        var baseInfo = JSON.parse(sessionStorage["sfc_fundings_" + courseId]);
        fundings = baseInfo.fundings;
    } else {
        // TeBS CR1924 Learn for Life Token Changes - Added sit_learnforlifetoken column
        var fetchXml = [
            "<fetch top='50'>",
            "  <entity name='sit_funding'>",
            "    <attribute name='sit_gstincluded' />",
            "    <attribute name='sit_lessgstapplicable' />",
            "    <attribute name='sit_name' />",
            "    <attribute name='sit_fundingprovidertype' />",
            "    <attribute name='sit_learnforlifetoken' />",
            "    <link-entity name='sit_sit_programme_sit_fundings' from='sit_fundingid' to='sit_fundingid' link-type='inner' alias='c' intersect='true'>",
            "      <attribute name='sit_programmeid' />",
            "      <filter>",
            "        <condition attribute='sit_programmeid' operator='eq' value='", courseId, "'/>",
            "      </filter>",
            "    </link-entity>",
            "  </entity>",
            "</fetch>",
        ].join("");
        //return retrieveDataFetchPromise("sit_fundings", fetchXml, fundingCallback); //commented on 12th Aug 2023 VAPT Issue fix
        entity = "sit_fundings";
        var url = "/_api/" + entity + "?fetchXml=" + encodeURIComponent(fetchXml);
        var response = await portalWebApiRetrieveData(url);
        if (response.status === 200) {
            fundingCallback(response.results);
        }
        else if (response.status === 401) {
            if (!noRetry) {
                sessionStorage.removeItem("token_sitlearn");
                response = await portalWebApiRetrieveData(url);
            }
        }
        else {
            alert("Error " + response.statustext);
        }

        return response.results;
    }
}
function fundingCallback(data) {
    if (data && data.value && data.value.length) {
        fundings = {};
        fundings["fundingNameList"] = [];
        fundings["ssgFundingNameList"] = [];
        for (var index = 0; index < data.value.length; index++) {
            var item = data.value[index];//907700003 SSG
            fundings[item.sit_name] = { sit_fundingprovidertype: item.sit_fundingprovidertype, sit_gstincluded: item.sit_gstincluded, sit_lessgstapplicable: item.sit_lessgstapplicable, sit_fundingid: item.sit_fundingid, sit_learnforlifetoken: item.sit_learnforlifetoken };
            fundings["fundingNameList"].push(item.sit_name);
            if (item.sit_fundingprovidertype == 907700003) {
                fundings["ssgFundingNameList"].push(item.sit_name);
            }
            /* TeBS CR1924 Learn for Life Token Changes - Start */
            if (item.sit_learnforlifetoken == true) {
                sessionStorage["lfl_funding_title"] = item.sit_name;
            }
            /* TeBS CR1924 Learn for Life Token Changes - End */
        }
        printLog(fundings);
        sessionStorage["sfc_fundings_" + idCourseVal] = JSON.stringify({ fundings: fundings });
    }
}
function isTaxable(lineItem) {
    var result = true;
    if (fundings && fundings["fundingNameList"] && fundings["fundingNameList"].length) {
        var subList = fundings["fundingNameList"].filter(function (a) { return lineItem["productdescription"].indexOf(a) >= 0 });
        if (subList && subList.length) {
            result = !fundings[subList[0]].sit_lessgstapplicable;
        }
    }
    return result;
}
function getSLCAmountAndGST(linItems) {
    var result = { slcAmount: 0, gstPercent: 0.01 };
    var slcAndLessGSTLineItem = linItems.filter(function (a) {
        return a["_sit_slcforcoa_value"] || a["productdescription"] == "Less: GST subsidy";
    });
    if (slcAndLessGSTLineItem && slcAndLessGSTLineItem.length) {
        for (var i = 0; i < slcAndLessGSTLineItem.length; i++) {
            if (slcAndLessGSTLineItem[i]["_sit_slcforcoa_value"]) {
                result.slcAmount = Math.abs(slcAndLessGSTLineItem[i]["extendedamount"]);
            } else if (slcAndLessGSTLineItem[i]["productdescription"] == "Less: GST subsidy") {
                result.gstPercent = 0;
            }
        }
    }
    return result;
}
function discountAmountInfo(linItems, feeSetupLineItem, feeSetupLineItemIndex) {
    var nextlineitem = {}, result = { currentFeeAmount: 0, taxableAmount: 0 };
    var fundingList = linItems.filter(function (a) {
        return a["_sit_fundingtypeforcoa_value"] && a["_sit_feesetupforfunding_value"] && a["_sit_feesetupforfunding_value"] == feeSetupLineItem["_sit_feesetupforcoa_value"];
    });
    printLog(feeSetupLineItem["productdescription"] + "(Fundings):");
    printLog(fundingList);
    for (var j = 0; j < fundingList.length; j++) {
        nextlineitem = fundingList[j];
        if (isTaxable(nextlineitem)) {
            result.currentFeeAmount += nextlineitem["extendedamount"] ? parseFloat(nextlineitem["extendedamount"]) : 0;
            if (parseFloat(nextlineitem["extendedamount"]) < 0) {
                result.taxableAmount += nextlineitem["extendedamount"] ? parseFloat(nextlineitem["extendedamount"]) : 0;
            }
        } else {
            result.currentFeeAmount += nextlineitem["extendedamount"] ? parseFloat(nextlineitem["extendedamount"]) : 0;
        }
    }
    for (var j = feeSetupLineItemIndex + 1; j < linItems.length; j++) {
        nextlineitem = linItems[j];
        if (nextlineitem["_sit_promocodecoa_value"]) {
            result.currentFeeAmount += nextlineitem["extendedamount"] ? parseFloat(nextlineitem["extendedamount"]) : 0;
        } else if (nextlineitem["_sit_fundingtypeforcoa_value"]) {
            continue;
        } else {
            break;
        }
    }
    printLog(feeSetupLineItem["productdescription"] + ":" + feeSetupLineItem["extendedamount"] + ", taxableAmount = " + result.taxableAmount);
    return result;
}
function calcuateSFCMaxValue(courseId, linItems, newslcinvoice) {
    if (skipCalcuateSFCMaxValue(courseId, newslcinvoice)) {
        sfcMaxValue = parseFloat(Math.abs($('#lblsit_thresholdforthesfcredit').val()));
        return;
    }
    var sfcFeeAmount = 0, slcAmount = 0, currentFeeAmount = 0, dicountInfo = null, gstPercent = 0.01, taxableAmount = 0;
    if (!feeSetup) {
        sfcMaxValue = parseFloat(Math.abs($('#lblsit_thresholdforthesfcredit').val()));
        return;
    }
    var slcAndGst = getSLCAmountAndGST(linItems);
    slcAmount = slcAndGst.slcAmount;
    gstPercent = slcAndGst.gstPercent;
    for (var i = 0; i < linItems.length; i++) {
        var lineitem = linItems[i];
        if (!lineitem["extendedamount"]) {
            continue;
        }
        currentFeeAmount = lineitem["extendedamount"] = lineitem["extendedamount"] ? parseFloat(lineitem["extendedamount"]) : 0;
        if (lineitem["_sit_feesetupforcoa_value"]) {
            var fee = feeSetup[lineitem["_sit_feesetupforcoa_value"]];
            if (fee) {
                dicountInfo = discountAmountInfo(linItems, lineitem, i);
                taxableAmount = dicountInfo.taxableAmount;
                currentFeeAmount += dicountInfo.currentFeeAmount;
                if (fee.slc) {
                    if (slcAmount > 0) {
                        if (slcAmount - currentFeeAmount < 0) {
                            if (fee.sfc) {
                                currentFeeAmount = Math.abs(slcAmount - currentFeeAmount);
                                printLog(lineitem["productdescription"] + "(SFC) Amount:" + currentFeeAmount + ", GST:" + Number.parseFloat(((currentFeeAmount + Math.abs(taxableAmount)) * gstPercent * fee.gst).toFixed(2)));
                                sfcFeeAmount += currentFeeAmount;
                                sfcFeeAmount += Number.parseFloat(((currentFeeAmount + Math.abs(taxableAmount)) * gstPercent * fee.gst).toFixed(2));
                            }
                            slcAmount = 0;
                        } else {
                            slcAmount -= currentFeeAmount;
                            if (fee.sfc) {
                                sfcFeeAmount += Number.parseFloat((Math.abs(taxableAmount) * gstPercent * fee.gst).toFixed(2));
                                printLog(lineitem["productdescription"] + "(SFC) Amount:" + currentFeeAmount + ", GST:" + Number.parseFloat((Math.abs(taxableAmount) * gstPercent * fee.gst).toFixed(2)));
                            }
                        }
                    } else if (fee.sfc) {
                        sfcFeeAmount += currentFeeAmount;
                        sfcFeeAmount += Number.parseFloat(((currentFeeAmount + Math.abs(taxableAmount)) * gstPercent * fee.gst).toFixed(2));
                        printLog(lineitem["productdescription"] + "(SFC) Amount:" + currentFeeAmount + ", GST:" + Number.parseFloat(((currentFeeAmount + Math.abs(taxableAmount)) * gstPercent * fee.gst).toFixed(2)));
                    }
                } else if (fee.sfc) {
                    sfcFeeAmount += currentFeeAmount;
                    sfcFeeAmount += Number.parseFloat(((currentFeeAmount + Math.abs(taxableAmount)) * gstPercent * fee.gst).toFixed(2));
                    printLog(lineitem["productdescription"] + "(SFC) Amount:" + currentFeeAmount + ", GST:" + Number.parseFloat(((currentFeeAmount + Math.abs(taxableAmount)) * gstPercent * fee.gst).toFixed(2)));
                }
            }
        } else if (lineitem["_sit_adminfeeforcoa_value"]) {
            var fee = adminFee;
            if (fee) {
                if (fee.slc) {
                    if (slcAmount > 0) {
                        slcAmount -= currentFeeAmount;
                        if (slcAmount < 0 && fee.sfc) {
                            currentFeeAmount = Math.abs(slcAmount);
                            sfcFeeAmount += currentFeeAmount;
                            printLog("Admin Fee(SFC) = " + currentFeeAmount);
                            slcAmount = 0;
                        }
                    } else if (fee.sfc) {
                        printLog("Admin Fee(SFC) = " + currentFeeAmount);
                        sfcFeeAmount += currentFeeAmount;
                    }
                } else if (fee.sfc) {
                    printLog("Admin Fee(SFC) = " + currentFeeAmount);
                    sfcFeeAmount += currentFeeAmount;
                }
            }
        } else if (lineitem["_sit_adminfeegstcodeforcoa_value"]) {
            var fee = adminFee;
            if (fee && fee.sfc) {
                sfcFeeAmount += currentFeeAmount;
                printLog("Admin Fee GST(SFC) = " + currentFeeAmount);
            }
        }
    }
    var courseSFC = parseFloat(Math.abs($('#lblsit_thresholdforthesfcredit').val()));
    printLog("sfcFeeAmount = " + sfcFeeAmount);
    printLog("totalAmount = " + totalAmtFinal);
    printLog("courseSFC = " + courseSFC);
    sfcMaxValue = courseSFC > sfcFeeAmount ? sfcFeeAmount : courseSFC;
    sfcMaxValue = sfcMaxValue > totalAmtFinal ? totalAmtFinal : sfcMaxValue;
    sfcMaxValue = Number.parseFloat((sfcMaxValue).toFixed(2));
    if (sfcMaxValue < 0) {
        sfcMaxValue = 0;
    }
    printLog("sfcMaxValue = " + sfcMaxValue);
}
function printLog(message) {
    if (sessionStorage && sessionStorage["log"] && sessionStorage["log"] == "on") {
        console.log(message);
    }
}
function displayAdminFeeDescription() {
    if (!hasAdminFeelineItem && hasslclineItem && $("#sit_adminfee").val()) {
        $(".adminfeeDescription").show();
    }
}

function displayFooterButton(isInit) {
    if (sfcSelecedValue == 1 && !initSFCDisabled(true)) {
        $('#sfcSubmitBtn').show();
        sfcEnable = true;
        $('#submitId').hide();
        $('#PayId').hide();
        return;
    }
    if (!isInit && $('#lblsit_paymentmethod').val() == "907700001"
        || isInit && $('#PaymentMode').val() == "907700001"
        || parseFloat($('#tdTotal').html().split('$')[1].trim().replace(',', '')) == 0
        || $('#lblregistrationapprovalrequired').val() == "true" && ($('#lblRegistrationstatus').val().toLowerCase() == "pending approval"
            || $('#lblRegistrationstatus').val().toLowerCase() == "draft")) {
        $('#submitId').show();
        $('#PayId').hide();
    }
    else {
        $('#PayId').show();
        $('#submitId').hide()
    }
}

/* TeBS CR1924 Learn for Life Token Changes - Start */
function enableLFL() {
    var result = $("#sit_learntokenpayable").val() == 'true'
        && $("#sit_sitalumni").val() == 'true'
        && $("#sit_learntokenissued").val() == 'true'
        && $("#sit_learntokenusage").val() == 'false'
        && $("#sit_learntokenexpirydate").val() >= $("#nowDateStr").val()
        && $("#lblRegistrationsType").val() == 'Self'
    return result;
}

function lflConfirmOK() {
    lflConfirmClose();
    document.getElementById('lflModalSubmit').style.display = "block";
}

function lflConfirmClose() {
    $("#lflConfirm").hide();
}

function lflPopupCloseSubmit() {
    var modalNew = document.getElementById('lflModalSubmit');
    modalNew.style.display = "none";
}

function initLFLChecked(value) {
    if ($('#sit_uselearntoken').val() == value) {
        return "checked";
    }

    return "";
}

function initLFLDisabled() {
    lflEnable = false;
    if ($("#lblRegistrationstatus").val() == "Pending Payment") {
        return "disabled";
    }
    lflEnable = true;
    return "";
}

async function lflChange(value) {
    showloading();
    $('#sit_uselearntoken').val(value);
    await updateUseLFLForRegistration(value);
}

async function updateUseLFLForRegistration(value) {
    var entity = {};

    if (value == '1') {
        $('#lblsit_promocode').val("");
        entity["sit_promocode"] = "";
        $('#sit_useslccredit').val(0);
        entity["sit_useslccredit"] = false;
        entity["sit_usedslcamount"] = 0.00;
        entity["sit_uselearntoken"] = true;
    }
    else {
        entity["sit_uselearntoken"] = false;
    }

    entity["sit_invoiceprogress"] = 907700001;
    var url = "/_api/sit_registrations(" + idVal + ")";
    var response = await portalWebApiUpdateData(url, JSON.stringify(entity));

    if (response != null && response.status != null && response.status == 204) {
        await pageLoad();
    }
    else {
        hideloading();
    }
}

function loadLFLToken() {
    var lflHtml = "";
    if (!enableLFL() || existingUsingLFL) {
        return lflHtml;
    }

    existingUsingLFL = true;
    lflHtml += "<tr>";
    lflHtml += '<td class="Firsttd">Redeem Learn for Life Token</td>';
    lflHtml += '<td class="Secondtd"><input type="radio" id="usingLFLYes" ' + initLFLChecked(1) + ' ' + initLFLDisabled() + ' name="usingLFL" value="1" onchange="lflChange(1);"> Yes';
    lflHtml += ' <input type="radio" name="usingLFL" id="usingLFLNo" ' + initLFLChecked(0) + ' ' + initLFLDisabled() + ' value="0" onchange="lflChange(0);"> No';
    lflHtml += '</tr>';
    return lflHtml;
}

async function updateContactLFLTokenUsage() {
    var contactId = $("#lblLoginUserHeader").val();
    var entity = {};
    entity["sit_learntokenusage"] = true;
    entity["sit_learntokenutiliseddate"] = new Date().toISOString();
    var url = "/_api/contacts(" + contactId + ")";
    var response = await portalWebApiUpdateData(url, JSON.stringify(entity));
}
/* TeBS CR1924 Learn for Life Token Changes - End */

async function resetLFLToken() {
    showloading();
    lflPopupCloseSubmitCheck();
    $('#sit_uselearntoken').val(0);
    await updateUseLFLForRegistration(0);
}

function lflPopupCloseSubmitCheck() {
    var modalNew = document.getElementById('lflModalSubmitCheck');
    modalNew.style.display = "none";
}
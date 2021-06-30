(function (vaApp, $, undefined) {
    $.model = new kendo.observable({
        // set the default digest value - required for post operations
        digest: $('#__REQUESTDIGEST').val(),

        // relative url
        _siteUrl: _spPageContextInfo.webServerRelativeUrl,

        // EPS Codes List
        _spEPSCodesItem: "/_api/web/lists/getByTitle('EPS Codes')/items",
        _spEPSCodesItemArgs: '?$select=Title,EPS_x0020_Project_x0020_Name&$top=5000',
        epsCodesListUrl: () => {
            return $.model._siteUrl + $.model._spEPSCodesItem + $.model._spEPSCodesItemArgs;
        },

        // Communication Tracking List
        _spCommTrackerItem: "/_api/web/lists/getByTitle('Communications Tracking')/items",
        _spCommTrackerItemArgs: '?$select=Id,Title,PM,Who_x0020_made_x0020_contact,Submission_x0020_ID,Date_x0020_back_x0020_to_x0020_P,Redaction_x0020_Start_x0020_Date,Date_x0020_Posted_x0020_to_x0020,Notes,Status,Redacted_x0020_By,Date_x0020_CiF_x0020_Received,Lines_x0020_of_x0020_code_x0020_,Returned_x0020_from_x0020_projec,Project_x0020_Manager/Title&$expand=Project_x0020_Manager&$top=5000',
        commTrackerListUrl: () => {
            return $.model._siteUrl + $.model._spCommTrackerItem;
        }
    });

    $.init = () => {
        $.dsEpsCodes = new kendo.data.DataSource({
            transport: {
                read: (options) => {
                    Lib.readData((response) => {
                        options.success(response);
                    }, $.model.epsCodesListUrl());
                }
            },
            error: (e) => {
                console.log(e);
            }
        });

        $.dsCommTracker = new kendo.data.DataSource({
            transport: {
                create: (options) => {},
                read: (options) => {
                    Lib.readData((response) => {
                        options.success(response);
                    }, $.model.commTrackerListUrl() + $.model._spCommTrackerItemArgs);
                },
                update: (options) => {},
                destroy: (options) => {}
            },
            pageSize: 10,
            schema: {
                model: {
                    id: 'Id',
                    fields: {
                        Title: { type: 'string' },
                        PM: { type: 'string' },
                        Who_x0020_made_x0020_contact: { type: 'string' },
                        Submission_x0020_ID: { type: 'string'},
                        Date_x0020_back_x0020_to_x0020_P: { type: 'date' },
                        Redaction_x0020_Start_x0020_Date: { type: 'date' },
                        Date_x0020_Posted_x0020_to_x0020: { type: 'date' },
                        Notes: { type: 'string' },
                        Status: { type: 'string' },
                        Redacted_x0020_By: { type: 'string' },
                        Date_x0020_CiF_x0020_Received: { type: 'date' },
                        Lines_x0020_of_x0020_code_x0020_: { type: 'number' },
                        Returned_x0020_from_x0020_projec: { type: 'date' },
                        Project_x0020_Manager: { type: 'string' }
                    }
                }
            },
            error: (e) => {
                console.log(e);
            }
        });
    }


    // internal Ajax CRUD functions
    Lib = {
        readData: function (callback,url) {
            $.ajax({
                url: url,
                dataType: 'json',
                type: 'GET',
                async: true,
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'Content-Type': 'application/json;odata=nometadata'
                },
                success: function (data) {
                    callback(data.value);
                },
                error: function (xhr) {
                    callback(xhr);
                }
            })
        },
        createData: function (callback, args, url) {
            Utils.getDigest();
            delete args.data['Id'];
            $.ajax({
                url: url,
                method: 'POST',
                data: JSON.stringify(Utils.cleanseModel(args.data)),
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'Content-Type': 'application/json;odata=nometadata',
                    'X-RequestDigest': vaApp.model.digest,
                    'X-HTTP-Method': 'POST'
                },
                success: function (data, status, xhr) {
                    callback(data);
                },
                error: function (xhr, status, error) {
                    console.log(xhr, status, error);
                    args.error({});
                }
            });
        },
        updateData: function (args, url) {
            Utils.getDigest();
            $.ajax({
                url: url + '(' + args.data.Id + ')',
                method: 'PATCH',
                data: JSON.stringify(Utils.cleanseModel(args.data)),
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'Content-Type': 'application/json;odata=nometadata',
                    'X-RequestDigest': vaApp.model.digest,
                    'IF-MATCH': '*',
                    'X-HTTP-Method': 'PATCH'
                },
                success: function (data, status, xhr) {
                    args.success({});
                },
                error: function (xhr, status, error) {
                    console.log(xhr, status, error);
                    args.error({});
                }
            });
        },
        deleteData: function (args, url) {
            Utils.getDigest();
            $.ajax({  
                url: url + '(' + args.data.Id + ')',
                method: "POST",  
                headers: {  
                    'Accept': 'application/json;odata=nometadata',
                    'Content-Type': 'application/json;odata=nometadata',
                    'X-RequestDigest': vaApp.model.digest,
                    'IF-MATCH': '*',
                    'X-HTTP-Method': 'DELETE'
                },  
                success: function (data, status, xhr) {
                    args.success({});
                },
                error: function (xhr, status, error) {
                    console.log(xhr, status, error);
                    args.error({});
                }
            });
        }
    }

    // internal utility functions
    Utils = {
        showMessage: (title, message) => {
            var displayMessage = $('#_message').data('kendoWindow');
            displayMessage.title(title);
            displayMessage.content(message);
            displayMessage.open();
        },
        getDigest: () => {
            $.ajax({
                url:  vaApp.model._siteUrl + '/_api/contextinfo',
                dataType: 'json',
                type: 'POST',
                async: true,
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                },
                success: function (response) {
                    vaApp.model.set('digest', response.d.GetContextWebInformation.FormDigestValue);
                },
                error: function (xhr) {
                    Utils.showMessage('Error: Digest Request Failure','There was a communication error with SharePoint obtaining the request digest needed for POST operations. See the console log for more details...');
                    console.log(xhr);
                }
            });
        },
        cleanseModel: (model) => {
            delete model['__kendo_devtools_id'];
            delete model['__metadata'];
            delete model['Created'];
            delete model['Modified'];
            delete model['metadataLastUpdated'];
            delete model['Editor'];
            delete model['value'];
            model['Title'] = model['Title'].toString();
            console.log(model);
            return model;
        }
    }
} (window.vaApp = window.vaApp = window.$ || {}, jQuery));

// when document ready
$( () => {
    $.init();
});
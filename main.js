let StatementsBase64Array = [];
let allSelectedInvoices = [];
let InvoicesBase64Array = [];
let selectedInvoices = {};
let selectedfiles = {};
let jwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNzIyODgiLCJlbWFpbCI6ImNwcm8yNzE0QGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6IkRldiIsImxhc3ROYW1lIjoiQ2hldGFuIiwicGljdHVyZSI6IiIsInBlcm1pc3Npb25zIjpbIk1BTkFHRV9URU1QTEFURVMiLCJNQU5BR0VfSU5URUdSQVRJT05TIiwiUkVBRF9KT0JfUkVTVUxUUyIsIkNSRUFURV9KT0IiLCJVU0VfT0NSX1RPT0wiLCJVU0VfT0NSX1RBQkxFU19UT09MIiwiVVNFX1RBQkxFU19UT09MIiwiVVNFX0hBTkRXUklUSU5HX1RPT0wiXSwiaWF0IjoxNzIwNTE0MDMwLCJleHAiOjQ4NzYyNzQwMzB9.0CA5UrSM1MoBPgsRIOC7kRHDB-p-NtnlptmbdWX-s38`;
let url = "http://localhost:3001/testing";
// let url = "https://docuextract-backend-1.onrender.com/testing";
let formData;

let dmsDocResult = [];

let dmsDocBase64Result = [];

let dmsInvoiceConvertedData = [];

// Get the URL search parameters
const urlSearchParams = new URLSearchParams(window.location.search);

// Access the 'ids' parameter
const ecryptedObj = urlSearchParams.get('schema');

const decodedObj = ecryptedObj ? JSON.parse(atob(ecryptedObj)) : { ids: [], type: '' };

let dmsDocIds = decodedObj.ids;

// if (idsString && idsString.length > 0) {
//     dmsDocIds = idsString.split(",")
// }

function renderDataGrid(Data) {
    $('#gridContainer').dxDataGrid({
        dataSource: Data,
        paging: {
            pageSize: 10,
        },
        export: {
            enabled: true,
            fileName: "file",
            allowExportSelectedData: true
        },
        columnChooser: {
            enabled: true,
            mode: "select",// or "select"
            allowSearch: true
        },
        pager: {
            showPageSizeSelector: true,
            allowedPageSizes: [10, 20, 50, 100],
        },
        remoteOperations: false,
        searchPanel: {
            visible: true,
            highlightCaseSensitive: true,
        },
        groupPanel: { visible: true },
        grouping: {
            autoExpandAll: false,
        },
        columns: [
            { dataField: "date", caption: "Date" },
            { dataField: "date2", caption: "Date 2" },
            { dataField: "description", caption: "Description" },
            { dataField: "amount", caption: "Amount" },
            { dataField: "balance", caption: "Balance" },
            { dataField: "checkNumber", caption: "Check Number" },
            { dataField: "account", caption: "Account" }
        ],
        stateStoring: {
            enabled: true,
            type: "custom",
            customLoad: function () {
                return JSON.parse(localStorage.getItem("view2"));
            },
            customSave: function (state) {
                localStorage.setItem("view2", JSON.stringify(state));
            }
        },
        selection: {
            mode: "multiple"
        },
        scrolling: {
            columnRenderingMode: "standard",
            mode: "standard",
            preloadEnabled: false,
            rowRenderingMode: "standard",
            scrollByContent: true,
            scrollByThumb: false,
            showScrollbar: "onScroll",
            useNative: "auto",
            useNative: true
        },
        allowColumnReordering: true,
        rowAlternationEnabled: true,
        showBorders: true,
    })
}

function renderInvoiceDataGrid(targetGrid, Data) {
    $(`#${targetGrid}`).dxDataGrid({
        dataSource: Data,
        paging: {
            pageSize: 10,
        },
        export: {
            enabled: true,
            fileName: "file",
            allowExportSelectedData: true
        },
        columnChooser: {
            enabled: true,
            mode: "select",// or "select"
            allowSearch: true
        },
        pager: {
            showPageSizeSelector: true,
            allowedPageSizes: [10, 25, 50, 100],
        },
        remoteOperations: false,
        searchPanel: {
            visible: true,
            highlightCaseSensitive: true,
        },
        groupPanel: { visible: true },
        grouping: {
            autoExpandAll: false,
        },
        columns: [
            { dataField: "id", caption: "Invoice" },
            { dataField: "date", caption: "Invoice Date" },
            { dataField: "dueDate", caption: "Due Date" },
            { dataField: "tax", caption: "Tax" },
            { dataField: "total", caption: "Total" },
            { dataField: "item", caption: "Item" },
            { dataField: "quantity", caption: "Quantity" },
            { dataField: "unitPrice", caption: "Unit Price" },
            { dataField: "price", caption: "Price" },
            { dataField: "service", caption: "Service" },
            { dataField: "category", caption: "Category" },
            { dataField: "customerExcel", caption: "Customer" },
            { dataField: "vendorExcel", caption: "Vendor" },
        ],
        stateStoring: {
            enabled: true,
            type: "custom",
            customLoad: function () {
                return JSON.parse(localStorage.getItem("view"));
            },
            customSave: function (state) {
                localStorage.setItem("view", JSON.stringify(state));
            }
        },
        selection: {
            mode: "multiple"
        },
        scrolling: {
            columnRenderingMode: "standard",
            mode: "standard",
            preloadEnabled: false,
            rowRenderingMode: "standard",
            scrollByContent: true,
            scrollByThumb: false,
            showScrollbar: "onScroll",
            useNative: "auto",
            useNative: true
        },
        allowColumnReordering: true,
        rowAlternationEnabled: true,
        showBorders: true,
    })
}

function sendDoc(event) {
    // console.log(StatementsBase64Array, "StatementsBase64Array");



    StatementsBase64Array.reduce((prevPromise, group) => {
        return prevPromise.then(() => {

            return axios.post(`http://localhost:3001/processBankStatementsUpdatedApi`, { base64: group }).then(function (res) {
                if (res.data.documentId) {
                    axios.post(`http://localhost:3001/createJob`, {
                        documentId: res.data.documentId,
                        jobType: ""
                    }).then(res => {
                        let jobId = res.data.jobId;
                        if (jobId) {
                            let interval_ID = setInterval(() => {
                                axios.post(`http://localhost:3001/jobStatus`, {
                                    jobId: jobId
                                }).then(res => {
                                    let jobSts = res.data.status;
                                    if (jobSts === "Succeeded") {
                                        clearInterval(interval_ID);
                                        axios.post(`http://localhost:3001/transactions`, {
                                            jobId: jobId
                                        }).then(res => {
                                            $("#Loading").addClass("d-none");
                                            $('#gridContainer').removeClass("d-none");
                                            $("#Reset_Btn").removeAttr("disabled").removeClass("opacity-5");
                                            $(".remove-normal-sts-doc-btn").addClass('d-none');
                                            renderDataGrid(res.data.transactions);
                                        }).catch(err => {
                                            $("#Loading").addClass("d-none");
                                            clearInterval(interval_ID);
                                            Swal.fire('Unable to process document!', 'Please try again.', 'error');
                                        })
                                    } else if (jobSts === "OutOfCredits") {
                                        axios.post(`http://localhost:3001/resumeJob`, {
                                            jobId: jobId
                                        }).then(res => {
                                            console.log('Job Resumed Success', res.data.status);
                                        }).catch(err => {
                                            // console.log("Error while trying to resume job", err);
                                            $("#Loading").addClass("d-none");
                                            clearInterval(interval_ID);
                                            Swal.fire('Unable to process document!', 'Please try again.', 'error');
                                        })
                                    }
                                }).catch(err => {
                                    $("#Loading").addClass("d-none");
                                    clearInterval(interval_ID);
                                    Swal.fire('Unable to process document!', 'Please try again.', 'error');
                                })
                            }, 3000);
                            // axios.post(`http://localhost:3001/jobStatus`, {
                            //     jobId: jobId
                            // }).then(res=>{
                            //     let jobStatus = res.data.status;

                            // })
                        } else {
                            console.error("Unable to create job");
                        }
                    }).catch(err => {
                        $("#Loading").addClass("d-none");
                        Swal.fire('Unable to process document!', 'Please try again', 'error');
                    })
                } else {
                    console.error("Document Id not found");
                }
                // $("#Loading").addClass("d-none");
                // $('#gridContainer').removeClass("d-none");
                // $("#Reset_Btn").removeAttr("disabled").removeClass("opacity-5");
                // renderDataGrid(res.data.transactions);
            }).catch(function (err) {
                console.log("Api failed", err);
            });

            // return axios.post(`http://localhost:3001/processBankStatements`, { base64: group }).then(function (res) {
            //     $("#Loading").addClass("d-none");
            //     $('#gridContainer').removeClass("d-none");
            //     $("#Reset_Btn").removeAttr("disabled").removeClass("opacity-5");
            //     renderDataGrid(res.data.transactions);
            // }).catch(function (err) {
            //     console.log("Api failed", err);
            // });
        });
    },
        Promise.resolve()
    ).then(res => {

    }).catch(err => {
        console.log("Error while calling Json_GetItemBase64DataById", err);
    });




    // let allFiles = document.getElementById("bankStatements").files;
    // let allFiles = selectedfiles;
    // formData = "";
    // formData = new FormData();
    // formData.append('document', allFiles[0]);
    // event.preventDefault();

    // axios.post("http://localhost:3001/processBankStatements", formData)
    //     .then(response => {
    //         $("#Loading").addClass("d-none");
    //         $('#gridContainer').removeClass("d-none");
    //         $("#Reset_Btn").removeAttr("disabled").removeClass("opacity-5");
    //         renderDataGrid(response.data.transactions);
    //     })
    //     .catch(error => {
    //         console.error(error);
    //     });

    // axios.post(url, formData)
    //     .then(response => {
    //         $("#Loading").addClass("d-none");
    //         $('#gridContainer').removeClass("d-none");
    //         renderDataGrid(response.data.transactions);
    //     })
    //     .catch(error => {
    //         console.error(error);
    //     });
}

async function sendInvoice(event, file) {
    formData = "";
    formData = new FormData();
    formData.append('document', file);
    event.preventDefault();
    axios.post(`${url}?type=Invoice`, formData)
        .then(response => {

            // const tempObj = JSON.parse(response.data.transactions[0].row).lines[0];
            // let testObj = [{...JSON.parse(response.data.transactions[0].row), tempObj}];
            // renderInvoiceDataGrid(testObj);

            const tempObj = JSON.parse(response.data.transactions[0].row).lines;
            let testObj = { ...JSON.parse(response.data.transactions[0].row) };
            let data = tempObj.map(itm => {
                return { ...testObj, ...itm }
            });
            renderInvoiceDataGrid("invoiceGridContainer", data);

        })
        .catch(error => {
            console.error(error);
        });
}

function getInputType() {
    let inputType = $("#type_selector").val();
    if (inputType === '') {
        $("#input-type-div").html(`<input type="file" class="form-control visually-hidden" id="bankStatements">
                                <label class="btn-blue mb-1 me-1" for="bankStatements">
                                    <span class="material-symbols-outlined">
cloud_upload
</span>
                                    Upload
                                </label>`);
        $("#Invoice_Test").hide();
        $("#abcabc").show();
    } else if (inputType === 'Invoice') {
        $("#input-type-div").html(`<input type="file" class="form-control visually-hidden" id="Invoices_Input" multiple>
                                <label class="btn-blue mb-1 me-1" for="Invoices_Input">
                                    <span class="material-symbols-outlined">
cloud_upload
</span>
                                    Upload
                                </label>`);
        $("#Invoice_Test").show();
        $("#abcabc").hide();
    }
}

function showDmsDocList(dmsDocsList) {
    $("#dms-attachs-list").html("");
    dmsDocsList.map(itm => {
        $("#dms-attachs-list").append(`<div class="col-4 mt-3 position-relative">
                                    <span class="material-symbols-outlined position-absolute remove-grid-dms-invoice-doc" name="${itm["Registration No."]}" style="top:5px; right:15px; cursor:pointer;">
                                        close
                                    </span>
                                    <div class="text-center border rounded pt-4">
                                        <img src="./pdf.png" height="40px" width="40px" class="me-2" />
                                        <p class="text-center mt-3">${itm.Description}</p>
                                    </div>
                                </div>`);
    });
    // $("#process-dms-docs").removeClass("d-none");
}

function handleDisableExtractButton(allFiles) {
    if (Object.keys(allFiles).length > 0) {
        $("#abcabc").removeAttr("disabled").removeClass("opacity-5");
        $("#Invoice_Test").removeAttr("disabled").removeClass("opacity-5");
    } else {
        $("#abcabc").attr("disabled", "true").addClass("opacity-5");
        $("#Invoice_Test").attr("disabled", "true").addClass("opacity-5");
    }
}

function createDMSSideBarDocList(onlyPdfDocsData) {
    $("#dms-doc-list").html("");
    for (let i = 0; i < onlyPdfDocsData.length; i++) {
        $("#dms-doc-list").append(`<div class=" d-flex">

                            <!-- <div class="form-check d-flex align-items-center justify-content-between mx-2">
                                <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
                                <label class="form-check-label" for="flexCheckDefault">
    
                                </label>
                            </div> -->
                            <div class="file-uploads-2 mt-2">
                                <label class="file-uploads-label file-uploads-document sadik">
                                    <div class="d-flex justify-content-between align-items-center w-100">
                                        <div class="d-flex align-items-center">
                                            <div class='img-format'>
                                                <img src="./pdf.png" height="30px" width="30px" class="me-2" />
                                            </div>
    
                                            <div class="upload-content">
                                                <h4>${onlyPdfDocsData[i].Description}</h4>
                                            </div>
                                        </div>
    
                                        <!--  <div class="clearfix remove-dms-doc-btn" name="${onlyPdfDocsData[i]["Registration No."]}">
                                            <span
                                                class="material-symbols-outlined">
                                                close
                                            </span>
                                        </div> -->

                                        <!-- <div class="clearrfix">
                                            <span class="dropdown">
                                                <span class="dropdown-toggle dropdoun_border toggle-none"
                                                    data-bs-toggle="dropdown" aria-expanded="false">
                                                    <span class="material-symbols-outlined mt-2">
                                                        more_vert
                                                    </span>
                                                </span>
                                                <ul class="dropdown-menu">
    
                                                    <li><a class="dropdown-item" href="#"><span
                                                                class="material-symbols-outlined">
                                                                edit_note
                                                            </span>Rename</a>
                                                    </li>
    
                                                    <li><a class="dropdown-item" href="#"><span
                                                                class="material-symbols-outlined">
                                                                close
                                                            </span>
                                            </span>Remove</a>
                                            </li>
    
    
                                            </ul>
                                            </span>
                                        </div>  -->
    
                                    </div>
                                </label>
                            </div>
                        </div>`);
    }
}

function createSideBarDocList(allFiles) {
    $("#selected-doc-list").html("");
    for (let i = 0; i < Object.keys(allFiles).length; i++) {
        $("#selected-doc-list").append(`<div class=" d-flex">

                            <!-- <div class="form-check d-flex align-items-center justify-content-between mx-2">
                                <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
                                <label class="form-check-label" for="flexCheckDefault">
    
                                </label>
                            </div> -->
                            <div class="file-uploads-2 mt-2">
                                <label class="file-uploads-label file-uploads-document sadik">
                                    <div class="d-flex justify-content-between align-items-center w-100">
                                        <div class="d-flex align-items-center">
                                            <div class='img-format'>
                                                <img src="./pdf.png" height="30px" width="30px" class="me-2" />
                                            </div>
    
                                            <div class="upload-content">
                                                <h4>${allFiles[i].name}</h4>
                                            </div>
                                        </div>
    
                                        ${$("#type_selector").val() !== "" ? `<div class="clearfix remove-normal-doc-btn" name="${i}">
                                            <span
                                                class="material-symbols-outlined">
                                                close
                                            </span>
                                        </div>`: `<div class="clearfix remove-normal-sts-doc-btn" name="${i}">
                                            <span
                                                class="material-symbols-outlined">
                                                close
                                            </span>
                                        </div>`}

                                        <!-- <div class="clearrfix">
                                            <span class="dropdown">
                                                <span class="dropdown-toggle dropdoun_border toggle-none"
                                                    data-bs-toggle="dropdown" aria-expanded="false">
                                                    <span class="material-symbols-outlined mt-2">
                                                        more_vert
                                                    </span>
                                                </span>
                                                <ul class="dropdown-menu">
    
                                                    <li><a class="dropdown-item" href="#"><span
                                                                class="material-symbols-outlined">
                                                                edit_note
                                                            </span>Rename</a>
                                                    </li>
    
                                                    <li><a class="dropdown-item" href="#"><span
                                                                class="material-symbols-outlined">
                                                                close
                                                            </span>
                                            </span>Remove</a>
                                            </li>
    
    
                                            </ul>
                                            </span>
                                        </div>  -->
    
                                    </div>
                                </label>
                            </div>
                        </div>`);
    }
}

const convertBlobToBase64 = async (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

const getBase64Files = async (allFiles) => {
    const base64Files = await Promise.all(
        Object.entries(allFiles).map(async ([key, file]) => {
            try {
                const base64 = await convertBlobToBase64(file);
                return { [key]: base64 };
            } catch (error) {
                console.error(`Error reading file ${key}:`, error);
                return { [key]: null }; // Or handle error as needed
            }
        })
    );
    return Object.assign({}, ...base64Files);
};

$(document).ready(function () {

    // axios.get(`http://localhost:3001/allJobs`).then(res => {
    //     console.log("All Jobs", res.data);
    // });

    if (dmsDocIds.length > 0) {

        $("#type-selector-modal").css("display", "block");

        // if ($("#modal-bank-sts-btn").hasClass("btn-primary")) {
        //     $("#process-dms-docs-bank-sts").removeClass("d-none");
        //     $("#process-dms-docs").addClass("d-none");
        // }

        dmsDocIds.reduce((prevPromise, group) => {
            return prevPromise.then(() => {
                return axios.post("https://docusms.uk/dsdesktopwebservice.asmx/Json_SearchDocById", {
                    "agrno": "0003",
                    "Email": "patrick@docusoft.net",
                    "password": "UGF0cmljazEyMy4=",
                    "ItemId": group,
                    "Registration No.": group
                }).then(res => dmsDocResult.push(JSON.parse(res.data.d)[""][0])).catch(err => console.log("Error while calling Json_SearchDocById", err));
            });
        },
            Promise.resolve()
        ).then(res => {
            // console.log("dmsDocResult", dmsDocResult);
            let tempResult = dmsDocResult.filter(itm => {
                if (itm["Type"] === "pdf") {
                    return itm;
                }
            });
            dmsDocResult = tempResult;
            showDmsDocList(dmsDocResult);
            // console.log("tempResult", tempResult);
        }).catch(err => {
            console.log("Error while calling Json_SearchDocById", err);
        });
    }
    // axios.post("https://practicetest.docusoftweb.com/PracticeServices.asmx/Json_ExplorerSearchDoc", {
    //     "agrno": "0003",
    //     "Email": "patrick@docusoft.net",
    //     "password": "UGF0cmljazEyMy4=",
    //     "ProjectId": "15",
    //     "ClientId": "0001",
    //     "sectionId": "-1"
    // }).then(res => {
    //     const dmsDocs = JSON.parse(res.data.d).Table6;
    //     // console.log("dmsDocs", dmsDocs);
    //     const onlyPdfDocs = dmsDocs.filter(itm => itm["Type"] === "pdf");
    //     const chunkData = onlyPdfDocs.slice(0, 10);
    // console.log("dms docus", chunkData);
    // let docHTML = `<table>
    // <thead>
    // <th>ID</th>
    // <th>Document</th>
    // <th>Action</th>
    // </thead>
    // <tbody id="dmsDocList">

    // <tbody>
    // </table>`;
    // $("#customTable").html(docHTML);
    // let docListHTML = "";
    // chunkData.forEach(doc => {
    //     docListHTML += `<tr style="padding: 10px;">
    //         <td style="padding: 10px;">${doc["Registration No."]}</td>
    //         <td style="padding: 10px;">${doc.Description}.${doc.Type}</td>
    //         <td style="padding: 10px;"><button class="processDoc" name="${doc["Registration No."]}">Process</button></td>
    //     </tr>`;
    // });
    // $("#dmsDocList").html(docListHTML);
    // }).catch(err => {
    //     console.log("Api failed", err);
    // })
    getInputType();

    if (decodedObj.type === "Bank") {
        $("#process-dms-docs-bank-sts").removeClass("d-none");
        $("#process-dms-docs").addClass("d-none");
    } else if (decodedObj.type === "Invoice") {
        $("#process-dms-docs-bank-sts").addClass("d-none");
        $("#process-dms-docs").removeClass("d-none");
    }

    // $("#modal-bank-sts-btn").on("click", function () {
    //     // $("#type-selector-modal").css("display", "none");
    //     $(this).addClass("btn-primary");
    //     $(this).removeClass("btn-outline-primary");

    //     $("#modal-invoice-rps-btn").addClass("btn-outline-primary");
    //     $("#modal-invoice-rps-btn").removeClass("btn-primary");

    //     $("#process-dms-docs-bank-sts").removeClass("d-none");
    //     $("#process-dms-docs").addClass("d-none");
    // })

    // $("#modal-invoice-rps-btn").on("click", function () {
    //     // $("#type-selector-modal").css("display", "none");
    //     $(this).addClass("btn-primary");
    //     $(this).removeClass("btn-outline-primary");

    //     $("#modal-bank-sts-btn").addClass("btn-outline-primary");
    //     $("#modal-bank-sts-btn").removeClass("btn-primary");

    //     $("#process-dms-docs-bank-sts").addClass("d-none");
    //     $("#process-dms-docs").removeClass("d-none");
    // })

    // $("#process-dms-docs-bank-sts").on("click", function () {
    //     dmsDocBase64Result = [];
    //     $("#loading-spinner-bnk-sts").removeClass("d-none");
    //     axios.post("https://docusms.uk/dsdesktopwebservice.asmx/Json_GetItemBase64DataById", {
    //         "agrno": "0003",
    //         "Email": "patrick@docusoft.net",
    //         "password": "UGF0cmljazEyMy4=",
    //         "ItemId": dmsDocResult[0]["Registration No."]
    //     }).then(res => {
    //         let docBase64 = res.data.d;
    //         axios.post(`http://localhost:3001/processDmsDoc`, { base64: docBase64 }).then(function (res) {
    //             $("#type-selector-modal").css("display", "none");
    //             $("#gridContainer").removeClass("d-none");
    //             $("#invoiceGridContainer").addClass("d-none");
    //             $("#loading-spinner-bnk-sts").addClass("d-none");
    //             renderDataGrid(res.data.transactions);
    //         }).catch(function (err) {
    //             console.log("Api failed", err);
    //         });
    //     }).catch(err => console.log("Error while calling JSON_GetItemBase64Data", err))
    // })

    // $("#process-dms-docs").on("click", function () {
    //     // $("#type-selector-modal").css("display", "none");
    //     dmsDocBase64Result = [];
    //     $("#gridContainer").addClass("d-none");
    //     $("#invoiceGridContainer").addClass("d-none");
    //     $("#loading-spinner").removeClass("d-none");
    //     dmsDocResult.filter(itm => itm.Type === "pdf").reduce((prevPromise, group) => {
    //         return prevPromise.then(() => {
    //             return axios.post("https://docusms.uk/dsdesktopwebservice.asmx/Json_GetItemBase64DataById", {
    //                 "agrno": "0003",
    //                 "Email": "patrick@docusoft.net",
    //                 "password": "UGF0cmljazEyMy4=",
    //                 "ItemId": group["Registration No."]
    //             }).then(res => dmsDocBase64Result.push(res.data.d)).catch(err => console.log("Error while calling JSON_GetItemBase64Data", err))
    //         });
    //     },
    //         Promise.resolve()
    //     ).then(res => {
    //         dmsDocBase64Result.reduce((prevPromise, group) => {
    //             return prevPromise.then(() => {
    //                 return axios.post(`http://localhost:3001/processInvoices`, { base64: group }).then(function (res) {
    //                     if ($("#type_selector").val() === "Invoice" || true) {
    //                         // const tempObj = JSON.parse(response.data.transactions[0].row).lines;
    //                         // let testObj = { ...JSON.parse(response.data.transactions[0].row) };
    //                         // let data = tempObj.map(itm => {
    //                         //     return { ...testObj, ...itm }
    //                         // });
    //                         // renderInvoiceDataGrid(data);

    //                         // const tempObj = JSON.parse(res.data.transactions[0].row).lines[0];
    //                         // const testObj = [{ ...JSON.parse(res.data.transactions[0].row), ...tempObj }];
    //                         // // renderInvoiceDataGrid("gridContainer", testObj);
    //                         // dmsInvoiceConvertedData.push(testObj);

    //                         const tempObj = JSON.parse(res.data.transactions[0].row).lines;
    //                         let testObj = { ...JSON.parse(res.data.transactions[0].row) };
    //                         let data = tempObj.map(itm => {
    //                             return { ...testObj, ...itm }
    //                         });

    //                         dmsInvoiceConvertedData.push(data);
    //                     } else {
    //                         // renderDataGrid(res.data.transactions);
    //                     }
    //                 }).catch(function (err) {
    //                     console.log("Api failed", err);
    //                 });
    //             });
    //         },
    //             Promise.resolve()
    //         ).then(res => {
    //             $("#type-selector-modal").css("display", "none");
    //             $("#invoiceGridContainer").removeClass("d-none");
    //             $("#loading-spinner").addClass("d-none");
    //             renderInvoiceDataGrid("invoiceGridContainer", dmsInvoiceConvertedData.flat());
    //         }).catch(err => {
    //             console.log("Error while calling Json_GetItemBase64DataById", err);
    //         });
    //     }).catch(err => {
    //         console.log("Error while calling Json_GetItemBase64DataById", err);
    //     });
    // })

    $(document).on("click", function() {
        $("#create-view-modal").removeClass("d-block");
    })

    $("#create-view-btn").on('click', function(event) {
        event.stopPropagation();
        // $("#create-view-modal").addClass("d-block");
        // $("#view-name-input").val("");

    });

    $("#create-view-modal-close-btn").on('click', function(event) {
        event.stopPropagation();
        $("#create-view-modal").removeClass("d-block");
    });

    $("#save-view").on('click', function(event) {
        // event.stopPropagation();
        // $("#create-view-modal").removeClass("d-block");
    });

    // $("#view-name-input").on('click', function(event) {
    //     event.stopPropagation();
    // });

    $("#create-view-modal-body").on('click', function(event) {
        event.stopPropagation();
    });

    $(document).on("click", ".remove-grid-dms-invoice-doc", function () {
        let target = this.getAttribute("name");
        let filteredResult = dmsDocResult.filter(itm => itm["Registration No."] !== Number(target));
        dmsDocResult = filteredResult;
        showDmsDocList(dmsDocResult);
        if (filteredResult.length === 0) {
            $("#type-selector-modal").css("display", "none");
        }
    })

    $(document).on("click", "#Reset_Btn", function () {
        if (window.confirm("Are you sure you want to reset form ?")) {
            allSelectedInvoices = [];
            InvoicesBase64Array = [];
            selectedInvoices = {};
            selectedfiles = {};
            dmsDocResult = [];
            dmsDocBase64Result = [];
            dmsInvoiceConvertedData = [];
            StatementsBase64Array = [];
            $("#gridContainer").addClass("d-none");
            $("#invoiceGridContainer").addClass("d-none");
            $("#dms-doc-list").html("");
            $("#selected-doc-list").html("");
            $("#Reset_Btn").attr("disabled", "true").addClass("opacity-5");
            handleDisableExtractButton({});
        }
    })

    $(document).on("click", ".remove-normal-sts-doc-btn", function () {
        document.getElementById("bankStatements").value = "";
        StatementsBase64Array = [];
        $("#dms-doc-list").html("");
        $("#selected-doc-list").html("");
        handleDisableExtractButton({});
    })

    $(document).on("click", ".remove-normal-doc-btn", function () {
        let target = this.getAttribute("name");
        // console.log("attribute value", this.getAttribute("name"));
        // console.log("selected files", Object.entries(selectedInvoices));
        // console.log("after removed", Object.entries(selectedInvoices).filter(([key, valuue])=>key!==target));
        let remainedData = Object.entries(selectedInvoices).filter(([key, valuue]) => key !== target).reduce((acc, value, key) => {
            return { ...acc, [key]: value[1] };
        }, {});
        // console.log("remainedData", remainedData);
        getBase64Files(remainedData)
            .then(base64Data => {
                let base64DataArr = Object.entries(base64Data).map(([key, value]) => {
                    return value.split(",")[1];
                });
                if (dmsDocBase64Result.length > 0) {
                    InvoicesBase64Array = [...dmsDocBase64Result, ...base64DataArr];
                } else {
                    InvoicesBase64Array = base64DataArr;
                }
                // console.log("base64DataArr",base64DataArr);
            })
            .catch(error => {
                console.error('Error reading files:', error);
            });
        allSelectedInvoices = remainedData;
        selectedInvoices = remainedData;
        handleDisableExtractButton(remainedData);
        createSideBarDocList(remainedData);
        if (Object.keys(remainedData).length === 0) {
            document.getElementById("bankStatements").value = "";
        }

    })

    $(document).on("click", ".remove-dms-doc-btn", function () {
        let target = this.getAttribute("name");
        let onlyPDFFiles = dmsDocResult.filter(itm => itm.Type === "pdf");
        let remainData = onlyPDFFiles.filter(itm => itm["Registration No."] !== Number(target));
        dmsDocResult = remainData;
        createDMSSideBarDocList(remainData);
        dmsDocBase64Result = [];
        remainData.filter(itm => itm.Type === "pdf").reduce((prevPromise, group) => {
            return prevPromise.then(() => {
                return axios.post("https://docusms.uk/dsdesktopwebservice.asmx/Json_GetItemBase64DataById", {
                    "agrno": "0003",
                    "Email": "patrick@docusoft.net",
                    "password": "UGF0cmljazEyMy4=",
                    "ItemId": group["Registration No."]
                }).then(res => dmsDocBase64Result.push(res.data.d)).catch(err => console.log("Error while calling JSON_GetItemBase64Data", err))
            });
        },
            Promise.resolve()
        ).then(res => {
            // console.log("dmsDocBase64Result", dmsDocBase64Result);
            InvoicesBase64Array = dmsDocBase64Result;
        }).catch(err => console.error("Error while calling Json_GetItemBase64DataById from .remove-dms-doc-btn", err))
    })


    $("#process-dms-docs").on("click", function () {
        dmsDocBase64Result = [];
        $("#gridContainer").addClass("d-none");
        $("#invoiceGridContainer").addClass("d-none");
        // $("#loading-spinner").removeClass("d-none");
        dmsDocResult.filter(itm => itm.Type === "pdf").reduce((prevPromise, group) => {
            return prevPromise.then(() => {
                return axios.post("https://docusms.uk/dsdesktopwebservice.asmx/Json_GetItemBase64DataById", {
                    "agrno": "0003",
                    "Email": "patrick@docusoft.net",
                    "password": "UGF0cmljazEyMy4=",
                    "ItemId": group["Registration No."]
                }).then(res => dmsDocBase64Result.push(res.data.d)).catch(err => console.log("Error while calling JSON_GetItemBase64Data", err))
            });
        },
            Promise.resolve()
        ).then(res => {
            // console.log("dmsDocBase64Result", dmsDocBase64Result);
            InvoicesBase64Array = dmsDocBase64Result;
            let onlyPDFInvoices = dmsDocResult.filter(itm => itm.Type === "pdf");
            if (onlyPDFInvoices.length > 0) {
                createDMSSideBarDocList(onlyPDFInvoices);
                $("#type-selector-modal").css("display", "none");
                $("#type_selector").val("Invoice");
                getInputType();
                handleDisableExtractButton(onlyPDFInvoices[0]);
            }
        }).catch(err => console.log("Error while calling Json_GetItemBase64DataById", err))
    })



    $("#process-dms-docs-bank-sts").on("click", function () {
        dmsDocBase64Result = [];
        $("#gridContainer").addClass("d-none");
        $("#invoiceGridContainer").addClass("d-none");
        // $("#loading-spinner").removeClass("d-none");
        dmsDocResult.filter(itm => itm.Type === "pdf").reduce((prevPromise, group) => {
            return prevPromise.then(() => {
                return axios.post("https://docusms.uk/dsdesktopwebservice.asmx/Json_GetItemBase64DataById", {
                    "agrno": "0003",
                    "Email": "patrick@docusoft.net",
                    "password": "UGF0cmljazEyMy4=",
                    "ItemId": group["Registration No."]
                }).then(res => dmsDocBase64Result.push(res.data.d)).catch(err => console.log("Error while calling JSON_GetItemBase64Data", err))
            });
        },
            Promise.resolve()
        ).then(res => {
            // console.log("dmsDocBase64Result", dmsDocBase64Result);
            // InvoicesBase64Array = dmsDocBase64Result;
            let onlyPDFStatements = dmsDocResult.filter(itm => itm.Type === "pdf");
            if (onlyPDFStatements.length > 0) {
                createDMSSideBarDocList(onlyPDFStatements);
                $("#type-selector-modal").css("display", "none");
                $("#type_selector").val("");
                getInputType();
                handleDisableExtractButton(onlyPDFStatements[0]);
            }
        }).catch(err => console.log("Error while calling Json_GetItemBase64DataById", err))
    })



    $("#type_selector").on("change", function () {
        getInputType();
    })


    $(document).on("change", "#Invoices_Input", function () {
        // InvoicesBase64Array = dmsDocBase64Result.length>0 ? [...dmsDocBase64Result] : [];
        // if((selectedInvoices))
        let allFiles = this.files;
        // allSelectedInvoices.push(this.files);
        // console.log("allSelectedInvoices",allSelectedInvoices);

        Object.entries(this.files).map(([key, group]) => {
            allSelectedInvoices = { ...allSelectedInvoices, [Object.keys(allSelectedInvoices).length]: group };
        })

        allFiles = allSelectedInvoices;
        // console.log("allSelectedInvoices", allSelectedInvoices);

        let mappedData = Object.entries(allSelectedInvoices).map(itm => itm[1].type);
        if (!mappedData.every(itm => itm === "application/pdf")) {
            alert("Only PDF files are supported");
            let filteredData = Object.entries(allFiles).filter(itm => itm[1].type === "application/pdf").reduce((acc, itmObj, i) => {
                return { ...acc, [i]: itmObj[1] }
            }, {});
            allFiles = filteredData;
        }

        getBase64Files(allFiles)
            .then(base64Data => {
                let base64DataArr = Object.entries(base64Data).map(([key, value]) => {
                    return value.split(",")[1];
                });
                if (dmsDocBase64Result.length > 0) {
                    InvoicesBase64Array = [...dmsDocBase64Result, ...base64DataArr];
                } else {
                    InvoicesBase64Array = base64DataArr;
                }
                // console.log("base64DataArr",base64DataArr);
            })
            .catch(error => {
                console.error('Error reading files:', error);
            });

        selectedInvoices = allFiles;
        handleDisableExtractButton(allFiles);
        createSideBarDocList(allFiles);
    })


    $(document).on("change", "#bankStatements", function (e) {
        let allFiles = this.files;

        if ((Object.entries(selectedfiles).length > 0 && $("#type_selector").val() === "") || dmsDocBase64Result.length > 0) {
            if (window.confirm("Are you sure you want to replace this file?")) {
                dmsDocBase64Result = [];
                $("#dms-doc-list").html("");
                allFiles = this.files;
                selectedfiles = this.files;
            } else {
                allFiles = selectedfiles;
            }
        } else if (Object.entries(selectedfiles).length === 0) {
            selectedfiles = this.files;
        }
        // Object.keys(allFiles).length > 0 ? $("#type_selector").attr("disabled","true") : $("#type_selector").attr("disabled","false");

        getBase64Files(allFiles)
            .then(base64Data => {
                let base64DataArr = Object.entries(base64Data).map(([key, value]) => {
                    return value.split(",")[1];
                });
                if (dmsDocBase64Result.length > 0) {
                    StatementsBase64Array = dmsDocBase64Result;
                } else {
                    StatementsBase64Array = base64DataArr;
                }
                // console.log("base64DataArr",base64DataArr);
            })
            .catch(error => {
                console.error('Error reading files:', error);
            });
        let tempParams = dmsDocBase64Result.length > 0 ? { test: "" } : allFiles
        handleDisableExtractButton(tempParams);

        createSideBarDocList(allFiles);
        // $("#selected-doc-list").append(`<p>${allFiles[i].name}<p>`);
    })

    $("#abcabc").on("click", function (event) {
        event.preventDefault();
        StatementsBase64Array = dmsDocBase64Result.length > 0 ? dmsDocBase64Result : StatementsBase64Array;
        $("#Loading").removeClass("d-none");
        $('#invoiceGridContainer').addClass("d-none");
        sendDoc(event);
    })
    $("#Invoice_Test").on("click", async function (event) {
        dmsInvoiceConvertedData = [];  // Temp important
        $("#Loading").removeClass("d-none");
        $('#gridContainer').addClass("d-none");
        $("#invoiceGridContainer").addClass("d-none");
        event.preventDefault();
        formData = "";

        // console.log("InvoicesBase64Array", InvoicesBase64Array);

        InvoicesBase64Array.reduce((prevPromise, group) => {
            return prevPromise.then(() => {
                return axios.post(`http://localhost:3001/processInvoices`, { base64: group }).then(function (res) {
                    if ($("#type_selector").val() === "Invoice" || true) {
                        const tempObj = JSON.parse(res.data.transactions[0].row).lines;
                        let testObj = { ...JSON.parse(res.data.transactions[0].row) };
                        let data = tempObj.map(itm => {
                            return { ...testObj, ...itm }
                        });
                        dmsInvoiceConvertedData.push(data);
                    } else {
                        // renderDataGrid(res.data.transactions);
                    }
                }).catch(function (err) {
                    // console.log("Api failed", err);
                    $("#Loading").addClass("d-none");
                    $("#invoiceGridContainer").addClass("d-none");
                    Swal.fire('Unable to process document!', 'Please try again.', 'error');
                });
            });
        },
            Promise.resolve()
        ).then(res => {
            $("#type-selector-modal").css("display", "none");
            $("#invoiceGridContainer").removeClass("d-none");
            $("#Reset_Btn").removeAttr("disabled").removeClass("opacity-5");
            $("#Loading").addClass("d-none");
            $("#loading-spinner").addClass("d-none");
            $(".remove-normal-doc-btn").addClass("d-none");
            renderInvoiceDataGrid("invoiceGridContainer", dmsInvoiceConvertedData.flat());
        }).catch(err => {
            console.log("Error while processing invoices", err);
            $("#Loading").addClass("d-none");
            $("#invoiceGridContainer").addClass("d-none");
            Swal.fire('Unable to process document!', 'Please try again.', 'error');
        });


        // Object.entries(allFiles).reduce((prevPromise, group, i) => {
        //     return prevPromise.then(() => {
        //         formData = "";
        //         formData = new FormData();
        //         formData.append('document', group[1]);
        //         return axios.post(`http://localhost:3001/processInvoices`, formData)
        //             .then(response => {
        //                 const tempObj = JSON.parse(response.data.transactions[0].row).lines;
        //                 let testObj = { ...JSON.parse(response.data.transactions[0].row) };
        //                 let data = tempObj.map(itm => {
        //                     return { ...testObj, ...itm }
        //                 });
        //                 results.push(data);
        //             })
        //             .catch(error => {
        //                 console.error(error);
        //             });


        //         // return axios.post(`${url}?type=Invoice`, formData)
        //         //     .then(response => {
        //         //         const tempObj = JSON.parse(response.data.transactions[0].row).lines;
        //         //         let testObj = { ...JSON.parse(response.data.transactions[0].row) };
        //         //         let data = tempObj.map(itm => {
        //         //             return { ...testObj, ...itm }
        //         //         });
        //         //         results.push(data);
        //         //     })
        //         //     .catch(error => {
        //         //         console.error(error);
        //         //     });
        //     });
        // },
        //     Promise.resolve()
        // ).then(res => {
        //     // $('#gridContainer').dxDataGrid('instance').destroy()
        //     $("#Loading").addClass("d-none");
        //     $('#invoiceGridContainer').removeClass("d-none");
        //     const gridJson = results.flat();
        //     renderInvoiceDataGrid("invoiceGridContainer", gridJson);
        //     //  Code for individual Invoices grid container - starts here - *** Don't remove this code ***
        //     // results.map((resResult,i)=>{
        //     //     $("#loopGrid-container").append(`<div id="gridContainer_${i}"></div><hr/>`);
        //     //     renderInvoiceDataGrid(`gridContainer_${i}`, resResult);
        //     // })
        //     //  End here - *** Don't remove this code ***
        // }).catch(err => {

        // });

    })
    $(document).on("click", ".processDoc", function (event) {
        const dmsDocId = this.name;
        axios.post("https://docusms.uk/dsdesktopwebservice.asmx/Json_GetItemBase64DataById", {
            "agrno": "0003",
            "Email": "patrick@docusoft.net",
            "password": "UGF0cmljazEyMy4=",
            "ItemId": dmsDocId ? dmsDocId : ""
        }).then(function (res) {
            const docBase64 = res.data.d;
            axios.post(`http://localhost:3001/processDmsDoc?type=${$("#type_selector").val()}`, { base64: docBase64 }).then(function (res) {
                // console.log("processDmsDoc's response", res.data);
                if ($("#type_selector").val() === "Invoice") {
                    // const tempObj = JSON.parse(response.data.transactions[0].row).lines;
                    // let testObj = { ...JSON.parse(response.data.transactions[0].row) };
                    // let data = tempObj.map(itm => {
                    //     return { ...testObj, ...itm }
                    // });
                    // renderInvoiceDataGrid(data);

                    const tempObj = JSON.parse(res.data.transactions[0].row).lines[0];
                    const testObj = [{ ...JSON.parse(res.data.transactions[0].row), ...tempObj }];
                    renderInvoiceDataGrid("invoiceGridContainer", testObj);
                } else {
                    renderDataGrid(res.data.transactions);
                }
            }).catch(function (err) {
                console.log("Api failed", err);
            });
        }).catch(function (err) {
            console.log("Error: ", err);
        });
    })
})


let BankStatements = [];
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
const idsString = urlSearchParams.get('ids');

let dmsDocIds = [];

if (idsString && idsString.length > 0) {
    dmsDocIds = idsString.split(",")
}

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
            { dataField: "date", caption: "Date" },
            { dataField: "date2", caption: "Date 2" },
            { dataField: "description", caption: "Description" },
            { dataField: "amount", caption: "Amount" },
            { dataField: "balance", caption: "Balance" },
            { dataField: "checkNumber", caption: "Check Number" },
            { dataField: "account", caption: "Account" }
        ],
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
    let allFiles = document.getElementById("bankStatements").files;
    formData = "";
    formData = new FormData();
    formData.append('document', allFiles[0]);
    event.preventDefault();
    axios.post(url, formData)
        .then(response => {
            renderDataGrid(response.data.transactions);
        })
        .catch(error => {
            console.error(error);
        });
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
            renderInvoiceDataGrid("gridContainer", data);

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
                                        add
                                    </span>
                                    Add
                                </label>`);
        $("#Invoice_Test").hide();
        $("#abcabc").show();
    } else if (inputType === 'Invoice') {
        $("#input-type-div").html(`<input type="file" class="form-control visually-hidden" id="bankStatements" multiple>
                                <label class="btn-blue mb-1 me-1" for="bankStatements">
                                    <span class="material-symbols-outlined">
                                        add
                                    </span>
                                    Add
                                </label>`);
        $("#Invoice_Test").show();
        $("#abcabc").hide();
    }
}

function showDmsDocList(dmsDocsList) {
    $("#dms-attachs-list").html("");
    dmsDocsList.map(itm => {
        $("#dms-attachs-list").append(`<p>${itm.Description}.${itm.Type}</p>`);
    });
    $("#process-dms-docs").removeClass("d-none");
}



$(document).ready(function () {

    axios.get(`http://localhost:3001/allJobs`).then(res => {
        console.log("All Jobs", res.data);
      });

    if (dmsDocIds.length > 0) {
        $("#type-selector-modal").css("display", "block");
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
            showDmsDocList(dmsDocResult);
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

    $("#modal-bank-sts-btn").on("click", function () {
        // $("#type-selector-modal").css("display", "none");
        $(this).addClass("btn-primary");
        $(this).removeClass("btn-outline-primary");
        $("#modal-invoice-rps-btn").addClass("btn-outline-primary");
        $("#modal-invoice-rps-btn").removeClass("btn-primary");
    })

    $("#modal-invoice-rps-btn").on("click", function () {
        // $("#type-selector-modal").css("display", "none");
        $(this).addClass("btn-primary");
        $(this).removeClass("btn-outline-primary");
        $("#modal-bank-sts-btn").addClass("btn-outline-primary");
        $("#modal-bank-sts-btn").removeClass("btn-primary");
    })

    $("#process-dms-docs").on("click", function () {
        // $("#type-selector-modal").css("display", "none");
        $("#loading-spinner").removeClass("d-none");
        dmsDocResult.reduce((prevPromise, group) => {
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
            dmsDocBase64Result.reduce((prevPromise, group) => {
                return prevPromise.then(() => {
                    return axios.post(`http://localhost:3001/processDmsDoc?type=Invoice`, { base64: group }).then(function (res) {
                        if ($("#type_selector").val() === "Invoice" || true) {
                            // const tempObj = JSON.parse(response.data.transactions[0].row).lines;
                            // let testObj = { ...JSON.parse(response.data.transactions[0].row) };
                            // let data = tempObj.map(itm => {
                            //     return { ...testObj, ...itm }
                            // });
                            // renderInvoiceDataGrid(data);

                            // const tempObj = JSON.parse(res.data.transactions[0].row).lines[0];
                            // const testObj = [{ ...JSON.parse(res.data.transactions[0].row), ...tempObj }];
                            // // renderInvoiceDataGrid("gridContainer", testObj);
                            // dmsInvoiceConvertedData.push(testObj);

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
                        console.log("Api failed", err);
                    });
                });
            },
                Promise.resolve()
            ).then(res => {
                $("#type-selector-modal").css("display", "none");
                $("#loading-spinner").addClass("d-none");
                renderInvoiceDataGrid("gridContainer",dmsInvoiceConvertedData.flat());
            }).catch(err => {
                console.log("Error while calling Json_GetItemBase64DataById", err);
            });
        }).catch(err => {
            console.log("Error while calling Json_GetItemBase64DataById", err);
        });
    })

    $("#type_selector").on("change", function () {
        getInputType();
    })
    $(document).on("change", "#bankStatements", function (e) {
        let allFiles = this.files;
        // Object.keys(allFiles).length > 0 ? $("#type_selector").attr("disabled","true") : $("#type_selector").attr("disabled","false");
        $("#selected-doc-list").html("");
        for (let i = 0; i < allFiles.length; i++) {
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
        // $("#selected-doc-list").append(`<p>${allFiles[i].name}<p>`);
    })
    $("#abcabc").on("click", function (event) {
        event.preventDefault();
        sendDoc(event);
    })
    $("#Invoice_Test").on("click", async function (event) {
        event.preventDefault();
        formData = "";
        let allFiles = document.getElementById("bankStatements").files;
        delete allFiles["length"];
        let results = [];
        Object.entries(allFiles).reduce((prevPromise, group, i) => {
            return prevPromise.then(() => {
                formData = "";
                formData = new FormData();
                formData.append('document', group[1]);
                return axios.post(`${url}?type=Invoice`, formData)
                    .then(response => {

                        // const tempObj = JSON.parse(response.data.transactions[0].row).lines[0];
                        // let testObj = [{...JSON.parse(response.data.transactions[0].row), tempObj}];
                        // renderInvoiceDataGrid(testObj);

                        const tempObj = JSON.parse(response.data.transactions[0].row).lines;
                        let testObj = { ...JSON.parse(response.data.transactions[0].row) };
                        let data = tempObj.map(itm => {
                            return { ...testObj, ...itm }
                        });
                        results.push(data);

                    })
                    .catch(error => {
                        console.error(error);
                    });
            });
        },
            Promise.resolve()
        ).then(res => {
            // $('#gridContainer').dxDataGrid('instance').destroy()
            const gridJson = results.flat();
            renderInvoiceDataGrid("gridContainer", gridJson);
            //  Code for individual Invoices grid container - starts here - *** Don't remove this code ***
            // results.map((resResult,i)=>{
            //     $("#loopGrid-container").append(`<div id="gridContainer_${i}"></div><hr/>`);
            //     renderInvoiceDataGrid(`gridContainer_${i}`, resResult);
            // })
            //  End here - *** Don't remove this code ***
        }).catch(err => {

        });

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
                    renderInvoiceDataGrid("gridContainer", testObj);
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


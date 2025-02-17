$('#shipping-options-header').removeClass('inactive');
$('#payment-options-header').removeClass('inactive');
$('#commission-and-fees-header').removeClass('inactive');
$('#contract-header').removeClass('inactive');
$('#shipping-options-header').addClass('active');
$('#payment-options-header').addClass('active');
$('#commission-and-fees-header').addClass('active');
$('#contract-header').addClass('active');


//Start Dropzone
Dropzone.options.customDropzone = {
    url: '/FileUpload/UploadContract")',
    paramName: "file",
    maxFilesize: 20,
    acceptedFiles: ".pdf, .doc, .docx",
    maxFiles: 2,
    previewsContainer: ".dropzone-tiny-modal",
    init: function () {
        var myDropzone = this;

        this.on("sending", function (file, xhr, formData) {

            var fiepathHidden = $('#FilePath').val();

            formData.append("uploadedFileId", fiepathHidden);
        });

        this.on("addedfile", function (file) {
            if (myDropzone.files.length > 1) {
                myDropzone.removeFile(this.files[0]);
            }
        });

        this.on("error", function (file, message) {

            this.removeAllFiles();

            if (file.size > (1024 * 1024 * this.options.maxFilesize)) {
                $('#error-on-upload').text('*Maximum upload file size is 20MB');
            }
            else {
                $('#error-on-upload').text('*Unsupported format or damage file');

            }

            $('#error-on-upload').show();
        });

    },
    success: function (file, response) {
        if (response.success == true) {

            console.log(response.dateupload);
            $("#FilePath").val(response.path);
            $("#FileName").val(response.filename);
            $('#DateCreated').val(response.dateupload);
            $('#lblFileName').text(file.name);
            $('#lblDateUpload').text(response.dateupload);
            $('#divContractFile').show();
            $('#btn-download').show();
            $('#error-on-upload').text('');

            if ($('#ContractId').val()) {
                $('#UploadDate').val(response.dateupload);
            }
        }
    }
}

function DownloadFile() {
    var myDropzone = Dropzone.forElement("#custom-dropzone");
    var fileName = $('#lblFileName').text();
    file = myDropzone.files[0];
    fr = new FileReader();
    fr.readAsDataURL(file);

    var blob = new Blob([file], { type: "application/pdf" });

    var objectURL = window.URL.createObjectURL(blob);
    console.log(objectURL);

    if (navigator.appVersion.toString().indexOf('.NET') > 0) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
        var link = document.createElement('a');
        link.href = objectURL;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}

function getFilePath() {
    return $("#FilePath").val;
}

//Browse File
$("#add-contract-browse").click(function () {
    $(".dropzone")[0].click();
});

//Delete File
$('#deleteContractFile-inactive').hover(
    function () {
        $('#deleteContractFile-inactive').hide();
        $('#deleteContractFile-active').show();
    },
    function () {
        $('#deleteContractFile-inactive').show();
        $('#deleteContractFile-active').hide();
    }
);
$('#deleteContractFile-active').hover(
    function () {
        $('#deleteContractFile-inactive').hide();
        $('#deleteContractFile-active').show();
    },
    function () {
        $('#deleteContractFile-inactive').show();
        $('#deleteContractFile-active').hide();
    }
);

$('#downloadID-hover').hover(
    function () {
        $(this).css("text-decoration", "underline");
    },
    function () {
        $(this).css("text-decoration", "none");
    }
);

$('#btnYesDeleteFile').click(function () {

    var urlRoute = $("#url-route").data('url-route');
    var imageUrl = $("#" + urlRoute).val();

    console.log(urlRoute);
    console.log(imageUrl);

    $.ajax({
        type: "POST",
        url: '/FileUpload/DeleteUploadedFile',
        data: { imageUrl: imageUrl },
        success: function (data) {

            if (data.success === true) {

                switch (urlRoute) {
                    case "FilePath":
                        $('#divContractFile').hide();
                        break;
                    default:
                        break;
                }

                $("#" + $("#url-route").data('url-route')).val('');

                $('#btn-download').hide();
                $('#deleteFileConfirm').hide();
                $('#deleteFilePrompt').show();
                $("#FilePath").val('');
                $('#lblFileName').text('');
                $('#lblDateUpload').text('');
                $("#FileName").val('');


                if ($('#ContractId').val()) {
                    $('#UploadDate').val('');
                }


                var myDropzone = Dropzone.forElement("#custom-dropzone");
                myDropzone.removeAllFiles();
            }
            else {

            }
        },
        fail: function (data) {
        }
    });
});

$('.deleteContractFile').click(function () {
    $("#url-route").data('url-route', '');
    $("#url-route").data('url-route', 'FilePath');

    $('#deleteFilePrompt').hide();
    $('#deleteFileConfirm').show();

    $("#deleteFileModal").modal('show');
});

$(function () {

    if ($('#ContractId').val()) {
        if ($('#lblFileName').text() !== "") {
            $('#divContractFile').show();
        }
    }

});
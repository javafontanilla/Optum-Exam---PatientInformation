let _path = '';
let _isClusterSelected = false;
let _isCategorySelected = false;
let _isInputDirty = false;

const UpdateButtonBehaviorByValuesChanged = (selector, newImg, newName) => {
    const oldImg = selector.dataset['img'];
    const oldName = selector.dataset['name'];

    if (newName !== '') {
        //if ((oldName !== newName) || (oldImg !== newImg))
            selector.disabled = false;
        //else
        //    selector.disabled = true;
    } else {
        selector.disabled = true;
    }

}

//================drag-drop image functionality============
const SizeCalculator = (bytes) => {
    if (bytes == 0) { return "0.00 B"; }
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B';
}

const dragDropElement = document.querySelectorAll('.dragdrop-body');
const inputFileElement = document.querySelectorAll('.input-upload-file');

const ShowSelectedFileDetails = (id, mode, file, isEdit, imgPath) => {
    const fileDetailsEl = document.getElementById(`file-details-${id}`);
    isEdit = isEdit === undefined ? false : isEdit;
    fetch(`/CategoryMaintenance/SelectedFileDetails?id=${id}&mode=${mode}&isEdit=${isEdit}&imagePath=${imgPath}`, {
        method: 'get'
    }).then(res => res.text()).then((data) => {
        fileDetailsEl.innerHTML = data;
        if (mode === 1) {
            const src = isEdit ? file : URL.createObjectURL(file);
            document.getElementById(`uploaded-image-${id}`).src = src;
            if (!isEdit) {
                document.getElementById(`uploaded-filename-${id}`).textContent = file.name;
                document.getElementById(`uploaded-size-${id}`).textContent = `(${SizeCalculator(file.size)})`;
            }
        } else {
            document.getElementById(`input-upload-file-${id}`).value = null;
        }
    });
}
//show image thumbnail after selection
const DisplaySelectedFileDetails = (filesObj, id) => {
    const acceptedFiles = ['png', 'jpg', 'jpeg'];
    let modeMsg = 0;

    if (filesObj.length > 0) {

        const file = filesObj[0];
        const fileSizeMB = file.size / 1024 / 1024;
        const _name = file.name.split('.');
        if (fileSizeMB <= 5) {
            const fileType = _name[_name.length - 1];
            const isAcceptable = acceptedFiles.indexOf(fileType) > -1;
            modeMsg = isAcceptable ? 1 : 2;
        } else {
            modeMsg = 3;
        }
        const a = id.replace('-', '_');
        const updateBtnEl = document.querySelector(`#${a} .update`);
        if (updateBtnEl !== null) {
            const newName = document.querySelector(`#${a} .input-category`).value;
            UpdateButtonBehaviorByValuesChanged(updateBtnEl, _name, newName);
        }
        ShowSelectedFileDetails(id, modeMsg, file);
    }
}

dragDropElement.forEach((i) => {
    const id = i.dataset['model'];
    const inputFileElement = document.getElementById(`input-upload-file-${id}`);
    //click on a div will trigger input file select dialog
    i.addEventListener('click', (e) => {
        inputFileElement.value = null;
        inputFileElement.click();
    });
    //prevents default behavior when dragging-dropping a file
    i.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    //handles dropped file. transfer file to input file, display thumbnail
    i.addEventListener('drop', (e) => {
        e.preventDefault();
        inputFileElement.files = e.dataTransfer.files;
        DisplaySelectedFileDetails(inputFileElement.files, id);
    });
    //input file: will be triggered when a file is selected or dropped into it
    inputFileElement.addEventListener('change', (e) => {
        //inputFileElement.value = null;
        DisplaySelectedFileDetails(e.target.files, id);
    });
});

//removes displayed thumbnail and file when x icon clicked
$(document).on('click', '.uploaded-remove', (e) => {
    const id = e.currentTarget.dataset['itemid'];
    const isEdit = e.currentTarget.dataset['edit'] === 'true';
    const inputFileEl = document.getElementById(`input-upload-file-${id}`);
    inputFileEl.value = '';
    ShowSelectedFileDetails(id, 0, inputFileEl);

    if (isEdit)
        _path = '';
    UpdateButtonBehaviorByValuesChanged(document.querySelector(`#${id.replace('-', '_')} .update`), _path, document.querySelector(`#${id.replace('-', '_')} .input-category`).value);
});
//drag and drop functionality >

//show add cluster modal
$(document).on('click', 'a#call_add_cluster', function (event) {
    $('#add_cluster #input_cluster').val('');
    $('.cluster_error').hide();
    ShowSelectedFileDetails('add-cluster', 0);
    $('#add_cluster .save').prop('disabled', true);
    $('#add_cluster').modal("show");
});

//=================add modal=============
//show add category modal
$(document).on('click', 'a#call_add_category', function (event) {
    const activeCluster = document.querySelector('.cluster-active');
    if (_isClusterSelected || activeCluster !== null) {
        $('#add_category #input_category').val('');
        $('.category_error').hide();
        ShowSelectedFileDetails('add-category', 0);
        $('#add_category .save').prop('disabled', true);
        $('#add_category').modal("show");
    } else {
        $('#cluster_ok').text('Please select a Cluster first.').show();
        $('#cluster_ok').fadeOut(5000);
    }
});
//show add subcategory modal
$(document).on('click', 'a#call_add_subcategory', function (event) {
    const activeCategory = document.querySelector('.category-active');
    if (_isCategorySelected || activeCategory !== null) {
        $('#add_subcategory #input_subcategory').val('');
        $('.subcategory_error').hide();
        ShowSelectedFileDetails('add-subcategory', 0);
        $('#add_subcategory .save').prop('disabled', true);
        $('#add_subcategory').modal("show");
    } else {
        $('#category_ok').text('Please select a Category first.').show();
        $('#category_ok').fadeOut(5000);
    }
});

//==========edit modal================

const SetUpdateButtonAttributes = (selector, id, name, img) => {
    const el = document.querySelector(selector);
    el.setAttribute('id', id);
    el.setAttribute('data-img', img);
    el.setAttribute('data-name', name);
    el.disabled = true;
}
//show edit cluster modal
$(document).on('click', '.edit_cluster', function (event) {
    var nId = $(this).attr('id');
    var n = $('li#' + nId + ' .item-left').text();
    $('#edit_cluster #input_cluster').val(n);
    $('#edit_cluster .editcluster_error').hide();
    $('#edit_cluster #editcluster_error').html('');

    const img = $(this).attr('data-img');
    const name = $(this).attr('data-name');
    _path = img === undefined ? '' : img;
    SetUpdateButtonAttributes('#edit_cluster .update', nId, name, img);
    ShowSelectedFileDetails('edit-cluster', (_path == '' ? 0 : 1), img, true);
    _isInputDirty = false;
    $('#edit_cluster').modal("show");
});
//show edit category modal
$(document).on('click', '.edit_category', function (event) {
    $('#edit_category #input_category').val('');
    $('#edit_category .editcategory_error').hide();
    var nId = $(this).attr('id');
    var n = $('li#' + nId + ' .item-left').text();
    $('#edit_category #input_category').val(n);
    

    const img = $(this).attr('data-img');
    const name = $(this).attr('data-name');
    _path = img === undefined ? '' : img;
    SetUpdateButtonAttributes('#edit_category .update', nId, name, img);
    ShowSelectedFileDetails('edit-category', (_path == '' ? 0 : 1), img, true);
    _isInputDirty = false;
    $('#edit_category').modal("show");
});

//show edit subcategory modal
$(document).on('click', '.edit_subcategory', function (event) {
    $('#edit_subcategory #input_subcategory').val('');
    $('.editsubcategory_error').hide();
    var nId = $(this).attr('id');
    var n = $('li#' + nId + ' .item-left').text();
    $('#edit_subcategory #input_subcategory').val(n);

    const img = $(this).attr('data-img');
    const name = $(this).attr('data-name');
    _path = img === undefined ? '' : img;
    SetUpdateButtonAttributes('#edit_subcategory .update', nId, name, img);
    ShowSelectedFileDetails('edit-subcategory', (_path == '' ? 0 : 1), img, true);
    _isInputDirty = false;
    $('#edit_subcategory').modal("show");
});
//==============save, update button===============

//modal primary button behavior
const ButtonBehavior = (selectr, disabled, isEdit) => {
    isEdit = isEdit === undefined ? false : isEdit;
    const el = document.querySelector(selectr);

    el.disabled = disabled;
    if (disabled)
        el.textContent = isEdit ? 'Updating...' : 'Saving...';
    else
        el.textContent = isEdit ? 'Update' : 'Save';
}

const BuildFormDataToSave = (name, file, parentId, productReference, path, oldName, type) => {
    parentId = parentId === undefined ? null : parentId;
    productReference = productReference === undefined ? null : productReference;
    path = path === undefined ? null : path;
    file = file === undefined ? null : file;
    type = type === undefined ? null : type;
    let frmData = new FormData();

    frmData.append('name', name);
    frmData.append('isNameChanged', _isInputDirty /*name !== oldName*/);

    if (parentId !== null)
        frmData.append('parentId1', parentId);

    if (file !== null)
        frmData.append('file', file);

    if (productReference !== null)
        frmData.append('productreferenceid', productReference);

    if (path !== null)
        frmData.append('path', path);

    if (type !== null)
        frmData.append('type', type);

    return frmData;
}
const GetCategoryPartialHTML = async (partialName, modelString) => {
    const prom = await fetch(`/CategoryMaintenance/GetCategoryPartial?partialName=${partialName}&modelString=${modelString}`,{
        method: 'get'
    });
    return prom;
}
//save add cluster
$(document).on('click', '#add_cluster .save', function (event) {
    var name = $('#input_cluster').val();
    const seltr = event.handleObj.selector;
    ButtonBehavior(seltr, true);

    $('.cluster_error').hide();
    $.ajax({
        type: "POST",
        processData: false,
        contentType: false,
        data: BuildFormDataToSave(name, document.getElementById('input-upload-file-add-cluster').files[0]),
        url: '/CategoryMaintenance/AddCluster',
        success: function (data) {
            if (!data.success) {
                $('#add_cluster ._error-category').text(data.message).show();
            } else {
                GetCategoryPartialHTML('ClusterPartial', data.model)
                    .then(res => res.text()).then((partial) => {
                    $('.cat-cluster').append(partial);
                    $('#input_cluster').val('');
                    $('#add_cluster').modal('hide');
                    $('#cluster_ok').html(' -> Cluster successfully added');
                    $('#cluster_ok').show();
                    $('#cluster_ok').fadeOut(5000);
                    ShowSelectedFileDetails('add-cluster', 0);
                });
            }
            ButtonBehavior(seltr, false);
        },
        fail: function (data) {
            console.log(data);
            ButtonBehavior(seltr, false);
        }
    });
});

//save add category
$(document).on('click', '#add_category .save', function (event) {
    var name = $('#input_category').val();
    var cluster_Id = $('.cluster-active').attr('id');
    const seltr = event.handleObj.selector;
    ButtonBehavior(seltr, true);

    $('.category_error').hide();

    $.ajax({
        type: "POST",
        processData: false,
        contentType: false,
        data: BuildFormDataToSave(name, document.getElementById('input-upload-file-add-category').files[0], cluster_Id),
        url: '/CategoryMaintenance/AddCategory',
        success: function (data) {
            if (!data.success) {
                $('#add_category ._error-category').text(data.message).show();
            } else {
                GetCategoryPartialHTML('CategoryPartial', data.model)
                    .then(res => res.text()).then((partial) => {
                        $('.cat-category').append(partial);
                        $('#input_category').val('');
                        $('#add_category').modal('hide');
                        $('#category_ok').html(' -> Category successfully added.');
                        $('#category_ok').show();
                        $('#category_ok').fadeOut(5000);
                        ShowSelectedFileDetails('add-category', 0);
                    });
            }
            ButtonBehavior(seltr, false);
        },
        fail: function (data) {
            console.log(data);
            ButtonBehavior(seltr, false);
        }
    });

});

//save add subcategory
$(document).on('click', '#add_subcategory .save', function (event) {
    var name = $('#input_subcategory').val();
    var category_Id = $('.category-active').attr('id');
    const seltr = event.handleObj.selector;
    ButtonBehavior(seltr, true);

    $.ajax({
        type: "POST",
        processData: false,
        contentType: false,
        data: BuildFormDataToSave(name, document.getElementById('input-upload-file-add-subcategory').files[0], category_Id),
        url: '/CategoryMaintenance/AddSubCategory',
        success: function (data) {
            if (!data.success) {
                $('#add_subcategory ._error-category').text(data.message).show();
            } else {
                GetCategoryPartialHTML('SubCategoryPartial', data.model)
                    .then(res => res.text()).then((partial) => {
                        $('.cat-subcategory').append(partial);
                        $('#input_subcategory').val('');
                        $('#add_subcategory').modal('hide');
                        $('#subcategory_ok').html(' -> Sub-category successfully added.');
                        $('#subcategory_ok').show();
                        $('#subcategory_ok').fadeOut(5000);
                        ShowSelectedFileDetails('add-subcategory', 0);
                    });
            }
            ButtonBehavior(seltr, false);
        },
        fail: function (data) {
            console.log(data);
            ButtonBehavior(seltr, false);
        }
    });

});

//save edit cluster
$(document).on('click', '#edit_cluster .update', function (event) {
    var pId = $(this).attr('id');
    var name = $('#edit_cluster #input_cluster').val();
    var oldName = $(this).attr('data-name');
    const seltr = event.handleObj.selector;

    ButtonBehavior(seltr, true, true);
    $.ajax({
        type: "post",
        processData: false,
        contentType: false,
        data: BuildFormDataToSave(name, document.getElementById('input-upload-file-edit-cluster').files[0], null, pId, _path, oldName,"Cluster"),
        url: '/CategoryMaintenance/UpdateCategory',
        success: function (data) {

            if (!data.success) {
                $('#edit_cluster ._error-category').text(data.message).show();
            } else {
                $('li#' + pId + ' .item-left').text(name);
                $('#edit_cluster').modal('hide');
                $('#cluster_ok').html(' -> Cluster successfully updated.');
                $('#cluster_ok').show();
                $('#cluster_ok').fadeOut(5000);

                $(`a[data-id=_${pId}]`).attr('data-img', data.returnedPath);
                $(`a[data-id=_${pId}]`).attr('data-name', name);
            }
            ButtonBehavior(seltr, false, true);
        },
        fail: function (data) {
            ButtonBehavior(seltr, false, true);
            console.log(data);
        }
    });

});

//save edit category
$(document).on('click', '#edit_category .update', function (event) {
    var pId = $(this).attr('id');
    $('#edit_category .editcategory_error').hide();
    var name = $('#edit_category #input_category').val();
    var oldName = $(this).attr('data-name');
    const seltr = event.handleObj.selector;
    ButtonBehavior(seltr, true, true);


    $.ajax({
        type: "POST",
        processData: false,
        contentType: false,
        data: BuildFormDataToSave(name, document.getElementById('input-upload-file-edit-category').files[0], null, pId, _path, oldName,"Category"),
        url: '/CategoryMaintenance/UpdateCategory',
        success: function (data) {
            if (!data.success) {
                $('#edit_category ._error-category').text(data.message).show();
            } else {
                $('li#' + pId + ' .item-left').text(name);
                $('#edit_category').modal('hide');
                $('#edit_category #input_category').val('');
                $('#category_ok').html(' -> Category successfully updated.');
                $('#category_ok').show();
                $('#category_ok').fadeOut(5000);
                $(`a[data-id=_${pId}]`).attr('data-img', data.returnedPath);
                $(`a[data-id=_${pId}]`).attr('data-name', name);
            }
            ButtonBehavior(seltr, false, true);
        },
        fail: function (data) {
            ButtonBehavior(seltr, false, true);
            console.log(data);
        }
    });
});

//save edit subcategory
$(document).on('click', '#edit_subcategory .update', function (event) {
    var pId = $(this).attr('id');
    $('.editsubcategory_error').hide();
    var name = $('#edit_subcategory #input_subcategory').val();
    var oldName = $(this).attr('data-name');
    const seltr = event.handleObj.selector;
    ButtonBehavior(seltr, true, true);

    $.ajax({
        type: "POST",
        processData: false,
        contentType: false,
        data: BuildFormDataToSave(name, document.getElementById('input-upload-file-edit-subcategory').files[0], null, pId, _path, oldName,"Sub-Category"),
        url: '/CategoryMaintenance/UpdateCategory',
        success: function (data) {
            if (!data.success) {
                $('#edit_subcategory ._error-category').text(data.message).show();
            } else {
                $('li#' + pId + ' .item-left').text(name);
                $('#edit_subcategory').modal('hide');
                $('#edit_subcategory #input_subcategory').val('');
                $('#subcategory_ok').html(' -> Sub-category successfully updated.');
                $('#subcategory_ok').show();
                $('#subcategory_ok').fadeOut(5000);
                $(`a[data-id=_${pId}]`).attr('data-img', data.returnedPath);
                $(`a[data-id=_${pId}]`).attr('data-name', name);
            }
            ButtonBehavior(seltr, false, true);
        },
        fail: function (data) {
            ButtonBehavior(seltr, false, true);
            console.log(data);
        }
    });

});


//input function
const InputFilter = (inputEl, isEdit) => {
    isEdit = isEdit === undefined ? false : isEdit;

    let val = inputEl.currentTarget.value;
    const id = inputEl.currentTarget.id.replace('input', isEdit ? 'edit' : 'add');
    const regex = new RegExp("^[a-zA-Z\b ]+$");
    const key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    const isValidInput = regex.test(key);

    val = val.replace(/ +(?= )/g, '');
    inputEl.currentTarget.value = val;

    if (!isValidInput) {
        $(`#${id} ._error-category`).html('Numbers and Symbols are not allowed for this field.').show();
        inputEl.preventDefault();
    } else
        $(`#${id} ._error-category`).hide();

    const updateBtnEl = document.querySelector(`#${id} .${(isEdit ? 'update' : 'save')}`);

    UpdateButtonBehaviorByValuesChanged(updateBtnEl, _path, val);
    _isInputDirty = true;
}

//add cluster input
$(document).on('keypress', '#add_cluster #input_cluster', function (e) {
    InputFilter(e);
});
//edit cluster input 
$(document).on('keypress', '#edit_cluster #input_cluster', function (e) {
    InputFilter(e, true);
});
//add category input
$(document).on('keypress', '#add_category #input_category', function (e) {
    InputFilter(e);
});
//edit category input
$(document).on('keypress', '#edit_category #input_category', function (e) {
    InputFilter(e, true);
});

//add subcategory input
$(document).on('keypress', '#add_subcategory #input_subcategory', function (e) {
    InputFilter(e);
});
//edit subcategory input
$(document).on('keypress', '#edit_subcategory #input_subcategory', function (e) {
    InputFilter(e, true);
});


//show category list where cluster
$(document).on('click', '.cluster-list', function (event) {
    $('div').removeClass('cluster-active');
    $(this).addClass('cluster-active');
    var cluster_Id = $(this).attr('id');
    _isCategorySelected = false;
    $.ajax({
        type: "GET",
        url: `/CategoryMaintenance/CategoriesByCluster?parentId1=${cluster_Id}`,
        success: function (data) {
            $('.cat-category').empty();
            $('.cat-subcategory').empty();
            $('.cat-category').append(data);
            _isClusterSelected = true;
        },
        fail: function (data) {
            console.log(data);
        }
    });

});

//show subcategory list where category
$(document).on('click', '.category-list', function (event) {
    $('div').removeClass('category-active');
    $(this).addClass('category-active');
    var cluster_Id = $(this).attr('id');
    $.ajax({
        type: "GET",
        data: { "parentId1": cluster_Id },
        url: `/CategoryMaintenance/SubCategoriesByCategory?parentId1=${cluster_Id}`,
        success: function (data) {
            $('.cat-subcategory').empty();
            $('.cat-subcategory').append(data);
            _isCategorySelected = true;
        },
        fail: function (data) {
            console.log(data);
        }
    });

});

$(document).on('click', '.btn-mod-cancel, .x-close-modal', (e) => {
    document.querySelectorAll('.modal-footer .save, .modal-footer .update').forEach(i => {
        i.disabled = true;
    });
});


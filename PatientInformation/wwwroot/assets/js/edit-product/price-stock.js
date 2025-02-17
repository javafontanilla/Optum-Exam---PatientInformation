
var didRangeValidationFail = false;

//================== CREATE OBJECT: GET ALL VARIANT / SUBVARIANT INPUT ELEMENTS ====================
const GetVariantsSubvariants = (allVariantElements, allSubVariantElements) => {
    let objVariantList = [];
    let varcount = 0;
    //get subvariations
    let subVar = [];
    allSubVariantElements.forEach(i => {
        const inputElement = i.querySelector('input[type="text"]');
        var subVarName = document.getElementsByClassName('sub-variant-name');

        subVar.push({
            SubVariantName: subVarName[0].value,
            SubVariantOption: inputElement.value,
            SubVariantId: inputElement.id
        });
    });

    //get variants, then compile all to an object
    allVariantElements.forEach(i => {
        const inputElement = i.querySelector('input[type="text"]');
        const imgElement = i.querySelector('img');

        if (inputElement.value !== '' && imgElement !== null) {
            const imgSrc = imgElement.src;
            const variantName = inputElement.value;
            const isSub = inputElement.dataset['issub'];
            const variationName = document.getElementById("ProductVariations_0__VariationName").value;
            objVariantList.push({
                Index: varcount,
                VariantId: inputElement.id,
                VariantName: variationName,
                Variant: variantName,
                ImageSrc: imgSrc,
                SubVariant: subVar,
                ShopSKU: makeid(11)
            });
        }
        varcount++
    });
    return objVariantList;
}

//================ POPULATE TABLE WITH VARIANT / SUBVARIANT DATA ====================
const PopulatePriceStockTable = e => {
    e.preventDefault();

    const variantElements = document.querySelectorAll('.product-variation-option-input.variant .row.mt-3');
    const subvariantElements = document.querySelectorAll('.product-variation-option-input.subvariant .row.mt-3');
    const obj = GetVariantsSubvariants(variantElements, subvariantElements);

    //FillorClearPriceStockTable('');

    if (ValidateVariationOption()) {
        RestoreSaveVariationsBtnToDefault(e, false);

        fetch(`/EditProduct/EditPriceAndStockFormPartial`, {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj)
        }).then(res => res.text()).then((data) => {
            FillorClearPriceStockTable(data);
            $('.price-stock-sku').removeAttr('disabled');
            $('#btn-price-stock-apply-all').click();
            InitializeDateTimePickers('#input-price-stock-sale-start, #input-price-stock-sale-end, .input-price-stock-sale-date');
			$("#btnSubmit").attr('disabled', false);
            RestoreSaveVariationsBtnToDefault(e, true);
        }).catch((err) => {
            RestoreSaveVariationsBtnToDefault(e, true);
            alert(err);
        });
    }
}

const RestoreSaveVariationsBtnToDefault = (e, restore) => {
    if (restore) {
        e.target.textContent = 'Save Variations';
        e.target.disabled = false;
    } else {
        e.target.textContent = 'Saving Variations...';
        e.target.disabled = true;
    }
}

//================= INPUT: NUMERIC CHARS ONLY ===============
const NumericOnly = e => {
    var key = window.event ? e.keyCode : e.which;

    if (e.keyCode == 8 || e.keyCode == 46
        || e.keyCode == 37 || e.keyCode == 39) {
        return true;
    }
    else if (key < 48 || key > 57) {
        return false;
    }
    else return true;
}

//================== INPUT: CALCULATE PERCENTAGE WHILE TYPING ON INPUT IN TABLE
$(document).on('keydown keyup change', '.input-sale-price, .price-input', e => {
    const validColumn = e.currentTarget.dataset['col'] === '1' || e.currentTarget.dataset['col'] === '5';
    const prefixId = e.currentTarget.id.split('__')[0];
    const isSaleToggledOn = document.getElementById(`${prefixId}__dcToggle`).checked;

    if (validColumn && isSaleToggledOn)
        CalculatePercentage(e.currentTarget);
});


//============ APPLY STYLING TO FOCUSED / UNFOCUSED COLUMNS ===============
const SelectedColumnFocusStyle = (isRemove, column, isError, cellId) => {
    isError = isError === undefined ? false : isError;
    const _class = isError ? 'selected-column-error' : 'selected-column';

    if (!isNaN(parseInt(column))) {
        //loop through selected column: add class styling
        document.querySelectorAll(`.td-cell[data-col='${column}']`).forEach(e => {
            if (column === '5') {
                const salePriceElement = e.querySelector('.final-discount-input');
                if (isRemove)
                    salePriceElement.classList.remove(`${_class}-sale`);
                else
                    salePriceElement.classList.add(`${_class}-sale`);

                salePriceElement.querySelector('.input-sale-price').style.borderColor = isRemove ? '#dfdfdf' : 'transparent';
            }

            if (isRemove)
                e.classList.remove(_class);
            else
                e.classList.add(_class);
        });
    }

    if (isError) {
        if (isRemove) {
            $('.price-stock-main-details .input-price-stock').removeClass('input-price-stock-error');
            $('.price-stock-table .td-cell').removeClass('selected-column-error');

        } else {
            if (cellId === undefined) {
                $(`.price-stock-main-details .input-price-stock[data-col="${column}"]`).addClass('input-price-stock-error');
            } else {
                document.querySelector(cellId).classList.add('cell-error');
                $('.price-stock-table .td-cell').removeClass('selected-column-error');
            }
        }
    }

}
//=============== INPUT: FOCUS ON COLUMNS WHILE ON MAIN INPUT =============

$(document).on('focus', '.input-price-stock', e => {
    const col = e.currentTarget.dataset['col'];
    SelectedColumnFocusStyle(false, col);
});

//=============== INPUT: UNFOCUS ON COLUMNS WHILE ON MAIN INPUT =============
$(document).on('blur', '.input-price-stock', e => {
    const col = e.currentTarget.dataset['col'];
    SelectedColumnFocusStyle(true, col);
});

//============= ENABLE / DISABLE INPUT ON TOGGLE ======================
$(document).on('change', 'input.toggle-check-input', e => {
    const isChecked = e.currentTarget.checked;
    const id = e.currentTarget.dataset['id'];
    for (let col = 5; col <= 7; col++) {
        const saleElements = document.querySelector(`.td-cell[data-id='${id}'][data-col='${col}'] input${(col === 5 ? '.input-sale-price' : '.input-price-stock-sale-date')}`);
        saleElements.disabled = !isChecked;
        if (!isChecked)
            saleElements.value = '';
        else {
            saleElements.value = document.querySelector(`.input-price-stock[data-col='${col}']`).value;
        }
        if (col === 5)
            CalculatePercentage(saleElements);
    }


    //========REMOVE THE ERROR BORDER FROM CELL
    if (!isChecked) {
        $parent = $(e.target).parent().parent().parent().parent();
        if ($parent.hasClass("cell-error")) {
            $parent.removeClass("cell-error");
        }
    }
});

//============== BUTTON: APPLY TO ALL ======================
const ApplyToAll = (e) => {
    //column:  1 = price | 2 = SKU | 3 = Shop SKU | 4 = stock | 5 = sale price | 6 = sale start | 7 = sale end
    const alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    document.querySelectorAll('.input-price-stock').forEach(i => {
        const column = i.dataset['col'];
        const value = i.value;

        if (value != '') {
            if (column === '1') {
                $('.cell-price').removeClass('cell-error')
                SnackbarErrorMessage(false)
            }
            if (column === '2') {
                $('.cell-sku').removeClass('cell-error')
                SnackbarErrorMessage(false)
            }
            if (column === '4') {
                $('.cell-quantity').removeClass('cell-error')
                SnackbarErrorMessage(false)
            }
        }
        //set value of inputs based on main input value
        document.querySelectorAll(`.td-cell[data-col='${column}'] input${(column === '5' ? '.input-sale-price' : '')}`).forEach(j => {

            if ((column === '2')) {

            } else {
                j.value = value;
            }

            //sale price
            if (column === '5') {
                const toggleInputCheckElement = document.querySelector(`.toggle-check-input[data-id='${j.dataset['id']}']`);

                if (value === '' && toggleInputCheckElement.checked)
                    toggleInputCheckElement.click();
                if (value !== '' && !toggleInputCheckElement.checked)
                    toggleInputCheckElement.click();
                CalculatePercentage(j);
            }

            //if ((column === '2' || column === '3') && value !== '') {
            //    let ind = j.dataset['index'];
            //    const varNum = parseInt(j.dataset['var']) + 1;

            //    //auto SKU suffix: brownbag-1a
            //    j.value = `${value}-${varNum}${alpha[ind]}`;
            //}

            //sale end date
            if (column === '6') {
                InitializeDateTimePickers('.td-cell .input-price-stock-sale-start', undefined, value);
                InitializeDateTimePickers('.td-cell .input-price-stock-sale-end', value);
            }
        });
    });


}
document.getElementById('btn-price-stock-apply-all').addEventListener('click', e => {
    e.preventDefault();

    e.preventDefault();
    var inputValue = $("#input-price-stock-stock").val();
    if ((inputValue == "") || (!isNaN(inputValue) && parseInt(inputValue) == inputValue)) {


        if (didRangeValidationFail === false)
            SnackbarErrorMessage(false);

        SelectedColumnFocusStyle(true, undefined, true);
        ApplyToAll(e);
    } else {

        SnackbarErrorMessage(true, "Quantity should be in whole number.");
    }
});

//================ CALCULATE SALE PRICE PERCENTAGE ==============
const CalculatePercentage = (e) => {
    const id = e.dataset['id'];
    let retailPrice = 0;
    let salePrice = 0;
    if (typeof id !== "undefined") {
        retailPrice = parseInt(document.querySelector(`.td-cell[data-col='1'][data-id='${id}'] input`).value);
        salePrice = parseInt(document.querySelector(`.td-cell[data-col='5'][data-id='${id}'] .sale-price-cell .final-discount-input input`).value);

        let percentage = 0;
        if (e.value > 0 && retailPrice > 0)
            percentage = ((retailPrice - salePrice) / retailPrice) * 100;

        if (percentage < 1 && e.value != '') {
            SnackbarErrorMessage(true, 'Enter from 1% to 99% discount only.');
            didRangeValidationFail = true;
            document.querySelector(`.td-cell[data-col='5'][data-id='${id}'] .sale-price-cell .final-discount-input input`).value = '';
            document.querySelector(`.final-discount-input[data-col='5'][data-id='${id}'] .discount-percentage span`).textContent = `0%`;
        }
        else {
            document.querySelector(`.final-discount-input[data-col='5'][data-id='${id}'] .discount-percentage span`).textContent = `${convertToDecimal(percentage)}%`;
        }
    }
}

//================= CLOSE ERROR SNACKBAR ================
document.getElementById('price-stock-close-error').addEventListener('click', e => {
    SnackbarErrorMessage(false);
});

const findParentWithClass = (element, className) => {
    if (!element.parentElement) {
        return null; // Reached the top parent without finding the class
    }

    if (element.parentElement.classList.contains(className)) {
        return element.parentElement; // Found the parent with the class
    }

    return findParentWithClass(element.parentElement, className); // Continue searching the parent's parent
}

//================ RANGE VALIDATION PRICE AND QUANTITY ===================


function ValidateSalesPricesInVariationTable() {
    var isThereError = false;
    var index = 0;

    while ($("#ProductSubVariations_" + index + "__dcToggle").length) {

        if ($("#ProductSubVariations_" + index + "__dcToggle").is(':checked')) {

            if ($("#ProductSubVariations_" + index + "__DiscountedPrice").val() === '') {
                $parent = $("#ProductVariations_" + index + "__DiscountedPrice").parent().parent().parent();
                if (!$parent.hasClass("cell-error")) {
                    $parent.addClass("cell-error");
                }
                isThereError = true;
            }
        }
        index++;
    }

    index = 0;
    while ($("#ProductVariations_" + index + "__dcToggle").length) {

        if ($("#ProductVariations_" + index + "__dcToggle").is(':checked')) {

            if ($("#ProductVariations_" + index + "__DiscountedPrice").val() === '') {
                $parent = $("#ProductVariations_" + index + "__DiscountedPrice").parent().parent().parent();
                if (!$parent.hasClass("cell-error")) {
                    $parent.addClass("cell-error");
                }
                isThereError = true;
            }
        }
        index++;
    }

    return isThereError;
}

$(document).on('blur', '.price-input', function (e) {
    var inputVal = $(this).val();
    var decimalCheck = inputVal.split('.');

    // Get current cursor position
    var cursorPos = $(this)[0].selectionStart;
    var isAcceptableKey = true;
    // If decimal point or digit key is pressed
    if ((e.key >= '0' && e.key <= '9') || e.key == '.') {
        // Block if decimal point already exists and decimal point key is pressed
        if (e.key == '.' && inputVal.indexOf('.') != -1) {
            e.preventDefault();
            isAcceptableKey = false;
        }
        // Block if there are already two decimal places and digit key is pressed, and cursor is in the decimal part
        else if (decimalCheck[1] != undefined && decimalCheck[1].length >= 2 && cursorPos > inputVal.indexOf('.') && e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            isAcceptableKey = false;
        }
    }

    if (isAcceptableKey) {
        //========REMOVE THE ERROR BORDER FROM CELL
        $parent = $(e.target).parent();
        if ($parent.hasClass("cell-error")) {
            $parent.removeClass("cell-error");
        }
    }
    
});


$(document).on('change', '.price-input', function (e) {
    var inputVal = parseFloat($(this).val());

    // Check if the input is a number
    if ($.isNumeric(inputVal)) {

        // Check if the number is between 1 and 1,000,000
        if (inputVal < 1.00 || inputVal > 1000000.00) {
            SnackbarErrorMessage(true, 'Allowed values are 1.00 up to 1,000,000.00 only.');
            didRangeValidationFail = true;
            $(this).val('');
        }
        else {
            didRangeValidationFail = false;
            SnackbarErrorMessage(ValidateSalesPricesInVariationTable(), 'Sales Price is required.');

            var value = $(this).val();
            if (value.indexOf('.') !== -1) {
                if (value.split('.')[1].length > 2) {
                    var integerPart = value.split('.')[0];
                    var decimalPart = value.split('.')[1].substring(0, 2);
                    $(this).val(integerPart + '.' + decimalPart);
                } else if (value.split('.')[1].length < 2) {
                    $(this).val(value + '0'.repeat(2 - value.split('.')[1].length));
                }
            } else {
                $(this).val(value + '.00');
            }

        }
    } else {
        SnackbarErrorMessage(true, 'Price is required.');
        didRangeValidationFail = true;
        $(this).val('');
        $parent = $(e.target).parent();
        if ($parent.hasClass("cell-error") == false) {
            $parent.addClass("cell-error");
        }
    }
});

$(document).on('blur', '.quantity-input', function (e) {
    var inputVal = parseFloat($(this).val());
    $parent = $(e.target).parent();
    // Check if the input is a number
    if ($.isNumeric(inputVal)) {

        // Check if the number is between 1 and 1,000,000
        if (inputVal < 0.00 || inputVal > 999999.00) {
            SnackbarErrorMessage(true, 'Allowed values are 0.00 up to 999,999.00 only.');
            didRangeValidationFail = true;
            $(this).val('');
        }
        else {
            didRangeValidationFail = false;

            if ($parent.hasClass("cell-error")) {
                $parent.removeClass("cell-error");
            }
        }
    } else {
        SnackbarErrorMessage(true, 'Stock is required.');
        didRangeValidationFail = true;
        $(this).val('');
    }
});

$(document).on('change', '.quantity-input', function () {
    var inputVal = parseFloat($(this).val());

    // Check if the input is a number
    if ($.isNumeric(inputVal)) {

        // Check if the number is between 1 and 1,000,000
        if (inputVal < 0.00 || inputVal > 999999.00) {
            SnackbarErrorMessage(true, 'Allowed values are 0.00 up to 999,999.00 only.');
            didRangeValidationFail = true;
            $(this).val('');
        }
        else {
            didRangeValidationFail = false;
            SnackbarErrorMessage(false);
        }
    } else {
        SnackbarErrorMessage(true, 'Stock is required.');
        didRangeValidationFail = true;
        $(this).val('');
    }
});

$(document).on('blur', '.subvar-sku', function (e) {
    var inputVal = parseFloat($(this).val());
    $parent = $(e.target).parent();
    // Check if the input is not empty
    if (inputVal !== '') {
        SnackbarErrorMessage(false);
        if ($parent.hasClass("cell-error")) {
            $parent.removeClass("cell-error");
        }
    } else {
        SnackbarErrorMessage(true, 'SKU is required.');
        if ($parent.hasClass("cell-error") == false) {
            $parent.addClass("cell-error");
        }
    }

});
$(document).on('blur', '.table-var-sku', function (e) {
    var inputVal = parseFloat($(this).val());
    $parent = $(e.target).parent();
    // Check if the input is not empty
    if (inputVal !== '') {
        SnackbarErrorMessage(false);
        if ($parent.hasClass("cell-error")) {
            $parent.removeClass("cell-error");
        }
    } else {
        SnackbarErrorMessage(true, 'SKU is required.');
        if ($parent.hasClass("cell-error") == false) {
            $parent.addClass("cell-error");
        }
    }

});



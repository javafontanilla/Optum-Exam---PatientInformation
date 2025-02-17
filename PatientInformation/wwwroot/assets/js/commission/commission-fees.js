
$(".particularcreatemodalcaller").click(function () {
	var type = $(this).attr("data-type");
	var templateName = $("#particularTemplate").val();
	$(".particular-submit-btn").attr("disabled", false);
	$.ajax({
		type: "GET",
		url: `/CommissionAndFees/Create?type=${type}&templateName=${templateName}`,
		success: function (data) {
			$("#particularupdateformholder").html("");
			$("#particularcreateformholder").html(data);
			$("#particularCreateModal").modal('show');
		},
		fail: function (data) {
			console.log(data);
		}
	});
});

const DateValidator = (start, end, isStart, isEdit) => {
	isEdit = isEdit === undefined ? false : isEdit;
	//2023-03-21
	
	let start_ = document.getElementById(start).value;
	start_ = parseInt(start_.split('-').join(""));

	let end_ = document.getElementById(end).value;
	end_ = parseInt(end_.split('-').join(""));

	if (isNaN(end_) && isNaN(start_)) {
		document.getElementById(`${(isStart ? 'start' : 'end')}date`).textContent = `${(isStart ? 'Start' : 'End')} date is invalid.`;
		return false;
	}

	if (start_ > end_) {
		const msg = 'Start date should be less than the End date.';
		if (isEdit)
			document.querySelector('span[data-valmsg-for="StartDate"]').textContent = msg;
		else
			document.getElementById('startdate').textContent = msg;
		return false;
	} else {
		$((isEdit ? 'span[data-valmsg-for="StartDate"],span[data-valmsg-for="EndDate"]' : '#startdate,#enddate')).text('');
		return true;
	}
}

$(document).on('change', '#create-paritcularstartdate', (e) => {
	const isEditModal = e.target.getAttribute('data-update') === 'true';
	$('#particularCreateModal').find('button[type="submit"]').prop('disabled', !DateValidator(e.target.id, (isEditModal ? 'update-particularenddate' : 'create-particularenddate'), true, isEditModal));
});

$(document).on('change', '#create-particularenddate, #update-particularenddate', (e) => {
	const isEditModal = e.target.getAttribute('data-update') === 'true';
	$(`#${(isEditModal ? 'particularUpdateModal' : 'particularCreateModal')}`).find('button[type="submit"]').prop('disabled', !DateValidator('create-paritcularstartdate', e.target.id, false, isEditModal));
});
//$(document).on('change', '#update-particularenddate', (e) => {
//	$('#particularUpdateModal').find('button[type="submit"]').prop('disabled', !DateValidator('create-paritcularstartdate', e.target.id, false));
//});

$(document).on("submit", "#particularcreateform", function (e) {

	if (!e.detail || e.detail == 1) {
		e.preventDefault()
		$(".particular-submit-btn").attr("disabled", true);
		$(".particular-submit-btn").text('Saving...');
		$('.spinner').show();

		var particular = $("#particularcreateform").serialize();


		fetch('/CommissionAndFees/Create', {
			method: 'POST',
			headers: { 'Content-type': 'application/x-www-form-urlencoded' },
			body: particular
		})
			.then(res => res.text())
			.then(result => {
				try {
					var data = JSON.parse(result);
					$("#particularCreateModal").modal('toggle');
					if (data.success === true) {
						reloadAfterSubmit($("#Type").val());
						ShowAlertMessage("Comission detail successfully created", true);
					}
					else {
						ShowAlertMessage(data.message, false);
					}
				} catch (err) {
					$("#particularupdateformholder").html("");
					$("#particularcreateformholder").html(result);
				}
				$(".particular-submit-btn").attr("disabled", false);
				$(".particular-submit-btn").text('Save');
				$('.spinner').hide();
			}).catch((error) => {
				$('.spinner').hide();
				$(".particular-submit-btn").attr("disabled", false);
				$("#particularCreateModal").modal('toggle');
				ShowAlertMessage("An error has occured. Please refresh the page.", false);
			});
	}
});

$(document).on('change keydown keyup keypress', 'input[name="Rate"], #update-particular-name', e => {
	const name = e.currentTarget.name;
	document.querySelector(`span[data-valmsg-for="${name}"]`).textContent = '';
});
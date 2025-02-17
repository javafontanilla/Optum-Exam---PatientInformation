$(document).ready(function () {
	$('#datatable').DataTable({
		"bLengthChange": false,
		//dom: '<"top"iflp<"clear">>rt',
		'autoWidth': false,
		"stripeClasses": [],
		columnDefs: [{
			"targets": [2,3],
			"orderable": false,
		}]
	});

	//const topItemsEl = document.querySelector('.top-details');
	//const topItemsHTML = topItemsEl.innerHTML;
	//topItemsEl.innerHTML = '';
	//$('#datatable_wrapper').find('.top').prepend(topItemsHTML);

	$("#searchtxt").keyup(function (e) {
		var code = e.key; // recommended to use e.key, it's normalized across devices and languages
		//if (code === "Enter") {
		var table = $('#datatable').DataTable();
		var filtertext = $('#searchtxt').val();

		table.search(filtertext);
		table.draw();
		//} // missing closing if brace
	});
});
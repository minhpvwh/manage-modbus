function showDivElement(element) {
    document.getElementById('inputBetween').style.display = element.value === 'between' ? 'block' : 'none';
    document.getElementById('inputNotBetween').style.display = element.value !== 'between' ? 'block' : 'none';
}

$(document).ready(function () {
    // jQuery methods go here...
    $('a.edit').click(function (e) {
        e.preventDefault();
        modal = $('#editEmployeeModal');
        $.get('/configs/meters/rules/4', function (data) {
            for (const row of data.rulesMeter) {
                $('#editEmployeeModal tbody').append(`<tr>
                <td>
                <span class="custom-checkbox">
                    <input type="checkbox" id="checkbox1" name="options[]" value="1">
                    <label for="checkbox1"></label>
                </span>
                </td>
                <td>${row.name}</td>
                <td>${row.operator}</td>
                <td>${row.value_single}</td>
                <td>${row.value_from}</td>
                <td>${row.value_to}</td>
                </tr>`)
            }
            // set values in modal
            // modal.find('form').attr('action', '/admin/categories/get-cateory/' + tr.data('id') );
            // modal.find('[name=title]').val( data.title );
            // // open modal
            // modal.modal('show');
        });
        modal.modal('show');
    });
});
function showDivElement(element) {
    document.getElementById('inputBetween').style.display = element.value === 'between' ? 'block' : 'none';
    document.getElementById('inputNotBetween').style.display = element.value !== 'between' ? 'block' : 'none';
}

$(document).ready(function () {

    // jQuery methods go here...
    $('a.edit').click(function (e) {
        e.preventDefault();
        const id = $(this).parents('tr').data('id');
        modal = $('#editEmployeeModal');
        $.get(`/configs/meters/rules/${id}`, function (data) {
            tbody = $('#editEmployeeModal tbody').empty();
            $('#editEmployeeModal input#selectAllRule').prop('checked', false);
            for (const row of data.rulesMeter) {
                if (row.operator === 'between') {
                    row.operator = 'Ngưỡng';
                } else if (row.operator === 'smaller') {
                    row.operator = 'Nhỏ hơn'
                } else if (row.operator === 'greater') {
                    row.operator = 'Lớn hơn'
                } else if (row.operator === 'equal') {
                    row.operator = 'Bằng'
                }
                tbody.append(`<tr data-id=${row.id}>
                <td>
                <span class="custom-checkbox">
                    <input type="checkbox" id="checkbox2" name="options[]" value="1">
                    <label for="checkbox2"></label>
                </span>
                </td>
                <td>${row.name}</td>
                <td>${row.parameter}</td>
                <td>${row.operator}</td>
                <td>${row.value_single || ''}</td>
                <td>${row.value_from || ''}</td>
                <td>${row.value_to || ''}</td>
                </tr>`).after(function () {
                    initRule();
                })
            }
            // set values in modal
            // modal.find('form').attr('action', '/admin/categories/get-cateory/' + tr.data('id') );
            // modal.find('[name=title]').val( data.title );
            // // open modal
            // modal.modal('show');
        });
        modal.modal('show');
    });

    $('a.delete').click(function (e) {
        e.preventDefault();
        const id = $(this).parents('tr').data('id');
        modal = $('#deleteEmployeeModal');
        modal.find('form').attr({action: `/configs/meters/delete/${id}`, method: 'GET'});
        modal.modal('show');
    });

    // Activate tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // Select/Deselect checkboxes Meter
    var checkbox = $('table.show-meter tbody input[type="checkbox"]');
    $("#selectAll").click(function () {
        if (this.checked) {
            checkbox.each(function () {
                this.checked = true;
            });
        } else {
            checkbox.each(function () {
                this.checked = false;
            });
        }
    });
    checkbox.click(function () {
        if (!this.checked) {
            $("#selectAll").prop("checked", false);
        }
    });

    function initRule() {
        // Select/Deselect checkboxes Meter
        var checkboxRule = $('table.show-rule tbody input[type="checkbox"]');
        $("#selectAllRule").click(function () {
            if (this.checked) {
                checkboxRule.each(function () {
                    this.checked = true;
                });
            } else {
                checkboxRule.each(function () {
                    this.checked = false;
                });
            }
        });
        checkboxRule.click(function () {
            if (!this.checked) {
                $("#selectAllRule").prop("checked", false);
            }
        });
    }

    $('div#editEmployeeModal input#deleteRules').click(function (e) {
        e.preventDefault();
        rows = $('#editEmployeeModal .custom-checkbox #checkbox2:checked').parents('tr');
        let ids = [];
        for (const row of rows) {
            ids.push($(row).data('id'));
        }
        $.ajax({
            url: '/configs/meters/rules',
            type: 'DELETE',
            data: {ids: ids}
        });
        modal = $('#editEmployeeModal').modal('hide');
    });

});
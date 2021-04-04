function showDivElement(element) {
    document.getElementById('inputBetween').style.display = element.value === 'between' ? 'block' : 'none';
    document.getElementById('inputNotBetween').style.display = element.value !== 'between' ? 'block' : 'none';
}

function showModalAddRule(element) {
    const id = element.getAttribute('data-id');
    document.getElementById('idRuleGroup').value = id;
}

function showModalRules(element) {
    const id = element.getAttribute('data-id');
    document.getElementById('idRules').value = id;
}

$(document).ready(function () {
    $('a.edit').click(function (e) {
        e.preventDefault();
        const id = $(this).parents('tr').data('id');
        modal = $('#showRulesModal');
        $.get(`/configs/meters/rules/${id}`, function (data) {
            console.log(data)
            tbody = $('#showRulesModal tbody').empty();
            $('#showRulesModal input#selectAllRule').prop('checked', false);
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
                <td>${row.operator}</td>
                <td>${row.value_single || ''}</td>
                <td>${row.value_from || ''}</td>
                <td>${row.value_to || ''}</td>
                <td>${row.message || ''}</td>
                </tr>`).after(function () {
                    initRule();
                })
            }
        });
        modal.modal('show');
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

    $('div#showRulesModal input#deleteRules').click(function (e) {
        e.preventDefault();
        rows = $('#showRulesModal .custom-checkbox #checkbox2:checked').parents('tr');
        let ids = [];
        for (const row of rows) {
            ids.push($(row).data('id'));
        }
        $.ajax({
            url: '/configs/meters/rules',
            type: 'DELETE',
            data: {ids: ids}
        });
        modal = $('#showRulesModal').modal('hide');
    });

    // $('a.delete').click(function (e) {
    //     e.preventDefault();
    //     const id = $(this).parents('tr').data('id');
    //     modal = $('#deleteRuleGroupModal');
    //     modal.find('form').attr({action: `/rule-groups/delete/${id}`, method: 'GET'});
    //     modal.modal('show');
    // });
})
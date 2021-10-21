import $ from 'jquery';
import { Item } from "./dto/item";

const BASE_API = 'http://localhost:8080/pos';
const ITEMS_SERVICE_API = `${BASE_API}/items`;
const PAGE_SIZE = 6;


let items: Array<Item> = [];
let totalItems = 0;

loadAllItems();

function loadAllItems(): void {

    fetch(ITEMS_SERVICE_API + "?" + new URLSearchParams({page: PAGINATION.selectedPage + "", size: PAGE_SIZE+ ""})).then((resp)=>{
        if(resp.status !== 200) throw new Error("Failed to load items, try again");

        totalItems = +resp.headers.get('X-Total-Count');
        return resp.json();
    }).then((data)=>{
        items = data;
        $('#tbl-items tbody tr').remove();

        items.forEach((c) => {
            const rowHtml = `<tr>
            <td>${c.code}</td>
            <td>${c.description}</td>
            <td>${c.qtyOnHand}</td>
            <td>${c.unitPrice}</td>
            <td><i class="fas fa-trash trash"></i></td>
            </tr>` ;


            $('#tbl-items tbody').append(rowHtml);
        });

   
    }).catch((err)=>{
        alert(err.message);
        console.log(err);
        
    });
}

$('#btn-save').on('click', (eventData) => {
    eventData.preventDefault();

    const txtCode = $('#txt-code');
    const txtDesc = $('#txt-description');
    const txtPrice = $('#txt-price');
    const txtQty = $('#txt-qty');

    let code = (txtCode.val() as string).trim();
    let description = (txtDesc.val() as string).trim();
    let price = (txtPrice.val() as string).trim();
    let qty = (txtQty.val() as string).trim();

    let validated = true;
    $('#txt-id, #txt-name, #txt-address').removeClass('is-invalid');


    if (!/^\d+$/.test(qty)) {
        txtQty.addClass('is-invalid');
        txtQty.trigger('select');
        validated = false;
    }

    if (!/^\d+(.\d{2})?$/.test(price)) {
        txtPrice.addClass('is-invalid');
        txtPrice.trigger('select');
        validated = false;
    }

    if (!/^[A-Za-z ]+$/.test(description)) {
        txtDesc.addClass('is-invalid');
        txtDesc.trigger('select');
        validated = false;
    }

    if (!/^I\d{3}$/.test(code)) {
        txtCode.addClass('is-invalid');
        txtCode.trigger('select');
        validated = false;
    }

    if (!validated) return;

    if (txtCode.attr('disabled')) {

        updateItem(new Item(code, description, +price, +qty));
        return;
    }

    saveItem(new Item(code, description, +price, +qty));
});

function updateItem(item: Item): void {
    fetch(ITEMS_SERVICE_API,{
        method: 'PUT',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    }).then((resp)=>{
        if(resp.status !== 204) throw new Error("Failed to update the item, try again");

        alert("item has been updated successfully");
        $("#tbl-items tbody tr.selected").find("td:nth-child(2)").text($("#txt-description").val() as string);
        $("#tbl-items tbody tr.selected").find("td:nth-child(3)").text($("#txt-qty").val() as string);
        $("#tbl-items tbody tr.selected").find("td:nth-child(4)").text($("#txt-price").val() as string);
        $('#txt-code, #txt-description, #txt-price, #txt-qty').val('');
        $('#txt-code').trigger('focus');
        $("#tbl-items tbody tr.selected").removeClass('selected');
        $('#txt-code').removeAttr('disabled');
    }).catch((err)=>{
        alert(err.message);
        console.error(err);
    });

}

function saveItem(item: Item): void {
    fetch(ITEMS_SERVICE_API,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    }).then((resp)=>{
        if(resp.status !== 201) throw new Error("Failed to save item, try again");

        alert("Customer has been saved successfully");

        totalItems++;

        
        $('#txt-code, #txt-description, #txt-price, #txt-qty').val('');
        $('#txt-code').trigger('focus');
        $('#txt-id').removeAttr('disabled');
    }).catch((err)=>{
        alert(err.message);
        console.error(err);
    });
}

$('#tbl-items tbody').on('click', 'tr', function () {

    const code = $(this).find("td:first-child").text();
    const desc = $(this).find("td:nth-child(2)").text();
    const qty = $(this).find("td:nth-child(3)").text();
    const price = $(this).find("td:nth-child(4)").text();

    $('#txt-code').val(code).attr('disabled', "true");
    $('#txt-description').val(desc);
    $('#txt-price').val(price);
    $('#txt-qty').val(qty);

    $("#tbl-items tbody tr").removeClass('selected');
    $(this).addClass('selected');

});

$('#tbl-items tbody').on('click', '.trash', function (eventData) {
    if (confirm('Are you sure to delete?')) {
        deleteItem(($(eventData.target).parents("tr").find('td:first-child')).text());
    }
});

function deleteItem(code: string): void {
    fetch(ITEMS_SERVICE_API +`?${new URLSearchParams({code: code})}`,{
        method: 'DELETE'
    }).then((resp)=>{
        if(resp.status !== 204) throw new Error("Failed to delete the item, try again");
        
        totalItems--;
        
        $('#btn-clear').trigger('click');
    }).catch((err)=>{
        alert(err.message);
        console.error(err);
    });
}

$('#btn-clear').on('click', () => {
    $("#tbl-items tbody tr.selected").removeClass('selected');
    $("#txt-code").removeAttr('disabled').trigger('focus');
});
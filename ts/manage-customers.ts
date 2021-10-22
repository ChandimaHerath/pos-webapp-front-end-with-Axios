import { Customer } from "./dto/customer";
import $ from 'jquery';
import { Pagination } from "./dto/pagination";
import axios from "axios";

// const BASE_API = 'https://bc677221-4831-4411-b038-9e174414f8ff.mock.pstmn.io';
const BASE_API = 'http://localhost:8080/pos';
const CUSTOMERS_SERVICE_API = `${BASE_API}/customers`;
const PAGE_SIZE = 6;
const PAGINATION = new Pagination($('.pagination'), PAGE_SIZE, 0, loadAllCustomers);

let customers: Array<Customer> = [];
let totalCustomers = 0;
/* let selectedPage = 1;
let pageCount = 1; */

loadAllCustomers();

$('#btn-save').on('click', (eventData) => {
    eventData.preventDefault();
    
    const txtId = $('#txt-id');
    const txtName = $('#txt-name');
    const txtAddress = $('#txt-address');
    
    let id = (txtId.val() as string).trim();
    let name = (txtName.val() as string).trim();
    let address = (txtAddress.val() as string).trim();
    
    let validated = true;
    $('#txt-id, #txt-name, #txt-address').removeClass('is-invalid');
    
    if (address.length < 3) {
        txtAddress.addClass('is-invalid');
        txtAddress.trigger('select');
        validated = false;
    }
    
    if (!/^[A-Za-z ]+$/.test(name)) {
        txtName.addClass('is-invalid');
        txtName.trigger('select');
        validated = false;
    }
    
    if (!/^C\d{3}$/.test(id)) {
        txtId.addClass('is-invalid');
        txtId.trigger('select');
        validated = false;
    }
    
    if (!validated) return;
    
    if (txtId.attr('disabled')) {
        
        const selectedRow = $("#tbl-customers tbody tr.selected");
        updateCustomer(new Customer(id, name, address));
        return;
    }
    
    saveCustomer(new Customer(id, name, address));
});

$('#tbl-customers tbody').on('click', 'tr', function () {

    const id = $(this).find("td:first-child").text();
    const name = $(this).find("td:nth-child(2)").text();
    const address = $(this).find("td:nth-child(3)").text();

    $('#txt-id').val(id).attr('disabled', "true");
    $('#txt-name').val(name);
    $('#txt-address').val(address);

    $("#tbl-customers tbody tr").removeClass('selected');
    $(this).addClass('selected');

});

$('#tbl-customers tbody').on('click', '.trash', function (eventData) {
    if (confirm('Are you sure to delete?')) {
        deleteCustomer(($(eventData.target).parents("tr").find('td:first-child')).text());
    }
});

$('#btn-clear').on('click', () => {
    $("#tbl-customers tbody tr.selected").removeClass('selected');
    $("#txt-id").removeAttr('disabled').trigger('focus');
});

function loadAllCustomers(): void {

    axios.get(CUSTOMERS_SERVICE_API,{
        params: {
            page: PAGINATION.selectedPage,
            size: PAGE_SIZE
        }
    }).then((resp)=>{
        customers = resp.data;
        
        totalCustomers = +resp.headers['x-total-count'];
        

        $('#tbl-customers tbody tr').remove();

        customers.forEach((c) => {
            const rowHtml = `<tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.address}</td>
                <td><i class="fas fa-trash trash"></i></td>
                </tr>` ;


        $('#tbl-customers tbody').append(rowHtml);
        });

        PAGINATION.reInitialize(totalCustomers,PAGINATION.selectedPage);
    }).catch((err)=>{
        alert("Failed to fetch customers, try again...!");
        console.log(err);
    });
}

function updateCustomer(customer: Customer): void {
    axios({
        method: 'PUT',
        url: CUSTOMERS_SERVICE_API,
        headers: {'content-type': 'application/json'},
        data: customer
    }).then(()=>{
        alert("Customer has been updated successfully");
        $("#tbl-customers tbody tr.selected").find("td:nth-child(2)").text($("#txt-name").val() as string);
        $("#tbl-customers tbody tr.selected").find("td:nth-child(3)").text($("#txt-address").val() as string);
        $('#txt-id, #txt-name, #txt-address').val('');
        $('#txt-id').trigger('focus');
        $("#tbl-customers tbody tr.selected").removeClass('selected');
        $('#txt-id').removeAttr('disabled');
    }).catch((err)=>{
        alert(err.message);
        console.log(err);
    });
}

function saveCustomer(customer: Customer): void {    
    axios({
        method: 'POST',
        url: CUSTOMERS_SERVICE_API,
        headers: {'content-type': 'application/json'},
        data: customer
    }).then(()=>{
        alert('Customer saved successful');
        totalCustomers++;

        PAGINATION.pageCount = Math.ceil(totalCustomers / PAGE_SIZE);
        PAGINATION.navigateToPage(PAGINATION.pageCount);
        $('#txt-id, #txt-name, #txt-address').val('');
        $('#txt-id').trigger('focus');
    }).catch((err)=>{
        alert(err.message);
        console.log(err);
        $('#txt-id').trigger('select');
    });
}

function deleteCustomer(id: string): void {

    axios.delete(CUSTOMERS_SERVICE_API,{
        params: {
            id: id
        }
    }).then(()=>{
        totalCustomers--;
        PAGINATION.pageCount = Math.ceil(totalCustomers / PAGE_SIZE);            
        PAGINATION.navigateToPage(PAGINATION.pageCount);

        $('#btn-clear').trigger('click');
    }).catch((err)=>{
        alert(err.message);
        console.error(err);
    });
}

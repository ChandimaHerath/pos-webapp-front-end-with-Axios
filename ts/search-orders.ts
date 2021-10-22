import $ from 'jquery'
import { Order } from "./dto/search-order";
import { Pagination } from "./dto/pagination";
import axios from 'axios';

const BASE_API = 'http://localhost:8080/pos';
const ORDERS_SERVICE_API = `${BASE_API}/orders`;
const PAGE_SIZE = 6;
const PAGINATION = new Pagination($('.pagination'),PAGE_SIZE,0,searchOrders);

searchOrders();

$('#btn-search').on('click',(eventData)=>{
    eventData.preventDefault();
    searchOrders();
});

$("#txt-search").on('input',()=>{
    searchOrders();
});

function searchOrders():void{
    axios.get(ORDERS_SERVICE_API,{
        params: {
            page: PAGINATION.selectedPage,
            size: PAGE_SIZE,
            q: $('#txt-search').val()
        }
    }).then((resp)=>{
        const count = +resp.headers['x-total-count'].split('/')[0]
        PAGINATION.reInitialize(count,PAGINATION.selectedPage,PAGE_SIZE);

        $('#tbl-orders tbody tr').remove();
        
        const orders: Array<Order> = resp.data;
        orders.forEach((o)=>{
            const rowHtml = `<tr>
            <td>${o.orderId}</td>
            <td>${o.orderDate}</td>
            <td>${o.customerId}</td>
            <td>${o.customerName}</td>
            <td>${o.orderTotal.toFixed(2)}</td>
            </tr>
            `;
            $('#tbl-orders tbody').append(rowHtml);
        });        
    }).catch((err)=>{
        alert(err.message);
        console.error(err);
    });
}

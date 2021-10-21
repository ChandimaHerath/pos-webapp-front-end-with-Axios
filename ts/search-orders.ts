import { Order } from "./dto/search-order";

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
    
    fetch(ORDERS_SERVICE_API + `?${new URLSearchParams({page:PAGINATION.selectedPage + '', size: PAGE_SIZE + '', q: $('#txt-search').val() + ''})}`)
    .then((resp)=>{
        const count = +resp.headers.get('X-Total-Count');
        if(resp.status !== 200) throw new Error("Something went wrong, please try again");
        PAGINATION.reInitialize(count,PAGINATION.selectedPage,PAGE_SIZE);
        
        return resp.json();
    }).then((data)=>{
        $('#tbl-orders tbody tr').remove();
        
        const orders: Array<Order> = data;
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

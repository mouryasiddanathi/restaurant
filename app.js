let cart = {};
let totalBill = 0;

function addItem(name, price) {
    if (cart[name]) {
        cart[name].qty += 1;
    } else {
        cart[name] = { price: price, qty: 1 };
    }
    totalBill += price;
    renderBill();
}

function renderBill() {
    const listContainer = document.getElementById('bill-items-list');
    const totalContainer = document.getElementById('bill-result');

    listContainer.innerHTML = '';

    const itemKeys = Object.keys(cart);

    if (itemKeys.length === 0) {
        listContainer.innerHTML = '<div class="empty-message" id="empty-msg">No items added to the bill yet.</div>';
        totalContainer.textContent = '₹0';
        return;
    }

    itemKeys.forEach(name => {
        const item = cart[name];
        const li = document.createElement('li');
        li.className = 'bill-item';
        li.innerHTML = `
            <div class="item-info">
                <strong>${name}</strong>
                <span class="qty">Qty: ${item.qty} x ₹${item.price}</span>
            </div>
            <div><strong>₹${item.qty * item.price}</strong></div>
        `;
        listContainer.appendChild(li);
    });

    totalContainer.textContent = `₹${totalBill}`;
}

function getTodayKey() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function getFormattedTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getSalesData() {
    const raw = localStorage.getItem('nagaraju_sales');
    return raw ? JSON.parse(raw) : {};
}

function saveSalesData(data) {
    localStorage.setItem('nagaraju_sales', JSON.stringify(data));
}

function saveOrder() {
    const todayKey = getTodayKey();
    const salesData = getSalesData();

    if (!salesData[todayKey]) {
        salesData[todayKey] = { orders: [], dayTotal: 0 };
    }

    const orderItems = Object.entries(cart).map(([name, info]) => ({
        name,
        qty: info.qty,
        price: info.price,
        subtotal: info.qty * info.price
    }));

    const order = {
        time: getFormattedTime(),
        items: orderItems,
        total: totalBill,
        orderId: Date.now()
    };

    salesData[todayKey].orders.push(order);
    salesData[todayKey].dayTotal += totalBill;

    saveSalesData(salesData);
    renderSalesDashboard();
}

function processOrder() {
    if (totalBill === 0) {
        alert("Please add items to your bill before placing an order!");
    } else {
        saveOrder();
        alert(`✅ Order Placed! Bill Amount: ₹${totalBill}\nSaved to today's sales record.`);
        cart = {};
        totalBill = 0;
        renderBill();
    }
}

function formatDate(dateKey) {
    const [year, month, day] = dateKey.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function clearAllSales() {
    if (confirm("⚠️ Are you sure you want to clear ALL sales history? This cannot be undone.")) {
        localStorage.removeItem('nagaraju_sales');
        renderSalesDashboard();
    }
}

function renderSalesDashboard() {
    const dashboard = document.getElementById('sales-dashboard');
    const salesData = getSalesData();
    const dateKeys = Object.keys(salesData).sort((a, b) => b.localeCompare(a)); // newest first

    if (dateKeys.length === 0) {
        dashboard.innerHTML = `
            <div class="no-sales-msg">
                <span>📋</span>
                <p>No sales recorded yet. Place your first order to start tracking!</p>
            </div>`;
        return;
    }

    // Overall totals
    let grandTotal = 0;
    let totalOrders = 0;
    dateKeys.forEach(key => {
        grandTotal += salesData[key].dayTotal;
        totalOrders += salesData[key].orders.length;
    });

    let html = `
        <div class="sales-summary-cards">
            <div class="summary-card">
                <div class="summary-icon">📅</div>
                <div class="summary-value">${dateKeys.length}</div>
                <div class="summary-label">Days Active</div>
            </div>
            <div class="summary-card">
                <div class="summary-icon">🧾</div>
                <div class="summary-value">${totalOrders}</div>
                <div class="summary-label">Total Orders</div>
            </div>
            <div class="summary-card highlight-card">
                <div class="summary-icon">💰</div>
                <div class="summary-value">₹${grandTotal.toLocaleString('en-IN')}</div>
                <div class="summary-label">All-Time Revenue</div>
            </div>
        </div>`;

    dateKeys.forEach(dateKey => {
        const dayData = salesData[dateKey];
        const isToday = dateKey === getTodayKey();

        html += `
        <div class="day-section ${isToday ? 'today-section' : ''}">
            <div class="day-header">
                <div class="day-title">
                    ${isToday ? '<span class="today-badge">TODAY</span>' : ''}
                    <span class="day-date">${formatDate(dateKey)}</span>
                </div>
                <div class="day-stats">
                    <span class="day-orders-count">${dayData.orders.length} order${dayData.orders.length !== 1 ? 's' : ''}</span>
                    <span class="day-total-amount">₹${dayData.dayTotal.toLocaleString('en-IN')}</span>
                </div>
            </div>
            <div class="orders-list">`;

        dayData.orders.forEach((order, idx) => {
            html += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-num">Order #${idx + 1}</span>
                        <span class="order-time">🕐 ${order.time}</span>
                        <span class="order-total">₹${order.total}</span>
                    </div>
                    <div class="order-items-list">`;

            order.items.forEach(item => {
                html += `
                        <div class="order-item-row">
                            <span class="oi-name">${item.name}</span>
                            <span class="oi-qty">x${item.qty}</span>
                            <span class="oi-subtotal">₹${item.subtotal}</span>
                        </div>`;
            });

            html += `
                    </div>
                </div>`;
        });

        html += `</div></div>`;
    });

    dashboard.innerHTML = html;
}

// Init on page load
window.addEventListener('DOMContentLoaded', () => {
    renderSalesDashboard();
});

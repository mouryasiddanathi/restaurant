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
            
            // Clear current list view
            listContainer.innerHTML = '';
            
            const itemKeys = Object.keys(cart);
            
            if (itemKeys.length === 0) {
                listContainer.innerHTML = '<div class="empty-message" id="empty-msg">No items added to the bill yet.</div>';
                totalContainer.textContent = '₹0';
                return;
            }
            
            // Loop through map to build layout lines
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
            
            // Render computed layout total
            totalContainer.textContent = `₹${totalBill}`;
        }

        function processOrder() {
            if (totalBill === 0) {
                alert("Please add items to your bill before placing an order!");
            } else {
                alert(`Order Success! Final Bill Amount Sent to Counter: ₹${totalBill}`);
                cart = {};
                totalBill = 0;
                renderBill();
            }
        }
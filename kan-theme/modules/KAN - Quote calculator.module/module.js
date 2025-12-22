
const calculator = document.getElementById('quote-calculator');
const currencySymbol = 'kr';
const productItems = calculator.querySelectorAll('.product-item');
const totalAmountEl = calculator.querySelector('.total-amount');

function formatPrice(price) {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function calculateTotal() {
    let total = 0;

    productItems.forEach(item => {
        const qty = parseInt(item.querySelector('.qty-input').value) || 0;
        const price = parseFloat(item.dataset.price) || 0;
        total += qty * price;
    });

    totalAmountEl.textContent = formatPrice(total);
}

function updateSubtotal(item) {
    const qty = parseInt(item.querySelector('.qty-input').value) || 0;
    const price = parseFloat(item.dataset.price) || 0;
    const subtotal = qty * price;

    item.querySelector('.subtotal-value').textContent = formatPrice(subtotal) + ' ' + currencySymbol;
}

productItems.forEach(item => {
    const minusBtn = item.querySelector('.qty-btn--minus');
    const plusBtn = item.querySelector('.qty-btn--plus');
    const qtyInput = item.querySelector('.qty-input');

    minusBtn.addEventListener('click', () => {
        const currentQty = parseInt(qtyInput.value) || 0;
        if (currentQty > 0) {
            qtyInput.value = currentQty - 1;
            updateSubtotal(item);
            calculateTotal();
        }
    });

    plusBtn.addEventListener('click', () => {
        const currentQty = parseInt(qtyInput.value) || 0;
        const maxQty = parseInt(qtyInput.max) || 999;
        if (currentQty < maxQty) {
            qtyInput.value = currentQty + 1;
            updateSubtotal(item);
            calculateTotal();
        }
    });

    qtyInput.addEventListener('input', () => {
        let value = parseInt(qtyInput.value);
        const min = parseInt(qtyInput.min) || 0;
        const max = parseInt(qtyInput.max) || 999;

        if (isNaN(value) || value < min) {
            qtyInput.value = min;
        } else if (value > max) {
            qtyInput.value = max;
        }

        updateSubtotal(item);
        calculateTotal();
    });

    qtyInput.addEventListener('blur', () => {
        if (qtyInput.value === '') {
            qtyInput.value = 0;
            updateSubtotal(item);
            calculateTotal();
        }
    });
});

calculateTotal();

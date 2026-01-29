const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { PayOS } = require('@payos/node');

const app = express();
dotenv.config();

// Initialize PayOS
const payOS = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use('/', express.static('public'));

// Create payment link endpoint
app.post('/create-payment-link', async (req, res) => {
    const YOUR_DOMAIN = `http://localhost:8000`;

    try {
        // Parse items from request
        let items = [];
        let totalAmount = 0;

        if (req.body.items) {
            // Parse JSON string from form
            const cartItems = typeof req.body.items === 'string'
                ? JSON.parse(req.body.items)
                : req.body.items;

            // Convert cart items to PayOS format
            items = cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            // Calculate total
            totalAmount = cartItems.reduce((sum, item) =>
                sum + (item.price * item.quantity), 0
            );
        } else {
            // Fallback: single product (backward compatibility)
            items = [{
                name: 'Sản phẩm demo',
                quantity: 1,
                price: 2000,
            }];
            totalAmount = 2000;
        }

        // Validate minimum amount (PayOS requires at least 2000 VND)
        if (totalAmount < 2000) {
            totalAmount = 2000;
        }

        // Create description from items
        const itemNames = items.map(i => `${i.name} x${i.quantity}`).join(', ');
        const description = itemNames.length > 25
            ? `Thanh toan ${items.length} san pham`
            : itemNames.substring(0, 25);

        // Create order code (unique, 6 digits)
        const orderCode = Number(String(Date.now()).slice(-6));

        const body = {
            orderCode: orderCode,
            amount: totalAmount,
            description: description,
            items: items,
            returnUrl: `${YOUR_DOMAIN}/success.html?amount=${totalAmount}&items=${items.length}`,
            cancelUrl: `${YOUR_DOMAIN}/cancel.html?amount=${totalAmount}&items=${items.length}`,
        };

        console.log('Creating payment with:', body);

        const paymentLinkResponse = await payOS.paymentRequests.create(body);

        console.log('Payment link created:', paymentLinkResponse.checkoutUrl);

        res.redirect(paymentLinkResponse.checkoutUrl);
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).send(`
            <html>
                <head>
                    <title>Lỗi thanh toán</title>
                    <link rel="stylesheet" href="/style.css">
                    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Signika:wght@400;500;600;700&display=swap" rel="stylesheet">
                </head>
                <body>
                    <div class="main-box">
                        <div class="error-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path fill="white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                        </div>
                        <h1 class="payment-title error">Lỗi tạo thanh toán</h1>
                        <p class="payment-message">
                            ${error.message || 'Có lỗi xảy ra khi tạo link thanh toán.'}
                            <br><br>
                            Vui lòng kiểm tra cấu hình PayOS trong file .env
                        </p>
                        <a href="/" class="return-btn">← Quay lại</a>
                    </div>
                </body>
            </html>
        `);
    }
});

// API endpoint for getting cart info (optional)
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        products: [
            { id: 1, name: 'Mì tôm Hảo Hảo ly', price: 5000, emoji: '🍜', category: 'Mì' },
            { id: 2, name: 'Phở bò ăn liền', price: 8000, emoji: '🍲', category: 'Mì' },
            { id: 3, name: 'Coca Cola lon', price: 10000, emoji: '🥤', category: 'Nước' },
            { id: 4, name: 'Pepsi lon', price: 10000, emoji: '🥤', category: 'Nước' },
            { id: 5, name: 'Nước suối Aquafina', price: 5000, emoji: '💧', category: 'Nước' },
            { id: 6, name: 'Bánh mì sandwich', price: 15000, emoji: '🥪', category: 'Bánh' },
            { id: 7, name: 'Bánh bao nhân thịt', price: 12000, emoji: '🥟', category: 'Bánh' },
            { id: 8, name: 'Snack khoai tây', price: 8000, emoji: '🍟', category: 'Snack' },
            { id: 9, name: 'Kẹo dẻo Haribo', price: 15000, emoji: '🍬', category: 'Snack' },
            { id: 10, name: 'Trà sữa trân châu', price: 25000, emoji: '🧋', category: 'Nước' },
            { id: 11, name: 'Cà phê sữa đá', price: 20000, emoji: '☕', category: 'Nước' },
            { id: 12, name: 'Xúc xích nướng', price: 10000, emoji: '🌭', category: 'Đồ ăn' },
        ]
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
    console.log(`\n🚀 Server is running at http://localhost:${PORT}`);
    console.log(`📦 PayOS Demo Shop ready!\n`);
});
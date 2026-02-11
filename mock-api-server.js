const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage
let coupons = [];
let nextId = 1;

// Helper to validate date
const isValidDate = (d) => d instanceof Date && !isNaN(d);

// GET all coupons
app.get('/api/coupons', (req, res) => {
    const now = new Date();
    const results = coupons.map(c => {
        let status = 'active';
        const validUntil = new Date(c.valid_until);
        const validFrom = new Date(c.valid_from);

        if (validUntil < now) status = 'expired';
        else if (validFrom > now) status = 'scheduled';
        else if (c.usage_limit && c.used_count >= c.usage_limit) status = 'exhausted';
        else if (!c.is_active) status = 'inactive';

        return { ...c, status, total_usage: c.used_count || 0 };
    });
    res.json(results);
});

// GET single coupon
app.get('/api/coupons/:id', (req, res) => {
    const coupon = coupons.find(c => c.id === parseInt(req.params.id));
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
});

// CREATE coupon
app.post('/api/coupons', (req, res) => {
    const { code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, valid_from, valid_until, is_active } = req.body;

    if (!code || !discount_type || !discount_value || !valid_from || !valid_until) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (coupons.find(c => c.code === code.toUpperCase())) {
        return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const newCoupon = {
        id: nextId++,
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        minimum_order_amount: minimum_order_amount || 0,
        maximum_discount_amount,
        usage_limit,
        used_count: 0,
        valid_from,
        valid_until,
        is_active: is_active !== undefined ? is_active : true,
        created_at: new Date()
    };

    coupons.push(newCoupon);
    res.json({ success: true, message: 'Coupon created successfully', id: newCoupon.id });
});

// UPDATE coupon
app.put('/api/coupons/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = coupons.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Coupon not found' });

    const { code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, valid_from, valid_until, is_active } = req.body;

    const updatedCoupon = {
        ...coupons[index],
        code: code ? code.toUpperCase() : coupons[index].code,
        description: description !== undefined ? description : coupons[index].description,
        discount_type: discount_type || coupons[index].discount_type,
        discount_value: discount_value || coupons[index].discount_value,
        minimum_order_amount: minimum_order_amount !== undefined ? minimum_order_amount : coupons[index].minimum_order_amount,
        maximum_discount_amount: maximum_discount_amount !== undefined ? maximum_discount_amount : coupons[index].maximum_discount_amount,
        usage_limit: usage_limit !== undefined ? usage_limit : coupons[index].usage_limit,
        valid_from: valid_from || coupons[index].valid_from,
        valid_until: valid_until || coupons[index].valid_until,
        is_active: is_active !== undefined ? is_active : coupons[index].is_active
    };

    coupons[index] = updatedCoupon;
    res.json({ success: true, message: 'Coupon updated successfully' });
});

// DELETE coupon
app.delete('/api/coupons/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = coupons.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Coupon not found' });

    coupons.splice(index, 1);
    res.json({ success: true, message: 'Coupon deleted successfully' });
});

// VALIDATE coupon
app.post('/api/coupons/validate', (req, res) => {
    const { code, order_amount } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const coupon = coupons.find(c => c.code === code.toUpperCase());
    if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon code' });

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (!coupon.is_active || validFrom > now || validUntil < now) {
        return res.status(404).json({ error: 'Invalid or expired coupon code' });
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) { // Fix: use coupon.used_count
        return res.status(404).json({ error: 'Coupon usage limit exceeded' });
    }

    if (order_amount < coupon.minimum_order_amount) {
        return res.status(400).json({ error: `Minimum order amount of ₹${coupon.minimum_order_amount} required` });
    }

    let discount_amount = 0;
    if (coupon.discount_type === 'percentage') {
        discount_amount = (order_amount * coupon.discount_value) / 100;
        if (coupon.maximum_discount_amount && discount_amount > coupon.maximum_discount_amount) {
            discount_amount = coupon.maximum_discount_amount;
        }
    } else {
        discount_amount = coupon.discount_value;
    }

    res.json({
        valid: true,
        coupon: {
            ...coupon,
            discount_amount
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
});

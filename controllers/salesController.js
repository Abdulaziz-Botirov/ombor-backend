import { pool } from '../config/db.js'

export async function getSales(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        sales.*,
        products.name AS product_name
      FROM sales
      JOIN products ON products.id = sales.product_id
      ORDER BY sales.sold_date DESC, sales.created_at DESC
    `)

    res.json(result.rows)
  } catch (error) {
    console.error('GET SALES ERROR:', error)
    res.status(500).json({ message: 'Server xatosi' })
  }
}

export async function createSale(req, res) {
  try {
    const {
      product_id,
      customer_name,
      sold_date,
      quantity_sold,
      payment_type,
      paid_amount_uzs,
    } = req.body

    if (!product_id || !customer_name || !sold_date || !quantity_sold) {
      return res.status(400).json({ message: 'Barcha maydonlarni to‘ldiring' })
    }

    const productResult = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [product_id]
    )

    const product = productResult.rows[0]

    if (!product) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' })
    }

    const qty = Number(quantity_sold)

    if (qty <= 0) {
      return res.status(400).json({ message: 'Miqdor noto‘g‘ri' })
    }

    if (qty > Number(product.quantity)) {
      return res.status(400).json({ message: 'Omborda buncha mahsulot yo‘q' })
    }

    const totalAmount = Number(product.price_uzs) * qty

    let paidAmount = Number(paid_amount_uzs || 0)
    let debtAmount = 0
    let isPaid = true
    let finalPaymentType = payment_type || 'naxt'

    if (finalPaymentType === 'naxt') {
      paidAmount = totalAmount
      debtAmount = 0
      isPaid = true
    } else {
      if (paidAmount < 0) paidAmount = 0
      if (paidAmount > totalAmount) paidAmount = totalAmount

      debtAmount = totalAmount - paidAmount
      isPaid = debtAmount <= 0
    }

    await pool.query(
      `INSERT INTO sales 
      (
        product_id,
        customer_name,
        sold_date,
        quantity_sold,
        payment_type,
        total_amount_uzs,
        paid_amount_uzs,
        debt_amount_uzs,
        is_paid
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        product_id,
        customer_name,
        sold_date,
        qty,
        finalPaymentType,
        totalAmount,
        paidAmount,
        debtAmount,
        isPaid,
      ]
    )

    await pool.query(
      'UPDATE products SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [qty, product_id]
    )

    res.status(201).json({ message: 'Sotuv saqlandi' })
  } catch (error) {
    console.error('CREATE SALE ERROR:', error)
    res.status(500).json({ message: 'Server xatosi' })
  }
}

export async function payDebt(req, res) {
  try {
    const { id } = req.params
    const { amount } = req.body

    const payAmount = Number(amount)

    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ message: 'To‘lov summasi noto‘g‘ri' })
    }

    const saleResult = await pool.query(
      'SELECT * FROM sales WHERE id = $1',
      [id]
    )

    const sale = saleResult.rows[0]

    if (!sale) {
      return res.status(404).json({ message: 'Sotuv topilmadi' })
    }

    if (Number(sale.debt_amount_uzs) <= 0) {
      return res.status(400).json({ message: 'Bu sotuvda qarz yo‘q' })
    }

    let newPaid = Number(sale.paid_amount_uzs) + payAmount
    const total = Number(sale.total_amount_uzs)

    if (newPaid > total) {
      newPaid = total
    }

    const newDebt = total - newPaid
    const isPaid = newDebt <= 0

    await pool.query(
      `UPDATE sales
       SET paid_amount_uzs = $1,
           debt_amount_uzs = $2,
           is_paid = $3
       WHERE id = $4`,
      [newPaid, newDebt, isPaid, id]
    )

    res.json({ message: 'Qarz to‘lovi saqlandi' })
  } catch (error) {
    console.error('PAY DEBT ERROR:', error)
    res.status(500).json({ message: 'Server xatosi' })
  }
}
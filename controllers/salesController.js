import { pool } from '../config/db.js'

export async function getSales(_req, res) {
  try {
    const result = await pool.query(`
      SELECT sales.*, products.name AS product_name
      FROM sales
      JOIN products ON products.id = sales.product_id
      ORDER BY sales.sold_date DESC, sales.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('GET SALES ERROR:', error)
    res.status(500).json({ message: 'Sotuvlarni olishda xatolik' })
  }
}

export async function createSale(req, res) {
  const client = await pool.connect()
  try {
    const { product_id, customer_name, sold_date, quantity_sold } = req.body

    if (!product_id || !customer_name || !sold_date || !quantity_sold) {
      return res.status(400).json({ message: 'Barcha maydonlarni to‘ldiring' })
    }

    await client.query('BEGIN')

    const productResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [product_id])
    const product = productResult.rows[0]

    if (!product) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Mahsulot topilmadi' })
    }

    const qtyToSell = Number(quantity_sold)
    const currentQty = Number(product.quantity)

    if (qtyToSell <= 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ message: 'Miqdor 0 dan katta bo‘lishi kerak' })
    }

    if (qtyToSell > currentQty) {
      await client.query('ROLLBACK')
      return res.status(400).json({ message: 'Omborda buncha mahsulot yo‘q' })
    }

    await client.query(
      'INSERT INTO sales (product_id, customer_name, sold_date, quantity_sold) VALUES ($1, $2, $3, $4)',
      [product_id, customer_name.trim(), sold_date, quantity_sold],
    )

    await client.query('UPDATE products SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      qtyToSell,
      product_id,
    ])

    await client.query('COMMIT')
    res.status(201).json({ message: 'Sotuv saqlandi' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('CREATE SALE ERROR:', error)
    res.status(500).json({ message: 'Sotuvni saqlashda xatolik' })
  } finally {
    client.release()
  }
}

import express from 'express'
import { Router } from 'express'
import { db } from '../index.js'
import { checkToken } from '../middleware/checkToken.js'

export const ingredientsRouter = Router()

ingredientsRouter.use(express.json(), checkToken)

// GET ingredients
ingredientsRouter.get('/', async (req, res) => {
  try {
    const ingredients = await db.all('SELECT * FROM ingredients')
    res.json(ingredients)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

ingredientsRouter.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const ingredient = await db.get('SELECT * FROM ingredients WHERE id = ?', [id])
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' })
    }
    res.json(ingredient)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST new ingredient
ingredientsRouter.post('/', async (req, res) => {
  const { nom } = req.body
  
  if (!nom) {
    return res.status(400).json({ error: 'Missing nom field' })
  }
  
  try {
    const result = await db.run(`
      INSERT INTO ingredients (nom)
      VALUES (?)
    `, [nom])
    res.status(201).json({
      id: result.lastID,
      nom
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT update an ingredient by ID
ingredientsRouter.put('/:id', async (req, res) => {
  const { id } = req.params
  const { nom } = req.body
  
  if (!nom) {
    return res.status(400).json({ error: 'Missing nom field' })
  }
  
  try {
    const result = await db.run(`
      UPDATE ingredients
      SET nom = ?
      WHERE id = ?
    `, [nom, id])
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ingredient not found' })
    }
    
    res.json({
      id,
      nom
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE an ingredient by ID
ingredientsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.run('DELETE FROM ingredients WHERE id = ?', [id])
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ingredient not found' })
    }
    
    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

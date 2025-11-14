import express from 'express'
import { Router } from 'express'
import { db } from '../index.js'
import { checkToken } from '../middleware/checkToken.js'

export const recipesRouter = Router()

recipesRouter.use(express.json(), checkToken)

// GET all recipes
recipesRouter.get('/', async (req, res) => {
  try {
    const recipes = await db.all('SELECT * FROM recipes')
    res.json(recipes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET recipe by ID
recipesRouter.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [id])
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }
    res.json(recipe)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})


// POST new recipe
recipesRouter.post('/', async (req, res) => {
  const { titre, temps_de_preparation, difficulte, budget, description } = req.body
  
  if (!titre || !temps_de_preparation || !difficulte || !budget) {
    return res.status(400).json({ error: 'Missing required fields: titre, temps_de_preparation, difficulte, budget' })
  }
  
  try {
    const result = await db.run(`
      INSERT INTO recipes (titre, temps_de_preparation, difficulte, budget, description)
      VALUES (?, ?, ?, ?, ?)
    `, [titre, temps_de_preparation, difficulte, budget, description])
    res.status(201).json({
      id: result.lastID,
      titre,
      temps_de_preparation,
      difficulte,
      budget,
      description
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})


// PUT update a recipe by ID
recipesRouter.put('/:id', async (req, res) => {
  const { id } = req.params
  const { titre, temps_de_preparation, difficulte, budget, description } = req.body
  
  if (!titre || !temps_de_preparation || !difficulte || !budget) {
    return res.status(400).json({ error: 'Missing required fields: titre, temps_de_preparation, difficulte, budget' })
  }
  
  try {
    const result = await db.run(`
      UPDATE recipes
      SET titre = ?, temps_de_preparation = ?, difficulte = ?, budget = ?, description = ?
      WHERE id = ?
    `, [titre, temps_de_preparation, difficulte, budget, description, id])
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' })
    }
    
    res.json({
      id,
      titre,
      temps_de_preparation,
      difficulte,
      budget,
      description
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE a recipe by ID
recipesRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.run('DELETE FROM recipes WHERE id = ?', [id])
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' })
    }
    
    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

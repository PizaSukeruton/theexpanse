import express from 'express'
import cors from 'cors'
import importQuestionsHandler from './import-questions.js'

const app = express()
app.use(cors({
  origin: 'http://localhost:8500',
  credentials: true
}))
app.use(express.json())
app.post('/api/import-questions', importQuestionsHandler)
app.listen(8500)
app.listen(8500, () => {
  console.log('Import server is running on http://localhost:8500')
})

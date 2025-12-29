import cors from 'cors'
import express from 'express'

const app = express()
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.listen(5000)

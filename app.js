const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 3000;
const dotenv = require('dotenv');
dotenv.config();
app.use(express.json());


mongoose.connect('mongodb://localhost:27017/Todos')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

app.use('/todos', require('./Routes/TodosRouter'));
app.use('/users', require('./Routes/UserRoutes'));

const errorHandler = (err, req, res, next) => {
    if (res.headerSent) {
        return next(err);
    }
    res.status(500).json({ error: err.message });
}
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
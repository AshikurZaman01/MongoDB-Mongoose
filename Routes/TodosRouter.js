const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const todosSchema = require('../Schemas/TodosSchemas');
const userSchema = require('../Schemas/UserSchema');
const Todo = mongoose.model('Todo', todosSchema);
const User = mongoose.model('User', userSchema);
const checkLogin = require('../middleWears/checkLogin');

// Fetch inactive todos (assuming `inActive` is a custom instance method)
router.get('/inactive', async (req, res) => {
    try {
        const data = await Todo.inActive(); // Call the instance method
        res.status(200).json({ message: 'Inactive todos fetched successfully', data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inactive todos', error: error.message });
    }
});

// Fetch active todos (assuming `findsActive` is a custom static method)
router.get('/active', async (req, res) => {
    try {
        const data = await Todo.findsActive(); // Call the static method
        res.status(200).json({ message: 'Active todos fetched successfully', data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active todos', error: error.message });
    }
});

// Get all todos
router.get('/', checkLogin, async (req, res) => {
    try {
        const todos = await Todo.find().populate('user');
        res.status(200).json({ message: 'Todos fetched successfully', todos });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching todos', error: error.message });
    }
});

// Create a single todo
router.post('/', checkLogin, async (req, res) => {
    try {
        const newTodo = new Todo({
            ...req.body,
            user: req.userId
        });

        const todo = await newTodo.save();
        await User.updateOne(
            { _id: req.userId },
            { $push: { todos: todo._id } }
        )

        res.status(201).json({ message: 'Todo created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating todo', error: error.message });
    }
});

// Create multiple todos
router.post('/multiple', async (req, res) => {
    try {
        await Todo.insertMany(req.body);
        res.status(201).json({ message: 'Todos created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating todos', error: error.message });
    }
});

// Update a single todo
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedTodo = await Todo.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.status(200).json({ message: 'Todo updated successfully', updatedTodo });
    } catch (error) {
        res.status(500).json({ message: 'Error updating todo', error: error.message });
    }
});

// Delete a single todo
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting todo', error: error.message });
    }
});

// Search todos by title or status
router.get('/search', async (req, res) => {
    try {
        const { title, status } = req.query;

        let query = {};
        if (title) {
            query.title = new RegExp(title, 'i');
        }
        if (status) {
            query.status = new RegExp(status, 'i');
        }

        const todos = await Todo.find(query);
        res.status(200).json({ message: 'Search results', todos });
    } catch (error) {
        res.status(500).json({ message: 'Error searching todos', error: error.message });
    }
});

module.exports = router;

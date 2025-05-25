const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Task model
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date // This allows storing the due date
  }
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);
// Routes
app.post('/tasks', async (req, res) => {
  try {
    const { title, dueDate } = req.body;

    const task = new Task({
      title,
      dueDate: dueDate ? new Date(dueDate) : undefined  // Safely parse the date
    });

    await task.save();
    console.log('Task created:', task);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});


app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    console.log('Tasks fetched:', tasks);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    console.log('Deleting task with ID:', id);
    const result = await Task.deleteOne({ _id: id });
    console.log('Delete result:', result);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // For 204 responses, we don't send any content
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  
  // Start server
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Catch-all route for non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

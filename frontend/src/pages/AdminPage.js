import React, { useEffect, useState } from 'react';
import mockDb from '../services/mockDb';

const emptyForm = {
  text: '',
  options: ['', '', '', ''],
  correctAnswerIndex: 0,
  category: '',
  explanation: ''
};

export default function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    setLoading(true);
    const snap = await mockDb.collection('questions').get();
    setQuestions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleOptionChange = (idx, value) => {
    setForm(f => {
      const options = [...f.options];
      options[idx] = value;
      return { ...f, options };
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await mockDb.collection('questions').doc(editingId).update(form);
    } else {
      await mockDb.collection('questions').add(form);
    }
    setForm(emptyForm);
    setEditingId(null);
    fetchQuestions();
  };
  const handleEdit = (q) => {
    setForm(q);
    setEditingId(q.id);
  };
  const handleDelete = async (id) => {
    await mockDb.collection('questions').doc(id).delete();
    fetchQuestions();
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <form onSubmit={handleSubmit}>
        <input name="text" value={form.text} onChange={handleChange} placeholder="Question text" required />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" required />
        <input name="explanation" value={form.explanation} onChange={handleChange} placeholder="Explanation" required />
        {form.options.map((opt, idx) => (
          <div key={idx}>
            <input
              value={opt}
              onChange={e => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              required
            />
            <input
              type="radio"
              name="correctAnswerIndex"
              checked={form.correctAnswerIndex === idx}
              onChange={() => setForm(f => ({ ...f, correctAnswerIndex: idx }))}
            /> Correct
          </div>
        ))}
        <button type="submit">{editingId ? 'Update' : 'Add'} Question</button>
        {editingId && <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }}>Cancel</button>}
      </form>
      <hr />
      <h3>Questions</h3>
      {loading ? <p>Loading...</p> : (
        <table border="1">
          <thead>
            <tr>
              <th>Text</th>
              <th>Category</th>
              <th>Options</th>
              <th>Correct</th>
              <th>Explanation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.id}>
                <td>{q.text}</td>
                <td>{q.category}</td>
                <td>{q.options.join(', ')}</td>
                <td>{q.options[q.correctAnswerIndex]}</td>
                <td>{q.explanation}</td>
                <td>
                  <button onClick={() => handleEdit(q)}>Edit</button>
                  <button onClick={() => handleDelete(q.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    pets: [],
    users: [],
    donations: [],
    adoptions: [],
    donationCampaigns: []
  });
  const [activeTab, setActiveTab] = useState('pets');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form states for adding/editing
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    age: '',
    gender: '',
    description: '',
    image: '',
    category: '',
    price: ''
  });

  // Add new state for modal and editing item
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5007/admin/dashboard', {
        withCredentials: true
      });
      setDashboardData(response.data);
      setError('');
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin/login');
      } else {
        setError('Error fetching data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`http://localhost:5007/admin/${type}/${id}`, {
        withCredentials: true
      });
      fetchDashboardData();
    } catch (error) {
      setError('Error deleting item. Please try again.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5007/admin/pets/${editingItem._id}`, editingItem, {
        withCredentials: true
      });
      setShowModal(false);
      setEditingItem(null);
      fetchDashboardData();
    } catch (error) {
      setError('Error updating pet. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`http://localhost:5007/admin/${activeTab}/${editingItem._id}`, formData, {
          withCredentials: true
        });
      } else {
        await axios.post(`http://localhost:5007/admin/${activeTab}`, formData, {
          withCredentials: true
        });
      }
      setShowAddForm(false);
      setEditingItem(null);
      setFormData({
        name: '',
        type: '',
        age: '',
        gender: '',
        description: '',
        image: '',
        category: '',
        price: ''
      });
      fetchDashboardData();
    } catch (error) {
      setError('Error saving item. Please try again.');
    }
  };

  const renderForm = () => {
    if (!showAddForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleSubmit}>
            {activeTab === 'pets' && (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
              </>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {editingItem ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!showModal || !editingItem) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">Edit Pet</h2>
          <form onSubmit={handleUpdate}>
            <input
              type="text"
              placeholder="Name"
              value={editingItem.name}
              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="text"
              placeholder="Type"
              value={editingItem.type}
              onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="number"
              placeholder="Age"
              value={editingItem.age}
              onChange={(e) => setEditingItem({...editingItem, age: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="text"
              placeholder="Gender"
              value={editingItem.gender}
              onChange={(e) => setEditingItem({...editingItem, gender: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <textarea
              placeholder="Description"
              value={editingItem.description}
              onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="text"
              placeholder="Image URL"
              value={editingItem.image}
              onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={editingItem.category}
              onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={editingItem.price}
              onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTable = (data, type) => {
    if (!data || data.length === 0) {
      return <p className="text-center text-gray-500">No {type} found</p>;
    }

    const columns = {
      pets: ['Name', 'Type', 'Age', 'Category', 'Status', 'Actions'],
      users: ['Name', 'Email', 'Role', 'Actions'],
      donations: ['Campaign', 'Amount', 'Donor', 'Date', 'Actions'],
      adoptions: ['Pet', 'Adopter', 'Status', 'Date', 'Actions'],
      donationCampaigns: ['Name', 'Max Limit', 'Current Amount', 'Status', 'Created By', 'Actions']
    };

    const renderRow = (item) => {
      switch (type) {
        case 'pets':
          return (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.age}</td>
              <td>{item.category}</td>
              <td>{item.adopted ? 'Adopted' : 'Available'}</td>
              <td>
                <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                <button onClick={() => handleDelete(type, item._id)} className="text-red-500 hover:text-red-700">Delete</button>
              </td>
            </tr>
          );
        case 'users':
          return (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>{item.role}</td>
              <td>
                <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                <button onClick={() => handleDelete(type, item._id)} className="text-red-500 hover:text-red-700">Delete</button>
              </td>
            </tr>
          );
        case 'donationCampaigns':
          return (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>${item.max_donation_limit}</td>
              <td>${item.current_amount || 0}</td>
              <td>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  item.pause ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {item.pause ? 'Paused' : 'Active'}
                </span>
              </td>
              <td>{item.userEmail}</td>
              <td>
                <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                <button onClick={() => handleDelete(type, item._id)} className="text-red-500 hover:text-red-700">Delete</button>
              </td>
            </tr>
          );
        // Add other cases as needed
        default:
          return null;
      }
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {columns[type].map((column, index) => (
                <th key={index} className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map(renderRow)}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New {activeTab.slice(0, -1)}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('pets')}
              className={`px-4 py-2 rounded ${
                activeTab === 'pets' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Pets
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded ${
                activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('donationCampaigns')}
              className={`px-4 py-2 rounded ${
                activeTab === 'donationCampaigns' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Donation Campaigns
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-4 py-2 rounded ${
                activeTab === 'donations' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Donations
            </button>
            <button
              onClick={() => setActiveTab('adoptions')}
              className={`px-4 py-2 rounded ${
                activeTab === 'adoptions' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Adoptions
            </button>
          </div>

          <div className="mt-4">
            {activeTab === 'pets' && renderTable(dashboardData.pets, 'pets')}
            {activeTab === 'users' && renderTable(dashboardData.users, 'users')}
            {activeTab === 'donations' && renderTable(dashboardData.donations, 'donations')}
            {activeTab === 'adoptions' && renderTable(dashboardData.adoptions, 'adoptions')}
            {activeTab === 'donationCampaigns' && renderTable(dashboardData.donationCampaigns, 'donationCampaigns')}
          </div>
        </div>
      </div>
      {renderForm()}
      {renderEditModal()}
    </div>
  );
};

export default AdminDashboard; 
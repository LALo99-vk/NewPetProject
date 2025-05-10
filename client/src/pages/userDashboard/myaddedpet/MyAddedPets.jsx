import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../components/providers/AuthProvider';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';
import './MyAddedPets.css'; // You can create a CSS file for styling pagination

const MyAddedPets = () => {
  const { user } = useContext(AuthContext);
  const [filteredPets, setFilteredPets] = useState([]);
  const [pets, setPets] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const petsPerPage = 10;
  const pagesVisited = currentPage * petsPerPage;

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch('http://localhost:5007/pets');
        const data = await response.json();
        console.log('All pets:', data);
        
        // Filter pets for current user
        const userPets = data.filter(pet => pet.userEmail === user?.email);
        console.log('User pets:', userPets);
        
        setPets(data);
        setFilteredPets(userPets);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pets:', error);
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchPets();
    }
  }, [user]);

  const deletePet = (_id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:5007/pets/${_id}`, {
          method: 'DELETE',
        })
          .then(response => response.json())
          .then(data => {
            console.log('Pet deleted successfully:', data);
            // Update both pets and filteredPets
            setPets(prevPets => prevPets.filter(pet => pet._id !== _id));
            setFilteredPets(prevPets => prevPets.filter(pet => pet._id !== _id));
            Swal.fire('Deleted!', 'Your pet has been deleted.', 'success');
          })
          .catch(error => {
            console.error('Error deleting pet:', error);
            Swal.fire('Error!', 'Failed to delete pet.', 'error');
          });
      }
    });
  };

  const adoptPet = (_id) => {
    const pet = pets.find((pet) => pet._id === _id);

    if (pet && !pet.adopted) {
      fetch(`http://localhost:5007/pets/${_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adopted: true }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Pet adopted successfully:', data);
          // Update both pets and filteredPets
          setPets(prevPets =>
            prevPets.map(pet =>
              pet._id === _id ? { ...pet, adopted: true } : pet
            )
          );
          setFilteredPets(prevPets =>
            prevPets.map(pet =>
              pet._id === _id ? { ...pet, adopted: true } : pet
            )
          );
          Swal.fire('Success!', 'Pet has been marked as adopted.', 'success');
        })
        .catch(error => {
          console.error('Error adopting pet:', error);
          Swal.fire('Error!', 'Failed to update adoption status.', 'error');
        });
    }
  };

  const pageCount = Math.ceil(filteredPets.length / petsPerPage);

  const changePage = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex justify-center items-center">
        <div className="rounded-md h-12 w-12 border-4 border-t-4 border-pink-600 animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center m-10">
        <p>Please log in to view your added pets.</p>
      </div>
    );
  }

  if (filteredPets.length === 0) {
    return (
      <div className="text-center m-10">
        <h2 className="text-2xl font-bold mb-4">You haven't added any pets yet</h2>
        <p className="mb-4">Start by adding your first pet!</p>
        <Link to="/addpet" className="btn btn-primary">
          Add a Pet
        </Link>
      </div>
    );
  }

  const displayPets = filteredPets
    .slice(pagesVisited, pagesVisited + petsPerPage)
    .map((pet, index) => (
      <tr key={pet._id}>
        <td>{index + 1}</td>
        <td>
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="mask mask-squircle w-12 h-12">
                <img src={pet.image} alt={pet.name} />
              </div>
            </div>
          </div>
        </td>
        <td>{pet.name}</td>
        <td>{pet.category}</td>
        <td>
          <span className={`px-2 py-1 rounded-full text-sm ${
            pet.adopted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {pet.adopted ? 'Adopted' : 'Available'}
          </span>
        </td>
        <td>
          <Link to={`../updatepet/${pet._id}`}>
            <button className="btn btn-warning btn-xs mr-2 text-white">
              Update
            </button>
          </Link>
          <button
            className="btn btn-error btn-xs mr-2"
            onClick={() => deletePet(pet._id)}
          >
            Delete
          </button>
          {!pet.adopted && (
            <button
              className="btn btn-primary btn-xs"
              onClick={() => adoptPet(pet._id)}
            >
              Adopt
            </button>
          )}
        </td>
      </tr>
    ));

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row justify-between border-b pb-8 mb-8">
        <h1 className="font-semibold text-2xl">My Added Pets</h1>
        <h2 className="font-semibold text-2xl">
          {filteredPets.length} Added Pets
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Index</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{displayPets}</tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <ReactPaginate
          previousLabel={'Previous'}
          nextLabel={'Next'}
          pageCount={pageCount}
          onPageChange={changePage}
          containerClassName={'pagination flex justify-center mt-4'}
          previousLinkClassName={'pagination__link'}
          nextLinkClassName={'pagination__link'}
          disabledClassName={'pagination__link--disabled'}
          activeClassName={'pagination__link--active'}
        />
      )}
    </div>
  );
};

export default MyAddedPets;

import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { GlobalContext } from './utils/global_context';
import { useState, useContext, useEffect } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { MdCancel } from "react-icons/md";
import Modal from 'react-modal';

Modal.setAppElement('#root');


const ListaProductos = () => {
  
  const { productos, getProductos, deleteProducto, updateProducto, categorias, getCaracteristicas, caracteristicas, getCategorias } = useContext(GlobalContext);
  const [loaded, setLoaded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
  const [editedProducto, setEditedProducto] = useState({
    title: '',
    price: '',
    description: '',
    image: '',
    imagenes: [],
    caracteristicas: [{}],
    categoria: {}
});

useEffect(() => {
  window.scrollTo(0, 0);
}, []);

const handleCategoriaChange = (event) => {
  setSelectedCategoriaId(event.target.value);
}

const openModal = (product) => {
  setEditedProducto({
    id: product.id,
    title: product.title,
    image: product.image,
    imagenes: product.imagenes,
    price: product.price,
    description: product.description,
    caracteristicas: product.caracteristicas,
    categoria: product.categoria
  });
  setModalIsOpen(true);
};

const closeModal = () => {
  setModalIsOpen(false);
};


const handleCaracteristicaChange = (caracteristicaId) => {
  const isSelected = editedProducto.caracteristicas.some((caract) => caract.id === caracteristicaId);

  if (isSelected) {
    // Eliminar característica si ya está seleccionada
    setEditedProducto((prevProduct) => ({
      ...prevProduct,
      caracteristicas: prevProduct.caracteristicas.filter((caract) => caract.id !== caracteristicaId),
    }));
  } else {
    // Agregar característica si no está seleccionada
    const selectedCaracteristica = caracteristicas.find((caract) => caract.id === caracteristicaId);
    setEditedProducto((prevProduct) => ({
      ...prevProduct,
      caracteristicas: [...prevProduct.caracteristicas, selectedCaracteristica],
    }));
  }
};

const handleRemoveCaracteristica = (caracteristicaId) => {
  setEditedProducto((prevProduct) => ({
    ...prevProduct,
    caracteristicas: prevProduct.caracteristicas.filter((caract) => caract.id !== caracteristicaId),
  }));
};

const handleEditProduct = () => {
  const formData = new FormData();
  formData.append('title', editedProducto.title);
  formData.append('price', editedProducto.price);
  formData.append('description', editedProducto.description);
  formData.append('categoriaId', selectedCategoriaId); 
  formData.append('imagen', editedProducto.image);


  editedProducto.imagenes.forEach((imagen) => {
    formData.append('imagenes', imagen);
  });


  if (editedProducto.caracteristicas) {
    editedProducto.caracteristicas.forEach((caracteristica) => {
      formData.append('caracteristicas', caracteristica.id);
    });
  }

  updateProducto(editedProducto.id, formData);
  setModalIsOpen(false);
};

const handleChange = (e) => {
  const { name, files } = e.target;

  if (name === 'image' && files.length > 0) {
    setEditedProducto((prevProduct) => ({
      ...prevProduct,
      [name]: files[0],
    }));
  } else if (name === 'imagenes' && files.length > 0) {
    setEditedProducto((prevProduct) => ({
      ...prevProduct,
      [name]: Array.from(files),
    }));
  } else {
    const value = e.target.value;
    setEditedProducto((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  }
};

  useEffect(() => {
      if (!loaded) {
        getProductos();
        getCategorias();
        getCaracteristicas()
        setLoaded(true);
      }
    }, [getProductos, productos, getCategorias, categorias, caracteristicas, getCaracteristicas]);

    useEffect(() => {
     
      if (editedProducto.id) {
        setEditedProducto((prevProduct) => ({
          ...prevProduct,
          caracteristicas: prevProduct.caracteristicas,
        }));
      }
    }, [editedProducto.id]);

  return (
    <ProductContainer>
      <Link to='/admin'>
        <AiOutlineArrowLeft className='iconArrow'/>
      </Link>
      <h2>PRODUCTOS</h2>
      <table className='TablaDeProductos'>
        <thead>
          <tr>
            <th scope='col'>Id</th>
            <th scope='col'>Nombre</th>
            <th scope='col'>Categoria</th>
            <th scope='col'>Características</th>
            <th scope='col'>Descripción</th>
            <th scope='col'>Precio</th>
          </tr>
        </thead>
        <tbody>
            {productos.map((producto) => (
                    <tr key={producto.id} className='thUsuarios'>
                        <th>{producto.id}</th>
                        <td>{producto.title}</td>
                        <td>{producto.categoria.nombre}</td>
                        <td style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', padding: '32px 0'}}>{producto.caracteristicas.map((caract, index) => <span key={index} style={{ margin: '1px 2px', backgroundColor: '#000000', padding: '5px', borderRadius: '10px', color: 'white' }}>{caract.nombre}</span>)}</td>
                        <td>{producto.description.length > 20
                  ? `${producto.description.slice(0, 20)}...`
                  : producto.description}</td>
                        <td>${producto.price}</td>
                        <td style={{ padding: '0 0 0 5px' }}>
                            <button
                              className='BotonEditar'
                              onClick={() => openModal(producto)}
                              role='button'
                              >
                              Editar
                            </button>
                        </td>
                        <td style={{ padding: '0' }}>
                            <button
                                type="button"
                                className='BotonEliminar'
                                onClick={()=>{deleteProducto(producto.id)}}>
                                Eliminar
                            </button>
                        </td>
                        <Modal
                            style={{
                            content: {
                                top: '60%',
                                left: '50%',
                                right: 'auto',
                                bottom: 'auto',
                                borderRadius: '20px',
                                border: 'none',
                                marginRight: '-50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'black',
                                width: '1000px',
                                height: '450px',
                                textAlign: 'center',
                                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                            },
                            }}
                            isOpen={modalIsOpen}
                            onRequestClose={closeModal}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <h2 style={{ marginBottom: '30px' }}>Editar Producto</h2>
                                <form style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '35px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
                                        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <label style={{ fontWeight: 600, fontSize: '18px' }} htmlFor='title'>Nombre</label>
                                            <input
                                            style={{
                                                borderRadius: '10px',
                                                border: 'solid 0.5px #7A7A7A',
                                                height: '25px',
                                                width: '200px',
                                                padding: '5px',
                                            }}
                                            type='text'
                                            id='title'
                                            name='title'
                                            value={editedProducto.title}
                                            onChange={handleChange}
                                            />
                                        </div>
                                        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <label style={{ fontWeight: 600, fontSize: '18px' }} htmlFor='price'>Precio</label>
                                            <input
                                            style={{
                                                borderRadius: '10px',
                                                border: 'solid 0.5px #7A7A7A',
                                                height: '25px',
                                                width: '200px',
                                                padding: '5px',
                                            }}
                                            type='text'
                                            id='price'
                                            name='price'
                                            value={editedProducto.price}
                                            onChange={handleChange}
                                            />
                                        </div>
                                        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <label style={{ fontWeight: 600, fontSize: '18px' }} htmlFor='description'>Descripción</label>
                                            <input
                                            style={{
                                                borderRadius: '10px',
                                                border: 'solid 0.5px #7A7A7A',
                                                height: '25px',
                                                width: '200px',
                                                padding: '5px',
                                            }}
                                            type='text'
                                            id='description'
                                            name='description'
                                            value={editedProducto.description}
                                            onChange={handleChange}
                                            />
                                        </div>
                                        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <label style={{ fontWeight: 600, fontSize: '18px' }} htmlFor='categoria'>Categoria</label>
                                            <select style={{ padding: '6.4px', borderRadius: '10px' }}  id="categoria" name="categoria" value={selectedCategoriaId} onChange={handleCategoriaChange} required>
                                              <option value="" disabled>{editedProducto.categoria.nombre}</option>
                                              {categorias.map(categoria => (
                                                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                                              ))}
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px' }}>
                                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '80px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
                                              <label style={{ fontWeight: 600 , fontSize: '18px'}} htmlFor='image'>Imagen de portada</label>
                                              <input
                                              style={{
                                                  borderRadius: '10px',
                                                  backgroundColor: '#3F51B5',
                                                  width: '200px',
                                                  color: 'white',
                                                  fontFamily: 'Poppins',
                                                  padding: '5px 30px',
                                                  fontSize: '.8rem'
                                              }}
                                              type='file'
                                              id='image'
                                              name='image'
                                              onChange={handleChange}
                                              />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label style={{ fontWeight: 600, fontSize: '18px' }} htmlFor='imagenes'>Imagenes</label>
                                                <input
                                                style={{
                                                  borderRadius: '10px',
                                                  backgroundColor: '#3F51B5',
                                                  width: '200px',
                                                  color: 'white',
                                                  fontFamily: 'Poppins',
                                                  padding: '5px 30px',
                                                  fontSize: '.8rem'
                                                }}
                                                multiple
                                                type='file'
                                                id='imagenes'
                                                name='imagenes'
                                                onChange={handleChange}
                                                />
                                            </div>
                                          </div>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px'}}>
                                            <label style={{ fontWeight: 600, fontSize: '18px'}}>Características</label>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                              {caracteristicas.map((caract) => (
                                                <div key={caract.id}>
                                                  <input
                                                    type="checkbox"
                                                    id={`caracteristicas-${caract.id}`}
                                                    name={`caracteristicas-${caract.id}`}
                                                    checked={editedProducto.caracteristicas.some((selectedCaract) => selectedCaract.id === caract.id)}
                                                    onChange={() => handleCaracteristicaChange(caract.id)}
                                                  />
                                                  <label htmlFor={`caracteristicas-${caract.id}`}>{caract.nombre}</label>
                                                </div>
                                              ))}
                                            </div>
                                        </div>
                                        
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button style={{ width: '150px', padding: '10px', backgroundColor: '#d33', border: 'none', color: 'white', fontWeight: 600, borderRadius: '5px', cursor: 'pointer',  transition: 'background-color 0.3s' }} 
                                        onMouseOver={(e) => (e.target.style.backgroundColor = '#bc1d1d')}
                                        onMouseOut={(e) => (e.target.style.backgroundColor = '#d33')}
                                        onClick={closeModal}>
                                            Cancelar
                                        </button>
                                        <button type="submit" style={{ width: '150px', padding: '10px', backgroundColor: '#3085d6', border: 'none', color: 'white', fontWeight: 600, borderRadius: '5px', cursor: 'pointer',  transition: 'background-color 0.3s' }} 
                                        onMouseOver={(e) => (e.target.style.backgroundColor = '#216ab0')}
                                        onMouseOut={(e) => (e.target.style.backgroundColor = '#3085d6')}
                                        onClick={handleEditProduct}>
                                            Guardar cambios
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                    </tr>
                )
            )}
        </tbody>
      </table>
      <Link to='/admin/newProduct'
              className='BotonAdmin'
              role="button"> Nuevo producto
      </Link>
    </ProductContainer>
  )
}

export default ListaProductos;

const ProductContainer = styled.div`   
  background-color: white;
  border-radius: 20px;
  color: black;
  margin: 10rem 2rem 1rem 2rem;
  padding: 2rem;
  .iconArrow{
      margin-right: 2rem;
      font-size: 2rem;
      color: black;
      cursor: pointer;
    }
    h2{
    font-size: 40px;
    text-align: center;
  }
  table thead tr th{
    padding: 0;
  }
  table, th, td {
    text-align: center;
    border-bottom: solid .1px #e7e7e7;
    padding: 2rem 15px;
    margin: auto;
    height: 100px;
  }
  .BotonAdmin{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    margin: auto;
    margin-top: 50px;
    margin-bottom: 50px;
    border: solid .1px gray;
    border-radius: 10px;
    padding: 1rem;
    background-color: black;
    color: white;
  }

.BotonEditar{
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #32CD32;
  padding: .5rem;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  text-decoration: none;
  cursor: pointer;
  border: none;
}
.BotonEliminar{
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FF5733;
  padding: .5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  margin-left: 1rem;
  color: white;
  cursor: pointer;
}
.BotonEditar:hover, .BotonEliminar:hover {
  transform: scale(1.05); 
  transition: transform 0.3s ease;
}
`


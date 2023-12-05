import React, { useEffect, useContext, useState } from 'react';
import styled from 'styled-components';
import { GlobalContext } from '../components/utils/global_context';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FaRegHeart, FaHeart, FaFacebookSquare, FaInstagram, FaWhatsapp, FaShareAlt, FaTwitterSquare } from "react-icons/fa";
import { Link } from 'react-router-dom';

const CardsPorCategoria = ({ productosPorCategoria, nombre }) => {
  const { agregarProductoFavorito, eliminarProductoFavorito, token, productosFavoritos } = useContext(GlobalContext);
  const [ratings, setRatings] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showShareButtons, setShowShareButtons] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    window.scroll(0, 0)
    productosPorCategoria.forEach(product => {
        obtenerValoraciones(product.id);
    });
  }, [productosPorCategoria]);

  const obtenerValoraciones = (productId) => {
    fetch(`http://ec2-54-198-119-206.compute-1.amazonaws.com:8080/valoraciones/producto/${productId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const ratingsCopy = { ...ratings };
          const average = calcularPromedio(data);
          ratingsCopy[productId] = average;
          setRatings(ratingsCopy);
        }
      })
      .catch((error) => {
        console.error('Error al obtener las valoraciones', error);
      });
  };

  const calcularPromedio = (ratings) => {
    const sum = ratings.reduce((accumulator, currentValue) => accumulator + currentValue.rating, 0);
    return sum / ratings.length;
  };

  const renderStars = (averageRating) => {
    const starIcons = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.round(averageRating)) {
        starIcons.push(<AiFillStar key={i} className='star' />);
      } else {
        starIcons.push(<AiOutlineStar key={i} className='star' />);
      }
    }
    return (
      <div className='stars'>
        {starIcons}
      </div>
    );
  };

  const estaEnFavoritos = (productId) => {
    return productosFavoritos.some(producto => producto.id === productId);
  };

  const handleEliminarFavorito = (idProducto) => {
    eliminarProductoFavorito(idProducto);
  };

  const handleAgregarFavorito = (producto) => {
    agregarProductoFavorito(producto);
  };

  const openShareButtons = (product) => {
    setSelectedProduct(product);
    setShowShareButtons(true);
    setCustomMessage('');
  };

  const closeShareButtons = () => {
    setSelectedProduct(null);
    setShowShareButtons(false);
    setCustomMessage('');
  };

  const shareOnInstagram = (productId) => {
    const productUrl = encodeURIComponent(`http://sonidos-reservados-front.s3-website-us-east-1.amazonaws.com/details/${productId}`);
    const instagramUrl = `https://www.instagram.com/share?url=${productUrl}`;
    window.open(instagramUrl, '_blank');
  };

  const shareOnFacebook = (productId) => {
    const encodedMessage = encodeURIComponent(customMessage || ''); // Encodificar el mensaje personalizado
    const productUrl = encodeURIComponent(`http://sonidos-reservados-front.s3-website-us-east-1.amazonaws.com/details/${productId}`); // Agregar el ID del producto si es necesario
    const facebookUrl = `https://www.facebook.com/sharer.php?u=${productUrl}&quote=${encodedMessage}`;
    window.open(facebookUrl, '_blank');
  };
  
  const shareOnWhatsApp = (productId, customMessage) => {
    const productPageUrl = `http://sonidos-reservados-front.s3-website-us-east-1.amazonaws.com/details/${productId}`;
    const additionalText = customMessage ? encodeURIComponent(customMessage) : '';
    const whatsappUrl = `https://wa.me/?text=${additionalText}%20${productPageUrl}`;
    window.open(whatsappUrl, '_blank');
};


  const shareOnTwitter = (productId) => {
    const productUrl = encodeURIComponent(`http://sonidos-reservados-front.s3-website-us-east-1.amazonaws.com/details/${productId}`);
    const twitterUrl = `https://twitter.com/intent/tweet?url=${productUrl}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <Recomendaciones>
      <div className='Productos'>
      <h2>PRODUCTOS DE <span style={{ color: '#3F51B5', fontStyle: 'italic' }}>{nombre}</span></h2>
        <div className='container-items'>
          {productosPorCategoria.map(product => (
            <div className='item' key={product.id}>
              <div className='info-product'>
                <Link className='link' to={`/details/${product.id}`} key={product.id}>
                  <figure>
                    <img src={product.image} alt={product.title} className='cardImage' />
                  </figure>
                  <h3>{product.title}</h3>
                </Link>
              </div>
              {ratings[product.id] && renderStars(ratings[product.id])}
              {token && (
                <>
                  {estaEnFavoritos(product.id) ? (
                    <FaHeart className='heartIconFilled' onClick={() => handleEliminarFavorito(product.id)} />
                  ) : (
                    <FaRegHeart className='heartIconFilled' onClick={() => handleAgregarFavorito(product)} />
                  )}
                </>
              )}
              {/* Botón de compartir */}
              <ShareButtonContainer>
                <FaShareAlt className='iconShare' onClick={() => openShareButtons(product)} />
              </ShareButtonContainer>
              {/* Ventana de compartir */}
              {showShareButtons && selectedProduct === product && (
                <div className='shareButtons'>
                  <img src={product.image} alt={product.title} className='productImage' />
                  <h4 className='productTitle'>{product.title}</h4>
                  <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Escribe tu mensaje personalizado" rows={4} cols={50} />
                  {/* Botones para compartir */}
                  <div className='divIcons'>
                      <FaFacebookSquare className='icons' onClick={() => shareOnFacebook(product.id)} />
                      <FaInstagram className='icons'  onClick={() => shareOnInstagram(product.id)} />
                      <FaWhatsapp className='icons'  onClick={() => shareOnWhatsApp(product.id, customMessage)} />
                      <FaTwitterSquare className='icons' onClick={() => shareOnTwitter(product.id)} />
                  </div>
                  <button className='closeButton' onClick={closeShareButtons}>Cerrar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Recomendaciones>
  );
};

export default CardsPorCategoria;

const Recomendaciones = styled.div`
    margin: 2rem;
    margin-top: 12rem;
    padding: 1rem;
    background-color: white;
    border-radius:  20px;
    display: block;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
    h2{
      color: black;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      letter-spacing: 3px;
      margin: 1.5rem;
      padding:1rem;
      border-bottom: solid gray 1px;
      @media(min-width: 1000px){
        font-size:2.2rem;
      }
      @media(max-width: 1000px){
        font-size:2.2rem;
        text-align: center;  
      }
    }
    .link {
      color: #000000;
      border-bottom: 1px solid transparent; 
      text-decoration: none;
    }
    .stars {
      position: absolute;
      top: 45px;
      left: 40px;
      color: #3F51B5;
      font-size: 20px;
    }
    .heartIconFilled{
      position: absolute;
      top: 40px;
      right: 40px;
      color: #3F51B5;
      font-size: 40px;
      cursor: pointer;
    }
    .container-items{
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    .item{
        position: relative;
        padding-top: 4.5rem;
        border-radius: 20px;
        justify-content: center;
        align-items: center;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.2);
        flex: 0 0 calc(50% - 50px);
        text-align: center;
        height: 400px;
        width: 300px;
        @media(min-width: 1000px){
          width: 40vw; 
          margin:1rem;
        }
        @media(max-width: 1000px){
          width: 70vw;
          margin:auto;
        }
    }
    h3{
        margin: 2rem;
        padding: 1rem;
        color:black;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        letter-spacing: 1px;
        @media(min-width: 1000px){
          font-size:1.5rem;
        }
        @media(max-width: 1000px){
          font-size:1.3rem;
        }
    }

    .cardImage{
      height: 200px;
      width: 200px;
      object-fit: cover;
      @media(min-width: 1000px){
        
        }
      @media(max-width: 1000px){
        width: 50vw;  
        }
    }

    .linkProducts{
      text-decoration: none;
    }
    .productTitle{
      color: #ffffff;
    }
    .divIcons{
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }
    .icons{
      font-size: 30px;
      cursor: pointer;
    }
    .titleProducts{
      text-align: center;
      border-radius: 20px;
      color: white;
      background-color: black;
      transition: background-color 300ms ease-in-out;
      padding: 20px;
    }

    .titleProducts:hover{
      background-color: #000000ec;
    }
    .shareButtons{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px; /* Ancho de la ventana */
    height: 400px; /* Alto de la ventana */
    padding: 20px;
    background-color: #3f51b5; /* Fondo blanco con transparencia */
    border-radius: 10px;
    box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
    } 
    .closeButton{
      padding: 10px 20px;
      width: 200px;
      border: none;
      border-radius: 5px;
      background-color: #ffffff;
      color: #3f51b5;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease-in-out;
    }
    .IconRedes{
    width: 30px;
    height: 30px;
    cursor: pointer;
    }
    .productImage{
    width: 100px;
    height: 100px;
    object-fit: cover;
    }
    `
    
const ShareButtonContainer = styled.div`
    position: absolute;
    top: 45px;
    right: 95px;
    .iconShare {
      cursor: pointer;
      color: #3F51B5;
      font-size: 30px;
  }
`
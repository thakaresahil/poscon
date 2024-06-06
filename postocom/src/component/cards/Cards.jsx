import React from 'react';
import PropTypes from 'prop-types';

function Cards(props) {
  const discountedPrice = (props.orgprice * 0.67).toFixed(2);
  const truncatedName =
    props.name.length > 50 ? props.name.substring(0, 48) + "..." : props.name;

  const handleView = () => {
    props.onViewDetails(
      props.id,
      props.img,
      props.name,
      props.orgprice,
      props.colour,
      props.brand,
      props.ratingcount,
      props.avgrating,
      props.description
    );
  };

  return (
    <div
      className="w-64 h-96 flex flex-col justify-items-center items-center gap-2 bg-gray-50 p-6 pt-0 transform transition-transform duration-300 hover:scale-105"
      onClick={handleView}
    >
      <img className="w-52" src={props.img} alt="Productimg" />
      <p className="w-full text-center">{truncatedName}</p>
      <p>
        At <span className="text-red-500">₹{discountedPrice}</span>{' '}
        <span className="text-gray-300 line-through">₹{props.orgprice}</span>
      </p>
    </div>
  );
}

Cards.propTypes = {
  id: PropTypes.number.isRequired,
  img: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  orgprice: PropTypes.number.isRequired,
  colour: PropTypes.string,
  brand: PropTypes.string,
  ratingcount: PropTypes.number,
  avgrating: PropTypes.number,
  description: PropTypes.string,
  onViewDetails: PropTypes.func.isRequired,
};

export default Cards;
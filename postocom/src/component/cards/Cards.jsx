import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function Cards(props) {
 
  const truncatedName =
    props.name.length > 50 ? props.name.substring(0, 48) + "..." : props.name;

    const discPercents = Math.floor(((props.orgprice - props.sellprice) / props.orgprice) * 100);

  return (
    <Link
      to={`/product/${props.id}`}
      className="w-64 h-96 flex flex-col justify-items-center items-center gap-2 bg-gray-50 p-6 pt-0 transform transition-transform duration-300 hover:scale-105"
    >
      <img className="w-52" src={props.img} alt={props.name} />
      <p className="w-full text-center">{truncatedName}</p>
      <p>
         <span className="font-semibold ">At ₹{props.sellprice}</span>{' '}
        <span className="text-gray-300 line-through font-thin text-sm">₹{props.orgprice}</span>
        <span className="text-red-400 ">({discPercents}% OFF)</span>
      </p>
    </Link>
  );
}

Cards.propTypes = {
  id: PropTypes.number.isRequired,
  img: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  orgprice: PropTypes.number.isRequired,
  sellprice: PropTypes.number.isRequired,
};

export default Cards;

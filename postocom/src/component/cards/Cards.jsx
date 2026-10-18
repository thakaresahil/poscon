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
      className="group card flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[4/5] overflow-hidden bg-gray-50">
        <img
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={props.img}
          alt={props.name}
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sm text-gray-800 group-hover:text-red-600 sm:text-base">{truncatedName}</p>
        <p className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <span className="price">At ₹{props.sellprice}</span>
          <span className="price-old">₹{props.orgprice}</span>
          {discPercents > 0 && <span className="discount">({discPercents}% OFF)</span>}
        </p>
      </div>
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


# Poscon

 This project is a full-featured E-Commerce Website designed to provide a seamless online shopping experience. It includes a PostgreSQL database schema for storing user and product information, and a full-stack application to manage user interactions, product listings, and secure transactions. The project ensures the security of sensitive data by implementing password hashing and unique constraints on key fields like email and mobile number.

## More about CRUD

* CRUD refers to the four functions that are considered necessary to implement a persistent storage application: create, read, update and delete.
* CRUD acronym identifies all of the major functions that are inherent to databases.
## Technology Used

**Client:** React, TailwindCSS

**Server:** Node, Express

**Database:** ProstgreSQL

## Getting Started

Prerequisites Node.js and npm installed PostgreSQL installed and running Installation

To clone this repository

```bash
  git clone https://github.com/thakaresahil/poscon.git
```

```bash
  cd poscon
```

## Install dependencies

```bash
  npm install
```
## License

License This project is licensed under the MIT License.


## Endpoints

### Front-End

| HTTP Methode | URL     | Description                |
| :-------- | :------- | :------------------------- |
| `get` | `http://localhost:3000/` | Home Page |
| `get` | `http://localhost:3000/browseproduct` | Browse Products |
| `get` | `http://localhost:3000/profile` | Profile |
| `get` | `http://localhost:3000/about` | About |
| `get` | `http://localhost:3000/cart` | Cart |
| `get` | `http://localhost:3000/contact` | contact |

### Back-End Server

| HTTP Methode | URL     | Description                |
| :-------- | :------- | :------------------------- |
| `get` | `http://localhost:9000/data` | get product data |
| `get` | `http://localhost:9000/home/bestseller` | get the bestseller |
| `get` | `http://localhost:9000/browseproducts/women` | women products |
| `get` | `http://localhost:9000/browseproducts/men` | men products |
| `get` | `http://localhost:9000/browseproducts/access` | Retrieve Accessories |
| `get` | `http://localhost:9000/browseproducts/newarrivals` | Retrieve New Arrivals |
| `post` | `http://localhost:9000/signup/user` | user registration |
| `post` | `http://localhost:9000/login` | user login |
| `post` | `http://localhost:9000/cartdata` | Retrieve Cart Info |
| `post` | `http://localhost:9000/addtocart` | item stored to cart |
| `patch` | `http://localhost:9000/buyitem` | item purchased |

## Screenshots

### Home Page
![alt text](https://github.com/thakaresahil/poscon/blob/main/demo/Home.png?raw=true)


### Product Browse
![alt text](https://github.com/thakaresahil/poscon/blob/main/demo/ProductBrowse.png?raw=true)


### Product Details
![alt text](https://github.com/thakaresahil/poscon/blob/main/demo/ItemDetails.png?raw=true)


### Checkout
![alt text](https://github.com/thakaresahil/poscon/blob/main/demo/CheckoutPage.png?raw=true)

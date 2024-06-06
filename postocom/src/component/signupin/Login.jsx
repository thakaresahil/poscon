import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@mui/material";

function Login({ open, handleClose, handleRegister }) {
  const navigate = useNavigate();
  const localcheck = localStorage.getItem("email");
  useEffect(() => {
    if (localcheck) {
      navigate("/");
    }
  }, [localcheck, navigate]);

  const weretoNavigate = "/profile";
  const [logindata, setData] = useState({
    email: "",
    password: "",
  });
  const [wrongpassword, setWrongPassword] = useState("");
  const [redirecttosignup, setRedirecttosignup] = useState("");
  const [formError, setFormError] = useState("");
  function handlechange(event) {
    setData({
      ...logindata,
      [event.target.name]: event.target.value,
    });
  }

  function loggerin() {
    setFormError("");
    for (const key in logindata) {
      if (logindata[key] === "") {
        setFormError("Please fill out all fields.");
        return;
      }
    }
    axios
      .post("http://localhost:9000/login", logindata, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        try {
          const result = response.data;
          if (result.error) {
            setFormError(result.error);
          }
          // if (neednavigate === "signup") {
          //   console.log(result);
          //   setRedirecttosignup("Account Not Found, Please Signup!");
          // } else {
          //   console.log("LogIn successfull");
          //   navigate(weretoNavigate);
          // }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      })
      .catch((error) => {
        console.error("Error making the request:", error);
      });
  }

  function handlesubmit(event) {
    event.preventDefault();
    setRedirecttosignup("");
    setWrongPassword("");
    // console.log(logindata);
    if (localStorage.getItem("email") !== null) {
      if (
        localStorage.getItem("email") === logindata.email &&
        localStorage.getItem("password") === logindata.password
      ) {
        console.log("You have successfully logged in!");
        navigate(weretoNavigate);
        onclose();
      } else if (
        localStorage.getItem("password") !== logindata.password &&
        localStorage.getItem("email") === logindata.email
      ) {
        setWrongPassword("Incorrect Password");
      }
      // else if(localStorage.getItem("email") !== logindata.email){
      //   setWrongPassword("Incorrect Email")
      // }
      else {
        loggerin();
      }
    } else {
      loggerin();
    }
    // axios.post("http://localhost:3000/signin", { data: logindata });
  }

  return (
    <Dialog open={open}>
      <div className="flex justify-center items-center">
        <form
          className="bg-white px-6 py-8 rounded shadow-md text-black w-96"
          onSubmit={handlesubmit}
        >
          <h1 className="mb-8 text-3xl text-center">Log In</h1>
          <button className="absolute top-2 right-2 " onClick={handleClose}>
            ❌
          </button>
          <input
            type="text"
            className="block border border-grey-light w-full p-3 rounded mb-4 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
            name="email"
            placeholder="Email"
            onChange={handlechange}
            value={logindata.email}
            required
          />

          <input
            type="password"
            className="block border border-grey-light w-full p-3 rounded mb-4 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
            name="password"
            placeholder="Password"
            onChange={handlechange}
            value={logindata.password}
            required
          />
          {wrongpassword && (
            <p className="text-red-700 text-sm w-full mx-auto">
              {wrongpassword}
            </p>
          )}
          {redirecttosignup && (
            <p className="text-red-700 text-sm w-full mx-auto">
              {redirecttosignup}
            </p>
          )}
          {formError && (
            <p className="text-red-700 text-sm w-full mx-auto">{formError}</p>
          )}
          <button
            onClick={handlesubmit}
            type="submit"
            className="w-full text-center py-3 rounded  bg-red-500 text-white hover:bg-red-600 focus:outline-none my-1 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
          >
            Log In
          </button>
          {/* </div> */}
          <div className="text-grey-dark mt-6">
            <p>
              Create account{" "}
              <button className="text-blue-600" onClick={handleRegister}>
                here.
              </button>
            </p>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

export default Login;

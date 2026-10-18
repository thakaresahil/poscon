import api from "../../api/client";
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const localcheck = localStorage.getItem('token');
    const [pdata, setPdata] = useState("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      if(!localcheck){
        navigate("/");
        return;
      }
      const fetchData = async () => {
        try {
            setPdata("");
            const response = await api.get("/profile");
            setPdata(response.data);
        } catch (error) {
            console.log("Error Fetching Profile", error);
        }
        finally{
            setLoading(true);
        }
      }
      fetchData();
    }, [localcheck, navigate])
    


  return (
    <div className="container mx-auto h-[80vh] flex justify-center items-center ">
{loading ? (

    <div className=" flex flex-col justify-between items-start gap-6">
        
            <p>Name: {pdata.name}</p>
            <p>Phone number: {pdata.pnum}</p> 
            <p>Email: {pdata.email}</p>
            <p>Address: {pdata.address}</p> 
    </div>
):null}
    </div>
  )
}

export default Profile;
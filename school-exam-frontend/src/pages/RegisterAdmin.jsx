import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function RegisterAdmin(){

const navigate = useNavigate();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const handleRegister = async (e)=>{

e.preventDefault();

try{

await API.post("/auth/register-admin",{
name,
email,
password
});

alert("Admin created successfully");

navigate("/");

}catch(err){

alert("Registration failed");

}

};

return(

<div className="h-screen flex items-center justify-center bg-gray-100">

<form
onSubmit={handleRegister}
className="bg-white p-8 rounded shadow-md w-96"
>

<h2 className="text-2xl font-bold mb-6 text-center">
Create Admin
</h2>

<input
type="text"
placeholder="Name"
className="w-full border p-2 mb-4 rounded"
onChange={(e)=>setName(e.target.value)}
/>

<input
type="email"
placeholder="Email"
className="w-full border p-2 mb-4 rounded"
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type="password"
placeholder="Password"
className="w-full border p-2 mb-4 rounded"
onChange={(e)=>setPassword(e.target.value)}
/>

<button
className="w-full bg-green-600 text-white p-2 rounded"
>
Create Admin
</button>

</form>

</div>

);

}
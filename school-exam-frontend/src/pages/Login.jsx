import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try{

      const res = await API.post("/auth/login",{
        email,
        password
      });

      const {token,role} = res.data;

      localStorage.setItem("token",token);
      localStorage.setItem("role",role);

      if(role === "admin"){
        navigate("/admin");
      }

    }catch(err){
      alert("Login failed");
    }

  };

  return(

<div className="h-screen flex items-center justify-center bg-gray-100">

<form
onSubmit={handleLogin}
className="bg-white p-8 rounded shadow-md w-96"
>

<h2 className="text-2xl font-bold mb-6 text-center">
School Exam System
</h2>

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
className="w-full bg-blue-600 text-white p-2 rounded"
>
Login
</button>

<p className="text-center mt-4 text-sm">

No admin yet?

<a
href="/register-admin"
className="text-blue-600 ml-1"
>

Create Admin

</a>

</p>

</form>

</div>

  );
}
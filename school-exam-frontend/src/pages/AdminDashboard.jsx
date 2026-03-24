import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard(){

return(

<div className="flex">

<Sidebar/>

<div className="flex-1 p-8">

<Outlet/>

</div>

</div>

);

}
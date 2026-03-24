import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import RegisterAdmin from "./pages/RegisterAdmin";
import AdminDashboard from "./pages/AdminDashboard";

import Dashboard from "./pages/admin/Dashboard";
import Classes from "./pages/admin/Classes";
import Subjects from "./pages/admin/Subjects";
import Teachers from "./pages/admin/Teachers";
import Students from "./pages/admin/Students";
import Results from "./pages/admin/Results";

function App(){

return(

<BrowserRouter>

<Routes>

<Route path="/" element={<Login/>}/>
<Route path="/register-admin" element={<RegisterAdmin/>}/>

{/* ✅ ADMIN LAYOUT */}
<Route path="/admin" element={<AdminDashboard/>}>

<Route index element={<Dashboard/>}/>

<Route path="classes" element={<Classes/>}/>
<Route path="subjects" element={<Subjects/>}/>
<Route path="teachers" element={<Teachers/>}/>
<Route path="students" element={<Students/>}/>
<Route path="results" element={<Results/>}/>

</Route>

</Routes>

</BrowserRouter>

);

}

export default App;
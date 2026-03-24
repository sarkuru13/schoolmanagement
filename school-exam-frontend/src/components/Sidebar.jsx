import { Link } from "react-router-dom";

export default function Sidebar(){

return(

<div className="w-64 h-screen bg-gray-900 text-white p-6">

<h2 className="text-xl font-bold mb-10">
Admin Panel
</h2>

<ul className="space-y-4">

<li>
<Link to="/admin">Dashboard</Link>
</li>

<li>
<Link to="/admin/classes">Classes</Link>
</li>

<li>
<Link to="/admin/subjects">Subjects</Link>
</li>

<li>
<Link to="/admin/teachers">Teachers</Link>
</li>

<li>
<Link to="/admin/students">Students</Link>
</li>

<li>
<Link to="/admin/results">Results</Link>
</li>

</ul>

</div>

);

}
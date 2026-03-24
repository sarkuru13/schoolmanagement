import { useState } from "react";
import API from "../../api/axios";

export default function Results(){

const [examId,setExamId] = useState("");

const releaseResult = async ()=>{

await API.post("/admin/release",{
exam_id:examId
});

alert("Results Released");

};

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Release Exam Result
</h1>

<input
className="border p-2 mr-4"
placeholder="Exam ID"
onChange={(e)=>setExamId(e.target.value)}
/>

<button
className="bg-red-600 text-white px-4 py-2 rounded"
onClick={releaseResult}
>
Release Result
</button>

</div>

);

}
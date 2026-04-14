let resumeText = "";


document.getElementById("resume").addEventListener("change", async (e)=>{
  const file = e.target.files[0];
  if(!file) return;

  document.getElementById("status").innerText = "Reading PDF...";

  const reader = new FileReader();

  reader.onload = async function(){
    const typedArray = new Uint8Array(this.result);

    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    let text = "";

    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item=>item.str).join(" ");
    }

    resumeText = text.toLowerCase();
    document.getElementById("status").innerText = "Resume Uploaded";
  };

  reader.readAsArrayBuffer(file);
});


const skillDB = {
  frontend:["html","css","javascript","react","tailwind"],
  backend:["node","express","mongodb","api"],
  fullstack:["html","css","javascript","react","node","mongodb"],
};


/* analyze resume */
function analyzeResume(){

  if(!resumeText){
    alert("Upload resume first");
    return;
  }

  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("result").classList.add("hidden");

  setTimeout(()=>{

    const role = document.getElementById("jobRole").value.toLowerCase();

    let required = [];

    if(role.includes("frontend")) required = skillDB.frontend;
    else if(role.includes("backend")) required = skillDB.backend;
    else required = skillDB.fullstack;

    const found = required.filter(skill=> resumeText.includes(skill));
    const missing = required.filter(skill=> !resumeText.includes(skill));

    const score = Math.round((found.length / required.length)*100);

   
    document.getElementById("result").classList.remove("hidden");
    document.getElementById("loading").classList.add("hidden");

    
    document.getElementById("progress").style.width = score+"%";
    document.getElementById("scoreText").innerText = score + "% Match";

 
    const skillsDiv = document.getElementById("skills");
    skillsDiv.innerHTML="";
    found.forEach(s=>{
      skillsDiv.innerHTML += `<span class="px-3 py-1 bg-white text-black rounded">${s}</span>`;
    });

   
    const missingDiv = document.getElementById("missing");
    missingDiv.innerHTML="";
    missing.forEach(s=>{
      missingDiv.innerHTML += `<span class="px-3 py-1 bg-red-500 rounded">${s}</span>`;
    }
  );

    const sug = document.getElementById("suggestions");
    sug.innerHTML="";

    if(score < 50){
      sug.innerHTML += "<li>Add more relevant skills</li>";
      sug.innerHTML += "<li>Build 2-3 strong projects</li>";
    }

    if(missing.length){
      sug.innerHTML += `<li>Learn: ${missing.join(", ")}</li>`;
    }

    if(score > 80){
      sug.innerHTML += "<li>Add measurable achievements (numbers)</li>";
    }

  },1000);
}
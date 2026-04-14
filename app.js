let resumeText = "";

/* drag drop resume */
const dropArea = document.getElementById("dropArea");
const input = document.getElementById("resume");

dropArea.onclick = ()=> input.click();
dropArea.ondrop = (e)=>{
  e.preventDefault();
  handleFile(e.dataTransfer.files[0]);
};
dropArea.ondragover = e=> e.preventDefault();
input.onchange = ()=> handleFile(input.files[0]);

/* read pdf section logic*/
async function handleFile(file){
  document.getElementById("status").innerText = file.name;

  document.getElementById("preview").src = URL.createObjectURL(file);
  document.getElementById("preview").classList.remove("hidden");

  const reader = new FileReader();
  reader.onload = async function(){
    const typedArray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    let text = "";

    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(i=>i.str).join(" ");
    }

    resumeText = text.toLowerCase();
  };
  reader.readAsArrayBuffer(file);
}

/* real skill database */
const SKILLS = [
  "html","css","javascript","react","redux","nextjs","tailwind",
  "node","express","mongodb","mysql","postgres",
  "api","rest","graphql",
  "git","github","docker","aws",
  "typescript","java","python","c++"
];

/* stopwords remove */

const STOPWORDS = ["the","and","for","with","developer","team","experience"];

/* extract useful keywords */
function extractKeywords(text){
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g,"")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.includes(w));
}


function analyze(){

  const jd = document.getElementById("jobDesc").value.toLowerCase();

  if(!resumeText || jd.length < 20){
    alert("Proper Job Description daal (copy from real job post)");
    return;
  }

  const resumeWords = extractKeywords(resumeText);
  const jdWords = extractKeywords(jd);

  /* filter JD skills only */
  const jdSkills = SKILLS.filter(skill => jdWords.includes(skill));

  /* matched + missing */
  const matched = jdSkills.filter(skill => resumeWords.includes(skill));
  const missing = jdSkills.filter(skill => !resumeWords.includes(skill));

 
  let score = Math.round((matched.length / (jdSkills.length || 1)) * 100);


  if(jdSkills.length < 3) score = Math.min(score, 70);

  
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("bar").style.width = score+"%";
  document.getElementById("scoreText").innerText = score + "% Match";


  /* breakdown section logic*/
  document.getElementById("breakdown").innerHTML = `
    <li>Skills Found: ${matched.length}</li>
    <li>Missing Skills: ${missing.length}</li>
    <li>Total Required Skills: ${jdSkills.length}</li>
  `;

  /* matched skills */
  const skillsDiv = document.getElementById("skills");
  skillsDiv.innerHTML="";
  matched.forEach(s=>{
    skillsDiv.innerHTML += `<span class="px-3 py-1 bg-white text-black rounded">${s}</span>`;
  });

  /* missing skills */
  const missingDiv = document.getElementById("missing");
  missingDiv.innerHTML="";
  
  if(missing.length === 0){
    missingDiv.innerHTML = `<span class="text-green-400">No major skill gaps 🎯</span>`;
  } else {
    missing.forEach(s=>{
      missingDiv.innerHTML += `<span class="px-3 py-1 bg-red-500 rounded">${s}</span>`;
    });
  }

  /* suggestions */
  const sug = document.getElementById("suggestions");
  sug.innerHTML="";

  if(score < 50){
    sug.innerHTML += "<li>Your resume is weak for this role</li>";
  }

  if(missing.length){
    sug.innerHTML += `<li>Learn & add: ${missing.slice(0,5).join(", ")}</li>`;
  }

  if(!resumeText.includes("project")){
    sug.innerHTML += "<li>Add 2-3 strong projects</li>";
  }

  if(!resumeText.includes("experience")){
    sug.innerHTML += "<li>Add work experience or internships</li>";
  }

  if(!resumeText.match(/\d+/)){
    sug.innerHTML += "<li>Add numbers (metrics) like 30% performance improvement</li>";
  }

  if(sug.innerHTML === ""){
    sug.innerHTML = "<li>Your resume is strong. Optimize formatting & ATS keywords.</li>";
  }
}

/* download report logic*/

function downloadReport(){

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Resume Analysis Report", 10, 10);
  doc.text(document.getElementById("scoreText").innerText, 10, 20);

  doc.save("report.pdf");
}
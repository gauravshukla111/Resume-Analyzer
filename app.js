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



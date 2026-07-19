async function loadWelcomeMessage(){
    const response = await fetch("http://localhost:5000/");
    const data = await response.json();
    document.getElementById("welcome").innerText = data.message;
}
loadWelcomeMessage();
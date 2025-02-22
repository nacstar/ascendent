window.onload = function() {
    console.log("Seite geladen, DOM bereit.");
    const button = document.getElementById("calculateButton");
    if (button) {
        button.addEventListener("click", calculateSimple);
        console.log("Event-Listener für Button gesetzt.");
    } else {
        console.error("Button nicht gefunden!");
    }
};

function calculateSimple() {
    console.log("Berechnen geklickt.");
    const birthDate = document.getElementById("birthDate").value;
    const birthTime = document.getElementById("birthTime").value;
    const location = document.getElementById("location").value;

    console.log("Eingaben:", birthDate, birthTime, location);

    if (!birthDate || !birthTime || !location) {
        document.getElementById("result").innerText = "Bitte alle Felder ausfüllen!";
        console.log("Eingaben unvollständig.");
        return;
    }

    document.getElementById("result").innerText = 
        `Testantwort für: ${birthDate}, ${birthTime}, ${location}`;
    console.log("Testantwort angezeigt.");
}

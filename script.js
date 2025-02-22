window.onload = function() {
    console.log("Seite geladen, DOM bereit.");
    const button = document.getElementById("calculateButton");
    if (button) {
        button.addEventListener("click", getCoordinatesAndCalculate);
        console.log("Event-Listener für Button gesetzt.");
    } else {
        console.error("Button nicht gefunden!");
    }
};

async function getCoordinatesAndCalculate() {
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

    const sunSign = getSunSign(birthDate);
    console.log("Sternzeichen:", sunSign);

    try {
        console.log("Starte Nominatim API-Aufruf...");
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`, {
            headers: { "User-Agent": "Aszendenten-Rechner/1.0" }
        });
        console.log("API-Antwort erhalten:", response.status);
        const data = await response.json();
        console.log("API-Daten:", data);

        if (data.length > 0) {
            const latitude = parseFloat(data[0].lat);
            const longitude = parseFloat(data[0].lon);
            document.getElementById("coordinates").innerText = 
                `Koordinaten: ${latitude}, ${longitude}`;
            console.log("Koordinaten geladen:", latitude, longitude);

            calculateAscendant(birthDate, birthTime, latitude, longitude, sunSign);
            showSkyView(birthDate, birthTime, latitude, longitude);
            showBirthDateTrivia(birthDate);
            showBirthDateHistory(birthDate);
        } else {
            document.getElementById("coordinates").innerText = "Ort nicht gefunden!";
            console.log("Kein Ort gefunden.");
        }
    } catch (error) {
        document.getElementById("coordinates").innerText = "Fehler bei der API-Abfrage!";
        console.error("Nominatim Fehler:", error);
    }
}

function getSunSign(birthDate) {
    const [year, month, day] = birthDate.split('-').map(Number);
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Widder";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Stier";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Zwillinge";
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Krebs";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Löwe";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Jungfrau";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Waage";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Skorpion";
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Schütze";
    if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "Steinbock";
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Wassermann";
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Fische";
}

function calculateSiderealTime(birthDate, birthTime, longitude) {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hours, minutes] = birthTime.split(':').map(Number);
    const ut = hours + minutes / 60;
    const d = (Date.UTC(year, month - 1, day, hours, minutes) - Date.UTC(2000, 0, 1, 12, 0)) / (1000 * 60 * 60 * 24);
    const gmst = (6.697374558 + 0.06570982441908 * d + 1.00273790935 * ut) % 24;
    const lst = (gmst + longitude / 15) % 24;
    return lst * 15;
}

function calculateAscendant(birthDate, birthTime, latitude, longitude, sunSign) {
    console.log("Berechne Aszendent...");
    const lst = calculateSiderealTime(birthDate, birthTime, longitude);
    const epsilon = 23.44;

    const ascendantRad = Math.atan2(
        -Math.cos(lst * Math.PI / 180),
        Math.sin(lst * Math.PI / 180) * Math.cos(epsilon * Math.PI / 180) +
        Math.tan(latitude * Math.PI / 180) * Math.sin(epsilon * Math.PI / 180)
    );
    let ascendantDeg = ascendantRad * 180 / Math.PI;
    if (ascendantDeg < 0) ascendantDeg += 360;

    const signs = ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau",
                   "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"];
    const signIndex = Math.floor(ascendantDeg / 30);
    const ascendantSign = signs[signIndex];

    document.getElementById("result").innerText = 
        `Dein Sternzeichen ist: ${sunSign}\nDein Aszendent ist: ${ascendantSign} (Winkel: ${ascendantDeg.toFixed(2)}°)`;
    console.log("Aszendent berechnet:", ascendantSign);
    showCombinedMeaning(sunSign, ascendantSign);
}

function showCombinedMeaning(sunSign, ascendantSign) {
    const combinedMeanings = {
        "Widder": `Als ${sunSign} mit Widder-Aszendent kombinierst du deine innere Natur mit einer dynamischen, mutigen Außenwirkung. Du bist ein echter Anführer.`,
        "Stier": `Mit ${sunSign} und einem Stier-Aszendenten verbindest du deine Persönlichkeit mit Ruhe und Ausdauer. Du strahlst Stabilität aus.`,
        "Zwillinge": `${sunSign} mit Zwillinge-Aszendent macht dich noch kommunikativer und vielseitiger. Du wirkst lebhaft und kontaktfreudig.`,
        "Krebs": `Als ${sunSign} mit Krebs-Aszendent fügst du deiner Natur eine sanfte, emotionale Schicht hinzu. Du wirkst einfühlsam und schützend.`,
        "Löwe": `Mit ${sunSign} und Löwe-Aszendent strahlst du Selbstbewusstsein und Wärme aus. Du ziehst andere magisch an.`,
        "Jungfrau": `${sunSign} mit Jungfrau-Aszendent macht dich präzise und hilfsbereit. Du wirkst organisiert und verlässlich.`,
        "Waage": `Als ${sunSign} mit Waage-Aszendent bringst du Harmonie und Charme in dein Auftreten. Du bist ein Friedensstifter.`,
        "Skorpion": `Mit ${sunSign} und Skorpion-Aszendent wirkst du tiefgründig und magnetisch. Deine Präsenz ist intensiv.`,
        "Schütze": `${sunSign} mit Schütze-Aszendent verstärkt deine Abenteuerlust und deinen Optimismus. Du wirkst inspirierend.`,
        "Steinbock": `Als ${sunSign} mit Steinbock-Aszendent kombinierst du deine Essenz mit Zielstrebigkeit. Du wirkst seriös und fokussiert.`,
        "Wassermann": `Mit ${sunSign} und Wassermann-Aszendent bringst du Originalität und Freiheitsliebe nach außen. Du wirkst einzigartig.`,
        "Fische": `${sunSign} mit Fische-Aszendent fügt deiner Persönlichkeit eine verträumte, intuitive Note hinzu. Du wirkst sanft und tiefgründig.`
    };

    document.getElementById("meaning").innerHTML = 
        `<h3>Deine Kombination:</h3><p>${combinedMeanings[ascendantSign]}</p>`;
    console.log("Bedeutung angezeigt.");
}

async function showSkyView(birthDate, birthTime, latitude, longitude) {
    console.log("Lade Himmelskarte...");
    const lst = calculateSiderealTime(birthDate, birthTime, longitude);
    const ra = lst / 15;
    const dec = latitude;

    const skyViewUrl = `https://skyview.gsfc.nasa.gov/cgi-bin/images?position=${ra},${dec}&survey=DSS&coordinates=Equatorial&pixels=500&size=0.5&return=PNG`;
    document.getElementById("skyView").innerHTML = 
        `<h3>Himmelskarte:</h3><img src="${skyViewUrl}" alt="Himmelsansicht">`;
    console.log("Himmelskarte geladen.");
}

async function showBirthDateTrivia(birthDate) {
    const [year, month, day] = birthDate.split('-').map(Number);
    const dayMonth = `${month}/${day}`;

    try {
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://numbersapi.com/${dayMonth}/date`)}`);
        const triviaText = await response.text();
        document.getElementById("trivia").innerHTML = 
            `<h3>Trivia (englisch):</h3><p>${triviaText}</p>`;
        console.log("Trivia geladen:", triviaText);
    } catch (error) {
        document.getElementById("trivia").innerText = "Trivia konnte nicht geladen werden.";
        console.error("Trivia Fehler:", error);
    }
}

async function showBirthDateHistory(birthDate) {
    const [year, month, day] = birthDate.split('-');
    const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", 
                    "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const monthName = months[parseInt(month) - 1];
    const wikiTitle = `${day}. ${monthName}`;

    try {
        const response = await fetch(`https://de.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(wikiTitle)}&origin=*`);
        const data = await response.json();
        const page = Object.values(data.query.pages)[0];
        const extract = page.extract || "Keine historischen Daten gefunden.";
        document.getElementById("history").innerHTML = 
            `<h3>Geschichte:</h3><p>${extract.split('\n')[0]}</p>`;
        console.log("Geschichte geladen:", extract);
    } catch (error) {
        document.getElementById("history").innerText = "Historische Daten konnten nicht geladen werden.";
        console.error("Wikipedia Fehler:", error);
    }
}

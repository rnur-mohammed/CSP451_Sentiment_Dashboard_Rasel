async function analyze() {
    const text = document.getElementById("textInput").value;

    const response = await fetch("YOUR_LOGIC_APP_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text })
    });

    const result = await response.json();
    document.getElementById("result").innerText = JSON.stringify(result, null, 2);
}

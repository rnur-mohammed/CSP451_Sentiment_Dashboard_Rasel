// app.js – front-end logic for CSP451 Sentiment Dashboard

// 🔐 IMPORTANT: replace this with your real Logic App HTTP POST URL.
// DO NOT commit your secret key if you don't want to share it publicly.
const LOGIC_APP_URL = "https://YOUR_LOGIC_APP_URL_HERE";

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("analyzeBtn");
    btn.addEventListener("click", analyzeSentiment);
});

async function analyzeSentiment() {
    const textArea = document.getElementById("textInput");
    const status = document.getElementById("status");
    const resultDiv = document.getElementById("result");

    const text = textArea.value.trim();

    if (!text) {
        status.textContent = "Please enter some text first.";
        return;
    }

    status.textContent = "Sending request to Azure Logic App...";
    resultDiv.innerHTML = "";

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status + " from Logic App");
        }

        const data = await response.json();

        /*
         * Expected JSON shape returned from Logic App:
         * {
         *   "text": "I am very happy today!",
         *   "sentiment": "positive",
         *   "scores": { "positive": 0.98, "neutral": 0.02, "negative": 0.0 },
         *   "phrases": ["very happy", "today"],
         *   "timestamp": "2025-11-07T02:15:30Z"
         * }
         */

        status.textContent = "Analysis complete. Result below.";

        const badgeClass =
            data.sentiment === "positive" ? "badge-positive" :
            data.sentiment === "negative" ? "badge-negative" :
            "badge-neutral";

        resultDiv.innerHTML = `
            <p><strong>Text:</strong> ${escapeHtml(data.text || text)}</p>
            <p><strong>Sentiment:</strong>
               <span class="badge ${badgeClass}">${data.sentiment}</span>
            </p>
            <p><strong>Scores:</strong>
               Positive: ${formatScore(data.scores?.positive)}
               • Neutral: ${formatScore(data.scores?.neutral)}
               • Negative: ${formatScore(data.scores?.negative)}
            </p>
            <p><strong>Key Phrases:</strong>
               ${(data.phrases && data.phrases.length > 0)
                    ? data.phrases.map(escapeHtml).join(", ")
                    : "N/A"}
            </p>
            <p><strong>Timestamp:</strong> ${data.timestamp || new Date().toISOString()}</p>
            <p class="status">Record also stored in Cosmos DB and will appear in Power BI dashboards.</p>
        `;
    } catch (err) {
        console.error(err);
        status.textContent = "Error calling Logic App. Check console and configuration.";
        resultDiv.innerHTML = `<p style="color:#d43c3c;">${escapeHtml(err.message)}</p>`;
    }
}

// Utility helpers

function formatScore(value) {
    if (value == null || isNaN(value)) return "N/A";
    return value.toFixed(2);
}

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

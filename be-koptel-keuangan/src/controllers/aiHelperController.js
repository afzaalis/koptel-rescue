
exports.chat = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Pesan tidak boleh kosong.' });
    }

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: message }] });

        const payload = { contents: chatHistory };
        const apikey = process.env.GEMINI_API_KEY; 

        if (!apikey) {
            console.error('GEMINI_API_KEY is not set in environment variables.');
            return res.status(500).json({ message: 'Kunci API AI Helper tidak dikonfigurasi di server.' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apikey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            res.status(200).json({ response: text });
        } else {
            console.error('Unexpected Gemini API response structure:', result);
            const errorMessage = result.error?.message || 'Gagal mendapatkan respons dari AI. Struktur respons tidak terduga.';
            res.status(500).json({ message: errorMessage });
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat berkomunikasi dengan AI Helper.' });
    }
};

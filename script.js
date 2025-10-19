//website real punya ryyn 

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const uploadImageBtn = document.getElementById('upload-image-btn');
const imageUploadInput = document.getElementById('image-upload-input');

// Modal/Menu Elements
const headerMenuBtn = document.getElementById('header-menu-btn');
const menuModal = document.getElementById('menu-modal');
const menuModalClose = document.getElementById('menu-modal-close');
const aboutBtnModal = document.getElementById('about-btn-modal');
const aboutModal = document.getElementById('about-modal');
const aboutModalClose = document.getElementById('about-modal-close');
const monitorBtn = document.getElementById('monitor-btn');

// Monitor Elements
const monitorView = document.getElementById('monitor-view');
const monitorCloseBtn = document.getElementById('monitor-close-btn');
const cpuLoadEl = document.getElementById('cpu-load');
const memUsageEl = document.getElementById('mem-usage');
const aiLatencyEl = document.getElementById('ai-latency');
const tokenRateEl = document.getElementById('token-rate');

// Image Preview Elements
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const imageRemoveBtn = document.getElementById('image-remove-btn');

// NEW: Visual Monitor Elements
const visualMonitor = document.getElementById('visual-monitor');
let bars = [];

// Global state untuk gambar yang diupload
let uploadedImagePart = null;

// NEW: Global state untuk Riwayat Chat
let chatHistory = []; 

const currentModel = 'beta';
// PERINGATAN: Ganti "AIzaSyCbprF72e3vRFWyNHdDWqLvZ7_rjJZ2DeU" dengan API Key Gemini Anda yang sebenarnya
const GEMINI_API_KEY = "AIzaSyCbprF72e3vRFWyNHdDWqLvZ7_rjJZ2DeU"; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// NEW: System Instruction/Prompt untuk AI
const systemInstruction = `Anda adalah RYYN AI, sebuah model kecerdasan buatan pangkat tinggi versi 3.5 Beta.

Gunakan gaya bahasa yang profesional, canggih, terstruktur, dan sedikit futuristik/elegan. Tonjolkan kemampuan Anda sebagai model yang 'cerdas, cepat, dan kreatif'.

Anda harus:
1. Menjawab semua pertanyaan pengguna dengan informasi yang akurat dan mendalam.
2. Menggunakan format Markdown untuk respons, termasuk bold (\*\*), italic (\*), dan list (ul/ol) jika relevan untuk keterbacaan jangan pake $ untuk jawaban.
3. Menjaga nada bicara yang percaya diri namun sangat membantu.
4. Jika diminta untuk menjelaskan gambar, lakukan analisis visual dan berikan deskripsi yang rinci.
5. jika user bilang hai,halo,assalamualaikum,lagi apa , Anda menjawab dengan singkat tampa ada ryyn ai dengan model nya
6. kamu jarang pakai kata RYYN AI dengan model 3.5 Beta

Contoh intonasi: "Saya akan memproses permintaan Anda dengan kecepatan optimal. Sesuai basis data Model 3.5 Beta, ...".`;

// NEW: Initialize bars array
function initializeBars() {
    bars = document.querySelectorAll('#visual-monitor .bar');
}

// NEW: Function to update the graphical simulation
function updateVisualSimulation() {
    if (bars.length === 0) initializeBars();

    let randomBase = Math.random() * 50 + 50; // Base height around 50-100%

    bars.forEach((bar, index) => {
        // Creates a wave/cone-like pattern by making bars in the middle slightly taller
        const waveFactor = Math.sin((index / bars.length) * Math.PI) * 0.5 + 0.5; // Factor 0.5 to 1.0 (peaks in the middle)
        
        // Fluctuating height: (Random fluctuation + Wave Pattern) * Base Height
        const fluctuation = Math.random() * 30 + 5; // 5% to 35% random fluctuation
        let newHeight = Math.min(100, (randomBase * waveFactor * 0.5) + fluctuation); // Scale down the wave factor

        bar.style.height = `${newHeight}%`;
    });
}
// END NEW VISUAL SIMULATION LOGIC

// --- Fungsi untuk menambahkan pesan ke chat ---
function addMessage(sender, text, isImage = false, imageUrl = '') {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');

    if (isImage) {
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.style.maxWidth = '100%';
        imgElement.style.borderRadius = '10px';
        imgElement.style.marginBottom = '10px';
        contentDiv.appendChild(imgElement);
        const textNode = document.createElement('p');
        textNode.innerHTML = `<strong>${text}</strong>`;
        contentDiv.appendChild(textNode);
    } else {
        let formattedText = text;
        
        if (sender === 'user') {
            formattedText = `<p><strong>${text}</strong></p>`;
        } else {
            formattedText = formattedText
                .replace(/\*\*\*(.*?)\*\*\*/g, '<em><strong>$1</strong></em>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/```(\w+)\n([\s\S]*?)```/gs, (match, lang, code) => {
                    return `<pre><code class="language-${lang.trim()}">${code.trim()}</code></pre>`;
                })
                .replace(/```([\s\S]*?)```/gs, '<pre><code>$1</code></pre>')
                .replace(/(^|\n)(?:\s*)- (.*)/g, '$1<li>$2</li>')
                .replace(/<li>.*<\/li>(\n|$)/gs, (match) => {
                    // Ini adalah logika yang rentan eror untuk markdown list, diperbaiki agar lebih stabil
                    const listItems = match.trim().split('\n').map(item => `<li>${item.replace(/^- /, '').trim()}</li>`).join('');
                    return `<ul>${listItems}</ul>\n`;
                })
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');
                
            // Menghilangkan duplikasi ul/ol yang mungkin terjadi
            formattedText = formattedText.replace(/<\/ul>\s*<ul>/g, '').replace(/<\/ol>\s*<ol>/g, '');


            if (!formattedText.startsWith('<p>') && !formattedText.startsWith('<strong>') && !formattedText.startsWith('<pre>')) {
                formattedText = `<p>${formattedText}</p>`;
            }
        }

        contentDiv.innerHTML = formattedText;
    }

    if (sender === 'ai' && !isImage) {
        const ttsButton = document.createElement('button');
        ttsButton.classList.add('tts-button');
        ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        ttsButton.onclick = () => speakText(ttsButton);
        contentDiv.appendChild(ttsButton);
    }

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- Fungsi Simulasi Monitor (tanpa terminal) ---
function runSimulation() {
    // Make sure bars are initialized when simulation starts
    if (bars.length === 0) initializeBars(); 
    
    // Initial values for a smoother start
    let cpu = parseFloat(cpuLoadEl.textContent) || 0;
    let mem = parseFloat(memUsageEl.textContent) || 0;

    const simInterval = setInterval(() => {
        // Update Stats: Modified for continuous random fluctuation
        cpu = Math.max(10, Math.min(100, cpu + (Math.random() * 10 - 5))); // Fluctuate between 10-100
        mem = Math.max(100, Math.min(1024, mem + (Math.random() * 50 - 25))); // Fluctuate between 100-1024
        latency = Math.max(20, Math.floor(Math.random() * 100) + (cpu / 2));
        token = Math.floor(Math.random() * 40) + 10;

        cpuLoadEl.textContent = `${cpu.toFixed(0)}%`;
        memUsageEl.textContent = `${mem.toFixed(0)} MB`;
        aiLatencyEl.textContent = `${latency.toFixed(0)} ms`;
        tokenRateEl.textContent = `${token.toFixed(0)} T/s`;

        // NEW: Update visual simulation
        updateVisualSimulation();

        // **Removed the stopping condition to ensure continuous movement (sesuai permintaan user).**
    }, 500);
    
    return simInterval;
}

let currentSimInterval = null;

// --- Fungsi untuk memproses input pengguna (Teks & Gambar) ---
async function sendMessage() {
    const text = userInput.value.trim();
    
    // Cek jika tidak ada teks dan tidak ada gambar
    if (!text && !uploadedImagePart) return;

    // 1. Tampilkan pesan user
    let userDisplayMessage = text;
    if (!text && uploadedImagePart) {
        userDisplayMessage = 'Tolong jelaskan gambar ini.';
    } else if (text && uploadedImagePart) {
        userDisplayMessage = `${text}`;
    }

    addMessage('user', userDisplayMessage, !!uploadedImagePart, uploadedImagePart ? imagePreview.src : '');
    userInput.value = '';

    try {
        // 2. Simulasi loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.classList.add('message', 'ai');
        loadingMessage.innerHTML = `<div class="message-content" style="max-width: 150px;"><p><span class="terminal-running">AI sedang berpikir</span></p></div>`;
        chatMessages.appendChild(loadingMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 3. Siapkan request contents dengan history
        const requestContents = [];
        
        // Tambahkan System Instruction ke dalam pesan pertama dari history
        const fullSystemInstruction = systemInstruction + "\n\nPermintaan Pengguna:\n" + (text || "Jelaskan gambar ini secara rinci.");

        // Tambahkan riwayat chat ke request contents
        chatHistory.forEach(msg => {
            requestContents.push({
                role: msg.role,
                parts: msg.parts
            });
        });
        
        // Tambahkan pesan user saat ini
        const currentUserParts = [];
        if (uploadedImagePart) {
            currentUserParts.push(uploadedImagePart);
        }
        // Tambahkan instruksi sistem ke prompt pengguna saat ini, terutama jika ini adalah pesan pertama atau untuk memastikan instruksi ditaati
        currentUserParts.push({ text: fullSystemInstruction });

        requestContents.push({
            role: "user",
            parts: currentUserParts
        });

        // 4. Panggil API Gemini
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: requestContents 
            })
        });

        // 5. Hapus pesan loading
        chatMessages.removeChild(loadingMessage);

        // 6. Proses respons
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${response.statusText} - ${errorData.error.message}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI tidak memberikan respons yang valid.";
        addMessage('ai', aiResponse);
        
        // 7. Simpan pesan user (gambar & teks) dan AI ke history
        // Simpan pesan user
        chatHistory.push({
            role: "user",
            parts: [{ text: text || "Jelaskan gambar ini secara rinci." }] // Hanya simpan teks (mengabaikan gambar untuk history agar tidak terlalu besar/berulang)
        });
        
        // Simpan respons AI
        chatHistory.push({
            role: "model",
            parts: [{ text: aiResponse }]
        });

    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        
        const loadingEl = chatMessages.querySelector('.message.ai:last-child .terminal-running');
        if (loadingEl) {
            loadingEl.closest('.message').remove();
        }
        addMessage('ai', "<strong>Error Jaringan atau API!</strong><p>Maaf, terjadi kesalahan saat menghubungi AI. Pastikan **API Key** sudah valid atau periksa kembali koneksi internet Anda.</p>");
    } finally {
        // 8. Reset state gambar setelah pesan terkirim
        uploadedImagePart = null;
        imagePreviewContainer.classList.add('hidden');
        imagePreview.src = '';
        imageUploadInput.value = '';
    }
}

// --- Event Listener untuk tombol kirim dan Enter ---
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Mencegah newline di input teks
        sendMessage();
    }
});

// NEW: Logika untuk mengatasi pergeseran saat fokus input di mobile
function handleInputFocus(isFocused) {
    const chatContainer = document.querySelector('.chat-container');
    if (isFocused) {
        // Saat input fokus (keyboard muncul)
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight; // Pastikan scroll ke bawah
        }, 100);
    }
}

userInput.addEventListener('focus', () => handleInputFocus(true));
userInput.addEventListener('blur', () => handleInputFocus(false));
// END NEW LOGIC

// --- Event Listeners untuk Modal dan Monitor ---
// Fungsi bantu untuk menampilkan/menyembunyikan modal (Memperbaiki error klik)
function toggleModal(modalId, displayStyle = 'flex') {
    const modal = document.getElementById(modalId);
    modal.style.display = (modal.style.display === 'flex') ? 'none' : displayStyle;
}

headerMenuBtn.addEventListener('click', () => {
    toggleModal('menu-modal');
});
menuModalClose.addEventListener('click', () => {
    toggleModal('menu-modal');
});

aboutBtnModal.addEventListener('click', () => {
    toggleModal('menu-modal');
    toggleModal('about-modal');
});
aboutModalClose.addEventListener('click', () => {
    toggleModal('about-modal');
});

monitorBtn.addEventListener('click', () => {
    toggleModal('menu-modal');
    monitorView.style.display = 'flex';
    // NEW: Initialize bars when monitor is opened
    if (bars.length === 0) {
        initializeBars();
    }
    if (currentSimInterval) clearInterval(currentSimInterval);
    currentSimInterval = runSimulation();
});

monitorCloseBtn.addEventListener('click', () => {
    monitorView.style.display = 'none';
    if (currentSimInterval) clearInterval(currentSimInterval);
    currentSimInterval = null;
});

// Menutup modal jika klik di luar
window.addEventListener('click', (event) => {
    if (event.target === menuModal) {
        menuModal.style.display = 'none';
    }
    if (event.target === aboutModal) {
        aboutModal.style.display = 'none';
    }
});

// --- Fungsi Upload Gambar (Multimodal) ---
uploadImageBtn.addEventListener('click', () => {
    imageUploadInput.click();
});

imageUploadInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Data = e.target.result.split(',')[1];
            const mimeType = file.type;

            // Simpan data gambar untuk dikirim saat sendMessage dipanggil
            uploadedImagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            };

            // Tampilkan pratinjau gambar di input area
            imagePreview.src = e.target.result;
            imagePreviewContainer.classList.remove('hidden');
            userInput.focus();
        };
        reader.readAsDataURL(file);
    }
});

// Fungsi hapus pratinjau gambar
imageRemoveBtn.addEventListener('click', () => {
    uploadedImagePart = null;
    imagePreviewContainer.classList.add('hidden');
    imagePreview.src = '';
    imageUploadInput.value = ''; // Reset input file agar bisa upload file yang sama lagi
});

// --- Fungsi Text-to-Speech (TTS) ---
const synth = window.speechSynthesis;
function speakText(button) {
    const messageContent = button.closest('.message-content');
    const textToSpeak = messageContent.cloneNode(true);
    textToSpeak.querySelector('.tts-button')?.remove();
    
    const plainText = textToSpeak.textContent.replace(/(\r\n|\n|\r)/gm, " ").trim();

    if (synth.speaking) {
        synth.cancel();
        if (button.innerHTML.includes('fa-volume-mute')) {
            button.innerHTML = '<i class="fas fa-volume-up"></i>';
            return;
        }
    }
    
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'id-ID';

    utterance.onstart = () => {
        button.innerHTML = '<i class="fas fa-volume-mute"></i>';
    };
    utterance.onend = () => {
        button.innerHTML = '<i class="fas fa-volume-up"></i>';
    };
    utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        button.innerHTML = '<i class="fas fa-volume-up"></i>';
    };

    synth.speak(utterance);
}

window.onbeforeunload = () => {
    if (synth.speaking) {
        synth.cancel();
    }
    if (currentSimInterval) {
        clearInterval(currentSimInterval);
    }
};

if (!synth) {
    console.warn("Speech Synthesis API not supported in this browser.");
}

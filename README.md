# Terms and Conditions Summarizer
A Chrome Extension that automatically summarizes the **Terms & Conditions (T&C)** or **Privacy Policy** of any website using a local Python backend.
Useful for quickly understanding how websites use your data.

## 🚀 Motivation
This project was developed during a college hackathon to address the lack of awareness about the often overlooked **Terms and Conditions** found on various websites. Our Chrome extension provides users with a quick summary of these documents, making them easier to understand and access.

## Features
- One-click summarization of the current website’s T&C
- Local caching (24‑hour TTL) for instant reloads
- Clean, simple popup UI
- Optional sentence translation (/summarize?lang=hi)
- Python backend with NLTK-based summarization
- CORS-enabled Flask server
- Categories like Privacy, Payment, Usage Rights, General

## 📁 Project Structure

thefourhorsemen/
│
├── chrome_extension/
│   ├── background.js
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
│
├── server.py              # Flask backend
├── terms_parser.py        # T&C parser + summarization logic
├── README.md
└── .gitignore

## 🛠️ How to Use
### ⚙️ Installation Guide
1) Install dependencies (Python backend)
- Create virtual environment
```shell
python -m venv .venv
source .venv/bin/activate   # Mac/Linux
.venv\Scripts\activate      # Windows
```

- Install required libraries
```shell
pip install flask flask-cors requests beautifulsoup4 nltk deep-translator
```

- Download NLTK data
```shell
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

python -c "import nltk; nltk.download('punkt_tab')"

# verify 
python -c "import nltk, sys; print('OK')"
```

2) Run the backend
```shell 
python server.py
```
You should see:
                Summarizer server running on http://localhost:5000

You can check by visiting:
                http://localhost:5000/

### 🧩 Load Chrome Extension
1. Open chrome://extensions/
2. Enable Developer mode
3. Click Load unpacked
4. Select the chrome_extension/ folder
5. Pin the extension in your toolbar

### 🕹 Usage
1. Navigate to any website (e.g.,https://www.spotify.com/in-en/legal/end-user-agreement/ )
2. Click the extension icon
3. Extension fetches the page URL
4. Local server summarizes T&C
5. A categorized summary is displayed
6. Click Copy Summary to save it

## 🧠 Future Improvements
- Auto-detect T&C links from homepage and fetch them
- Better NLP-based summarization 
- Multi-language UI

## 🤝 Contributing
Pull requests are welcome!
follow the branch naming style:
feat/<feature-name>
fix/<bug-name>
docs/<doc-change>
refactor/<module-name>

### How to Contribute
1. GitHub → Fork
2. Clone Your Fork
3. Create a New Branch (Highly Recommended)
4. make changes and commit them
5. push your branch
6. create a Pull Request(PR)

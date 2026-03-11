//Cache key for chrome.storage.local; It is object which maps each url with its cached summary and a timestamp.
// stores { [url]: { data, timestamp } }
const CACHE_KEY = 'summaries_cache';

async function getSummary(url) {
  try {
    // Check cache first
    const cache = await chrome.storage.local.get(CACHE_KEY);
    const cachedData = cache[CACHE_KEY] || {};
    //if already this url was parsed before 24 hrs then curr time - old time < 24 hr which would just give the old summary which was made.
    if (cachedData[url] && Date.now() - cachedData[url].timestamp < 24 * 60 * 60 * 1000) {
      return cachedData[url].data;
    }
    // sends url to /summarize to summarize 
    const response = await fetch('http://localhost:5000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
// Expected shape: { summary: ["...", "..."] }.
    const data = await response.json();
    
    // Cache the result i.e updating new data and time 
    cachedData[url] = {
      data: data,
      timestamp: Date.now()
    };
    await chrome.storage.local.set({ [CACHE_KEY]: cachedData });
    
    return data;
  } 
  
  catch (error) {
    console.error('Error in fetching data:', error);
    throw error;
  }
}

function displaySummary(summaryPoints) {
  const container = document.getElementById('summary-container');
  const status = document.getElementById('status');
  const copyBtn = document.getElementById('copyBtn');
  
  container.innerHTML = '';
  
  // Categorize summary points
  const categories = {
    'Privacy': [],
    'Usage Rights': [],
    'Payment': [],
    'General': []
  };
  
  summaryPoints.forEach(point => {
    if (point.toLowerCase().includes('privacy') || point.toLowerCase().includes('data')) {
      categories['Privacy'].push(point);
    } else if (point.toLowerCase().includes('payment') || point.toLowerCase().includes('fee')) {
      categories['Payment'].push(point);
    } else if (point.toLowerCase().includes('right') || point.toLowerCase().includes('license')) {
      categories['Usage Rights'].push(point);
    } else {
      categories['General'].push(point);
    }
  });
  
  // Display categorized points
  Object.entries(categories).forEach(([category, points]) => {
    if (points.length > 0) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category';
      
      const categoryHeader = document.createElement('h3');
      categoryHeader.textContent = category;
      categoryHeader.style.color = '#007bff';
      categoryHeader.style.marginTop = '15px';
      categoryDiv.appendChild(categoryHeader);
      
      points.forEach((point, index) => {
        const pointElement = document.createElement('div');
        pointElement.className = 'summary-point';
        pointElement.textContent = `${index + 1}. ${point}`;
        categoryDiv.appendChild(pointElement);
      });
      
      container.appendChild(categoryDiv);
    }
  });
  
  status.textContent = 'Summary generated successfully!';
  copyBtn.style.display = 'block';
}// displays the button of copy summary 

function displayError(message) {
  const container = document.getElementById('summary-container');
  const status = document.getElementById('status');
  
  status.textContent = 'Error occurred';
  status.style.color = '#dc3545';
  
  const errorElement = document.createElement('div');
  errorElement.className = 'error';
  errorElement.textContent = `Unable to analyze terms: ${message}`;
  container.appendChild(errorElement);
}
// This is the main /First Function from where the process start 
async function sendUrlToServer() {
  const status = document.getElementById('status');
  const container = document.getElementById('summary-container');
  
  try {
    // Show loading spinner
    status.textContent = 'Analyzing terms and conditions...';
    container.innerHTML = '<div class="loading-spinner"></div>';
    
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tabs[0].url;

// We use chrome.tabs.query() to read the active tab's URL when the popup opens.
// "tabs" permission is required for reliable access to tab metadata.

    if (!currentUrl.startsWith('http')) {
      throw new Error('Please navigate to a website first');
    }
    
    const response = await getSummary(currentUrl); //this is where getSummary function is called
    if (response && response.summary) {
      displaySummary(response.summary);
    } else {
      throw new Error('No terms and conditions found on this page');
    }
  } 
  catch (error) {
    displayError(error.message);
  }
}

// Improved copy functionality with feedback

//This runs only when "copy summary" is clicked
document.getElementById('copyBtn').addEventListener('click', async () => {
  const summaryText = Array.from(document.querySelectorAll('.category'))
    .map(category => {
      const header = category.querySelector('h3').textContent;
      const points = Array.from(category.querySelectorAll('.summary-point'))
        .map(el => el.textContent)
        .join('\n');
      return `${header}\n${points}\n`;
    })
    .join('\n');
  //selects each category section that displaySummary() created.
  // For each category:
            //  - Gets the category header text:
            // - Collects all .summary-point items inside that category, maps them to text, and joins with newline ('\n').
            // - Returns a block
  // Joins all category blocks with blank lines, building a single string summaryText that’s easy to paste anywhere.

  try {
    await navigator.clipboard.writeText(summaryText);
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.textContent = 'Copied!';
    copyBtn.style.backgroundColor = '#28a745';
    setTimeout(() => {
      copyBtn.textContent = 'Copy Summary';
      copyBtn.style.backgroundColor = '#007bff';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
});

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', sendUrlToServer);
// DOMContentLoaded hook simply starts the whole process as soon as the popup is ready.
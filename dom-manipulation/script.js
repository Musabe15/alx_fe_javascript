// Initialize quotes from localStorage or use default
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "work"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    category: "life"
  }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

// Initialize application
function init() {
  showRandomQuote();
  updateCategoryFilter();
  setupEventListeners();
  
  // Store last viewed quote in session storage
  if (quotes.length > 0) {
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quotes[0]));
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Set up event listeners
function setupEventListeners() {
  newQuoteBtn.addEventListener('click', showRandomQuote);
  categoryFilter.addEventListener('change', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  exportBtn.addEventListener('click', exportToJson);
  importFile.addEventListener('change', importFromJsonFile);
}

// Display random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes in this category</p>';
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  displayQuote(quote);
  
  // Store last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Display specific quote
function displayQuote(quote) {
  quoteDisplay.innerHTML = `
    <p class="quote-text">"${quote.text}"</p>
    ${quote.author ? `<p class="quote-author">— ${quote.author}</p>` : ''}
    <span class="quote-category">${quote.category}</span>
  `;
}

// Update category filter dropdown
function updateCategoryFilter() {
  const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
  categoryFilter.innerHTML = categories.map(category => 
    `<option value="${category}">${
      category === 'all' ? 'All Categories' : category
    }</option>`
  ).join('');
}

// Add new quote to collection
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const author = document.getElementById('newQuoteAuthor').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim().toLowerCase();

  if (!text || !category) {
    alert('Please enter both quote text and category');
    return;
  }

  const newQuote = { text, category, ...(author && { author }) };
  quotes.push(newQuote);
  saveQuotes();
  
  updateCategoryFilter();
  displayQuote(newQuote);
  clearForm();
  
  alert('Quote added successfully!');
}

// Clear form inputs
function clearForm() {
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteAuthor').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

// Export quotes to JSON file
function exportToJson() {
  if (quotes.length === 0) {
    alert('No quotes to export');
    return;
  }
  
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes-export.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      quotes.push(...importedQuotes);
      saveQuotes();
      updateCategoryFilter();
      event.target.value = ''; // Reset file input
      alert(`Successfully imported ${importedQuotes.length} quotes!`);
    } catch (error) {
      alert(`Error importing quotes: ${error.message}`);
    }
  };
  
  fileReader.onerror = () => {
    alert('Error reading file');
  };
  
  fileReader.readAsText(file);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
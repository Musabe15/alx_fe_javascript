// Initial quotes data
let quotes = [
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

// Initialize the application
function init() {
  // Load quotes from localStorage if available
  const savedQuotes = localStorage.getItem('quotes');
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  }

  // Load last viewed quote from sessionStorage if available
  const lastQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastQuote) {
    quoteDisplay.innerHTML = lastQuote;
  } else {
    showRandomQuote();
  }

  updateCategoryFilter();
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  newQuoteBtn.addEventListener('click', showRandomQuote);
  categoryFilter.addEventListener('change', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  exportBtn.addEventListener('click', exportQuotes);
  importFile.addEventListener('change', importQuotes);
}

// Display a random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  
  // Filter quotes based on selected category
  let filteredQuotes = quotes;
  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }

  // If no quotes in filtered list, show message
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes available in this category.</p>';
    return;
  }

  // Select a random quote
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  
  // Display the quote
  displayQuote(quote);
  
  // Store in sessionStorage
  sessionStorage.setItem('lastViewedQuote', quoteDisplay.innerHTML);
}

// Display a specific quote
function displayQuote(quote) {
  quoteDisplay.innerHTML = `
    <p class="quote-text">"${quote.text}"</p>
    ${quote.author ? `<p class="quote-author">— ${quote.author}</p>` : ''}
    <span class="quote-category">${quote.category}</span>
  `;
}

// Update the category filter dropdown
function updateCategoryFilter() {
  // Get all unique categories
  const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options
  categoryFilter.innerHTML = '';
  
  // Add new options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category === 'all' ? 'All Categories' : category;
    categoryFilter.appendChild(option);
  });
}

// Add a new quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const author = document.getElementById('newQuoteAuthor').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim().toLowerCase();

  // Validate inputs
  if (!text || !category) {
    alert('Please enter both quote text and category');
    return;
  }

  // Create new quote object
  const newQuote = {
    text,
    category,
    ...(author && { author })
  };

  // Add to quotes array
  quotes.push(newQuote);
  
  // Save to localStorage
  localStorage.setItem('quotes', JSON.stringify(quotes));
  
  // Update UI
  updateCategoryFilter();
  displayQuote(newQuote);
  
  // Clear form
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteAuthor').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Show success message
  alert('Quote added successfully!');
}

// Export quotes to JSON file
function exportQuotes() {
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
function importQuotes(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      quotes.push(...importedQuotes);
      localStorage.setItem('quotes', JSON.stringify(quotes));
      updateCategoryFilter();
      event.target.value = '';
      alert(`Successfully imported ${importedQuotes.length} quotes!`);
    } catch (error) {
      alert(`Error importing quotes: ${error.message}`);
    }
  };
  
  reader.onerror = () => {
    alert('Error reading file');
  };
  
  reader.readAsText(file);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
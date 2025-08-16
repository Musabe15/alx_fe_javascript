// Enhanced quotes database with multiple categories
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
  },
  {
    text: "In the middle of every difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "inspiration"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "dreams"
  }
];

// DOM elements cache
const elements = {
  quoteDisplay: document.getElementById('quoteDisplay'),
  newQuoteBtn: document.getElementById('newQuote'),
  categoryFilter: document.getElementById('categoryFilter'),
  addQuoteBtn: document.getElementById('addQuoteBtn'),
  newQuoteText: document.getElementById('newQuoteText'),
  newQuoteAuthor: document.getElementById('newQuoteAuthor'),
  newQuoteCategory: document.getElementById('newQuoteCategory')
};

// Initialize application
function init() {
  showRandomQuote();
  updateCategoryFilter();
  setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
  elements.newQuoteBtn.addEventListener('click', showRandomQuote);
  elements.categoryFilter.addEventListener('change', showRandomQuote);
  elements.addQuoteBtn.addEventListener('click', addQuote);
}

// Display random quote (filtered by category if selected)
function showRandomQuote() {
  const selectedCategory = elements.categoryFilter.value;
  let filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    elements.quoteDisplay.innerHTML = '<p>No quotes in this category</p>';
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  displayQuote(randomQuote);
}

// Render quote to DOM
function displayQuote(quote) {
  elements.quoteDisplay.innerHTML = `
    <p class="quote-text">"${quote.text}"</p>
    ${quote.author ? `<p class="quote-author">— ${quote.author}</p>` : ''}
    <span class="quote-category">${quote.category}</span>
  `;
}

// Update category dropdown options
function updateCategoryFilter() {
  const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
  elements.categoryFilter.innerHTML = categories.map(category => 
    `<option value="${category}">${
      category === 'all' ? 'All Categories' : category
    }</option>`
  ).join('');
}

// Add new quote to collection
function addQuote() {
  const text = elements.newQuoteText.value.trim();
  const author = elements.newQuoteAuthor.value.trim();
  const category = elements.newQuoteCategory.value.trim().toLowerCase();

  if (!text || !category) {
    alert('Please enter both quote text and category');
    return;
  }

  const newQuote = { text, category, ...(author && { author }) };
  quotes.push(newQuote);
  
  updateCategoryFilter();
  displayQuote(newQuote);
  clearForm();
  
  alert('Quote added successfully!');
}

// Clear input fields
function clearForm() {
  elements.newQuoteText.value = '';
  elements.newQuoteAuthor.value = '';
  elements.newQuoteCategory.value = '';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
// Initial quote 
let quotes = [{
  text: "The only way to do great work is to love what you do.",
  author: "Steve Jobs",
  category: "work"
}];

// Access HTML elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteBtn = document.getElementById('addQuoteBtn');

// Initialize the application
function init() {
  // Display a random quote on page load
  showRandomQuote();

  // Category filter
  updateCategoryFilter();
  
  // Event listener
  newQuoteBtn.addEventListener('click', showRandomQuote);
  categoryFilter.addEventListener('change', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
}

// Display a random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;

  // Filter quotes based on selected category
  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }

  // If no quotes in filtered list, show message
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes available in this category</p>';
    return;
  }
}
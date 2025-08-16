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

// DOM elements cache
const elements = {
  quoteDisplay: document.getElementById('quoteDisplay'),
  newQuoteBtn: document.getElementById('newQuote'),
  categoryFilter: document.getElementById('categoryFilter'),
  container: document.querySelector('.container')
};

// Initialize application
function init() {
  showRandomQuote();
  updateCategoryFilter();
  createAddQuoteForm();
  createImportExportControls();
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

// Create the "Add Quote" form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.className = 'add-quote-form';
  
  const formTitle = document.createElement('h2');
  formTitle.textContent = 'Add New Quote';
  
  // Create form groups
  const textGroup = createInputGroup('newQuoteText', 'Enter quote text', true);
  const authorGroup = createInputGroup('newQuoteAuthor', 'Enter author (optional)');
  const categoryGroup = createInputGroup('newQuoteCategory', 'Enter category', true);
  
  // Create submit button
  const submitBtn = document.createElement('button');
  submitBtn.id = 'addQuoteBtn';
  submitBtn.textContent = 'Add Quote';
  
  // Append all elements
  formContainer.append(
    formTitle,
    textGroup,
    authorGroup,
    categoryGroup,
    submitBtn
  );
  
  // Add to DOM
  elements.container.appendChild(formContainer);
  
  // Cache the new elements
  elements.newQuoteText = document.getElementById('newQuoteText');
  elements.newQuoteAuthor = document.getElementById('newQuoteAuthor');
  elements.newQuoteCategory = document.getElementById('newQuoteCategory');
  elements.addQuoteBtn = document.getElementById('addQuoteBtn');
}

// Create import/export controls
function createImportExportControls() {
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'import-export-controls';
  
  // Export button
  const exportBtn = document.createElement('button');
  exportBtn.id = 'exportBtn';
  exportBtn.textContent = 'Export Quotes';
  
  // Import file input
  const importLabel = document.createElement('label');
  importLabel.htmlFor = 'importFile';
  importLabel.textContent = 'Import Quotes';
  importLabel.className = 'import-label';
  
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.id = 'importFile';
  importInput.accept = '.json';
  
  controlsDiv.append(exportBtn, importLabel, importInput);
  elements.container.appendChild(controlsDiv);
  
  // Cache elements
  elements.exportBtn = exportBtn;
  elements.importFile = importInput;
}

// Helper function to create input groups
function createInputGroup(id, placeholder, required = false) {
  const group = document.createElement('div');
  group.className = 'form-group';
  
  const input = document.createElement('input');
  input.id = id;
  input.type = 'text';
  input.placeholder = placeholder;
  if (required) input.required = true;
  
  group.appendChild(input);
  return group;
}

// Set up event listeners
function setupEventListeners() {
  elements.newQuoteBtn.addEventListener('click', showRandomQuote);
  elements.categoryFilter.addEventListener('change', showRandomQuote);
  elements.addQuoteBtn.addEventListener('click', addQuote);
  elements.exportBtn.addEventListener('click', exportToJson);
  elements.importFile.addEventListener('change', importFromJsonFile);
}

// Display random quote
function showRandomQuote() {
  const selectedCategory = elements.categoryFilter.value;
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    elements.quoteDisplay.innerHTML = '<p>No quotes in this category</p>';
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
  elements.quoteDisplay.innerHTML = `
    <p class="quote-text">"${quote.text}"</p>
    ${quote.author ? `<p class="quote-author">— ${quote.author}</p>` : ''}
    <span class="quote-category">${quote.category}</span>
  `;
}

// Update category filter dropdown
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
  saveQuotes();
  
  updateCategoryFilter();
  displayQuote(newQuote);
  clearForm();
  
  alert('Quote added successfully!');
}

// Clear form inputs
function clearForm() {
  elements.newQuoteText.value = '';
  elements.newQuoteAuthor.value = '';
  elements.newQuoteCategory.value = '';
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
/* -------------------------------
   Book Management System Classes
---------------------------------*/

class BaseBook {
  constructor(title, author, isbn, pubDate, genre) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.pubDate = pubDate;
    this.genre = genre;
    this.age = this.calculateAge();
    this.category = this.categorizeGenre();
  }

  calculateAge() {
    const publication = new Date(this.pubDate);
    const today = new Date();

    let years = today.getFullYear() - publication.getFullYear();
    let months = today.getMonth() - publication.getMonth();
    let days = today.getDate() - publication.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} years ${months} months ${days} days`;
  }

  categorizeGenre() {
    const categories = {
      fiction: "Entertainment",
      science: "Educational",
      history: "Informational",
      biography: "Inspirational",
      technology: "Technical",
      romance: "Emotional",
    };
    return categories[this.genre.toLowerCase()] || "General";
  }

  discountedPrice(price, discount = 0.1) {
    return (price - price * discount).toFixed(2);
  }

  getDetails() {
    return ""; // BaseBook has no extra details
  }
}

class EBook extends BaseBook {
  constructor(title, author, isbn, pubDate, genre, fileSizeMB) {
    super(title, author, isbn, pubDate, genre);
    this.fileSizeMB = fileSizeMB;
  }

  getDetails() {
    return `<p><span class="font-semibold">File Size:</span> ${this.fileSizeMB} MB</p>`;
  }
}

class PrintedBook extends BaseBook {
  constructor(title, author, isbn, pubDate, genre, pages) {
    super(title, author, isbn, pubDate, genre);
    this.pages = pages;
  }

  getDetails() {
    return `<p><span class="font-semibold">Pages:</span> ${this.pages}</p>`;
  }
}

class BookManager {
  constructor() {
    this.books = [];
    this.editingIndex = null;
  }

  addBook(book) {
    if (this.editingIndex !== null) {
      this.books[this.editingIndex] = book;
      this.editingIndex = null;
    } else {
      this.books.push(book);
    }
  }

  deleteBook(index) {
    this.books.splice(index, 1);
  }

  editBook(index) {
    this.editingIndex = index;
    return this.books[index];
  }

  searchAndFilter(searchQuery = "", genreQuery = "") {
    searchQuery = searchQuery.toLowerCase();
    genreQuery = genreQuery.toLowerCase();

    let filteredBooks = this.books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery) ||
        book.author.toLowerCase().includes(searchQuery);
      const matchesGenre = genreQuery
        ? book.genre.toLowerCase() === genreQuery
        : true;
      return matchesSearch && matchesGenre;
    });

    filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
    return filteredBooks;
  }

  async fetchExternalBooks() {
    const url = `https://jsonplaceholder.typicode.com/posts?_limit=3&_=${Date.now()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();

    return data.map(
      (post) =>
        new EBook(
          post.title,
          `User ${post.userId}`,
          `123${post.id}`,
          "2020-01-01",
          "general",
          10
        )
    );
  }
}

/* -------------------------------
   UI & Event Handlers
---------------------------------*/

const manager = new BookManager();

function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");

  if (pageId === "viewBooksPage") renderBooks();
  if (pageId === "deleteBookPage") renderDeleteList();
}

function renderBooks() {
  const container = document.getElementById("bookCardsContainer");
  container.innerHTML = "";

  const filteredBooks = manager.searchAndFilter(
    document.getElementById("searchInput")?.value || "",
    document.getElementById("filterGenre")?.value || ""
  );

  filteredBooks.forEach((book, i) => {
    const card = document.createElement("div");
    card.className =
      "p-6 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-md text-white flex flex-col justify-between hover:scale-[1.02] transition-transform";

    card.innerHTML = `
      <div class="space-y-2">
        <h3 class="text-xl font-bold">${book.title}</h3>
        <p><span class="font-semibold">Author:</span> ${book.author}</p>
        <p><span class="font-semibold">ISBN:</span> ${book.isbn}</p>
        <p><span class="font-semibold">Age:</span> ${book.age}</p>
        ${book.getDetails()}
        <span class="inline-block mt-2 px-3 py-1 rounded-full text-sm bg-gradient-accent text-white shadow">${
          book.genre
        }</span>
      </div>
      <button onclick="startEditBook(${i})"
        class="mt-4 px-4 py-2 rounded-md bg-gradient-primary text-white font-medium shadow hover:shadow-lg hover:scale-105 transition-all">
        ✏ Edit
      </button>
    `;
    container.appendChild(card);
  });
}

function renderDeleteList() {
  const list = document.getElementById("deleteList");
  list.innerHTML = "";
  manager.books.forEach((book, i) => {
    const li = document.createElement("li");
    li.className =
      "flex justify-between items-center p-4 rounded-md bg-white/10 border border-white/20 text-white";
    li.innerHTML = `
      <span>${book.title} - ${book.author}</span>
      <button onclick="deleteBook(${i})"
        class="px-3 py-1 rounded bg-gradient-danger text-white shadow hover:scale-105 transition-all">
        🗑 Delete
      </button>
    `;
    list.appendChild(li);
  });
}

function deleteBook(index) {
  manager.deleteBook(index);
  renderDeleteList();
  renderBooks();
}

function startEditBook(index) {
  const book = manager.editBook(index);

  document.getElementById('title').value = book.title;
  document.getElementById('author').value = book.author;
  document.getElementById('isbn').value = book.isbn;
  document.getElementById('pubDate').value = book.pubDate;
  document.getElementById('genre').value = book.genre;

  if (book instanceof PrintedBook) {
    bookTypeSelect.value = 'printed';
    pagesInput.value = book.pages || '';
    fileSizeInput.value = '';
  } else if (book instanceof EBook) {
    bookTypeSelect.value = 'ebook';
    fileSizeInput.value = book.fileSizeMB || '';
    pagesInput.value = '';
  } else {
    bookTypeSelect.value = '';
    pagesInput.value = '';
    fileSizeInput.value = '';
  }

  toggleBookFields(); 

  document.getElementById('formTitle').textContent = "Edit Book";
  document.getElementById('submitBtn').textContent = "Save Changes";

  showPage('addBookPage');
}

// Form submit
document.getElementById("bookForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const isbn = document.getElementById("isbn").value.trim();
  const pubDate = document.getElementById("pubDate").value;
  const genre = document.getElementById("genre").value.trim();

  if (!title || !author || !isbn || !pubDate || !genre)
    return alert("Fill all fields!");
  if (isNaN(isbn)) return alert("ISBN must be numeric!");

  const pages = parseInt(document.getElementById("pages")?.value) || 0;
  const fileSize = parseFloat(document.getElementById("fileSize")?.value) || 0;

  let book;
  if (pages > 0) {
    book = new PrintedBook(title, author, isbn, pubDate, genre, pages);
  } else if (fileSize > 0) {
    book = new EBook(title, author, isbn, pubDate, genre, fileSize);
  } else {
    book = new BaseBook(title, author, isbn, pubDate, genre);
  }

  manager.addBook(book);

  e.target.reset();
  document.getElementById("formTitle").textContent = "Add a New Book";
  document.getElementById("submitBtn").textContent = "Add Book";

  alert("Book saved!");
  renderBooks();
  showPage("viewBooksPage");
});

// Fetch external books
const loadingSpinner = document.getElementById("loadingSpinner");
const errorContainer = document.getElementById("errorContainer");

async function loadBooksAsync() {
  loadingSpinner.classList.remove("hidden");
  errorContainer.classList.add("hidden");
  document.getElementById("bookCardsContainer").innerHTML = "";

  try {
    const externalBooks = await manager.fetchExternalBooks();
    manager.books.push(...externalBooks);
    renderBooks();
  } catch (error) {
    errorContainer.textContent = `Failed to load books: ${error.message}`;
    errorContainer.classList.remove("hidden");
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

document
  .getElementById("fetchApiBtn")
  ?.addEventListener("click", loadBooksAsync);

// Filters
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("filterGenre")
    ?.addEventListener("change", renderBooks);
  document
    .getElementById("searchInput")
    ?.addEventListener("input", renderBooks);
});

// Toggle between filesize and pages input
const bookTypeSelect = document.getElementById("bookType");
const pagesContainer = document.getElementById("pagesContainer");
const pagesInput = document.getElementById("pages");
const fileSizeContainer = document.getElementById("fileSizeContainer");
const fileSizeInput = document.getElementById("fileSize");

function toggleBookFields() {
  if (bookTypeSelect.value === "printed") {
    pagesContainer.style.display = "block";
    pagesInput.required = true;
    fileSizeContainer.style.display = "none";
    fileSizeInput.required = false;
  } else if (bookTypeSelect.value === "ebook") {
    fileSizeContainer.style.display = "block";
    fileSizeInput.required = true;
    pagesContainer.style.display = "none";
    pagesInput.required = false;
  } else {
    // default: hide both
    pagesContainer.style.display = "none";
    pagesInput.required = false;
    fileSizeContainer.style.display = "none";
    fileSizeInput.required = false;
  }
}

// Listen for changes
bookTypeSelect.addEventListener("change", toggleBookFields);

// Initial call to hide fields on page load
toggleBookFields();
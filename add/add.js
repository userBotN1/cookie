/* --------------- DATA PROCESSING --------------- */
class Category {
  constructor(e) {
    this.emoji = categories[e].emoji;
    this.categoryName = e;
    this.isExpenditure = categories[e].isExpenditure;
  }
}

/* --------------- INTERFACE --------------- */
class UI {
  constructor() {
    const categoriesArr = Object.keys(categories);
    const categoryData = [];
    for (const e of categoriesArr) {
      const temp = new Category(e);
      categoryData.push(temp);
    }

    this.categoryData = categoryData;
    this.createCategoryHTML();

    this.doms = {
      slides: document.querySelectorAll(".slides > div"),
      categoryTitle: document.querySelector(".header__title"),
      leftBtn: document.querySelector(".header__left-btn"),
      rightBtn: document.querySelector(".header__right-btn"),
      expenditureDiv: document.querySelector(".main-container__expenditure"),
      incomeDiv: document.querySelector(".main-container__income"),
      calculatorContainer: document.querySelector(".modal-container"),
      overlay: document.querySelector(".overlay"),
    };
  }

  /**
   * Generate HTML content
   */
  createCategoryHTML() {
    // Seperate expenditure and income into two arrays
    const expenditureArr = [];
    const incomeArr = [];
    this.categoryData.forEach((category) => {
      if (category.isExpenditure == true) {
        expenditureArr.push(category);
      } else {
        incomeArr.push(category);
      }
    });

    // Generate HTML content for categories in expenditure
    let expenditureTemplate = `<div class="main-container__expenditure">`;
    expenditureArr.forEach((category) => {
      const oneCategory = `
        <div class="category-container">
            <button class="category-container__btn">
                <span class="category-container__btn-emoji">${category.emoji}</span>
            </button>
            <span class="category-container__desc">${category.categoryName}</span>
        </div>`;
      expenditureTemplate += oneCategory;
    });
    expenditureTemplate += `</div>`;

    // Generate HTML content for categories in income
    let incomeTemplate = `<div class="main-container__income">`;
    incomeArr.forEach((category) => {
      const oneCategory = `
        <div class="category-container">
            <button class="category-container__btn">
                <span class="category-container__btn-emoji">${category.emoji}</span>
            </button>
            <span class="category-container__desc">${category.categoryName}</span>
        </div>`;
      incomeTemplate += oneCategory;
    });
    incomeTemplate += `</div>`;

    // Coalesce
    document.querySelector(".slides").innerHTML =
      expenditureTemplate + incomeTemplate;
  }
}
const ui = new UI();

/* --------------- INTERACTION --------------- */

/* --------------- Sliding Between Expenditure/Income Divs --------------- */
let categoryIndex = 0;
function initializeCategory() {
  ui.doms.slides[categoryIndex].classList.add("displayCategory");
}

function showCategory(categoryDesc) {
  if (0 <= categoryIndex && categoryIndex < ui.doms.slides.length) {
    ui.doms.slides.forEach((slide) => {
      slide.classList.remove("displayCategory");
    });

    ui.doms.slides[categoryIndex].classList.add("displayCategory");
    ui.doms.categoryTitle.textContent = categoryDesc;
  }
}

function prevCategory() {
  categoryIndex = 0;
  showCategory("Expenditure");
}

function nextCategory() {
  categoryIndex = 1;
  showCategory("Income");
}

ui.doms.leftBtn.addEventListener("click", prevCategory);
ui.doms.rightBtn.addEventListener("click", nextCategory);
document.addEventListener("DOMContentLoaded", initializeCategory);

/* --------------- Selecting a Category & Open Calculator --------------- */

function closeCalculator() {
  ui.doms.calculatorContainer.classList.add("hidden");
  ui.doms.overlay.classList.add("hidden");
}

/**
 * Converts an array of characters into corresponding numerical value
 * @param {array} arr - An array of characters storing a single number
 * @returns {number} The numerical value
 *
 * @example
 * // Returns: 3
 * arr = ["3"];
 *
 * @example
 * // Returns: 0.2
 * arr = [".", "2"];
 *
 * * @example
 * // Returns: 0
 * arr = ['.']
 *
 * * @example
 * // Returns: 321.155
 * arr = ["3", "2", "1", ".", "1", "5", "5"];
 *
 * * @example
 * // Returns: 321155
 * arr = ["3", "2", "1", "1", "5", "5"];
 *
 */
function computeNumbers(arr) {
  // 0. Edge case
  if (arr.length === 1 && arr[0] === ".") {
    return 0;
  }

  // 1. Get the integer part of the number and count how many digits there is
  let counter = 0;
  let intPart = 0;

  while (counter < arr.length && arr[counter] !== ".") {
    counter++;
  }

  const intPartArr = arr.slice(0, counter);
  const decimalPartArr = arr.slice(counter + 1, arr.length);
  counter -= 1;

  for (let i = 0; i < intPartArr.length; i++) {
    intPart += intPartArr[i] * 10 ** counter;
    counter--;
  }

  // 2. Check if the number contains decimal parts. If not, early return
  if (arr.length - intPartArr.length === 0) {
    return intPart;
  }

  // 3. Get the decimal part of the number and count how many decimal places there is
  let counterDecimal = arr.length - intPartArr.length - 1;
  let power = decimalPartArr.length - 1;
  let decimalPart = 0;

  for (let i = 0; i < decimalPartArr.length; i++) {
    decimalPart += decimalPartArr[i] * 10 ** power;
    power--;
  }
  decimalPart = decimalPart * (1 * 10 ** -counterDecimal);

  // 4. Return final value
  return intPart + decimalPart;
}

/**
 * Calculates the numerical value for a bookkeeping based on user inputs on the calculator
 * @param {array} operations - An gloabl variable array stroing user inputs on the calculator
 * @returns {number} The numerical value for a bookkeeping
 *
 * @example
 * // Returns: 3.2
 * operations = ["+", "3", "+", "+", ".", "2", "+", ".", ".", ".", "."];
 *
 * @example
 * // Returns: 5.77
 * operations = ["6", "+", "-", "1", ".", "2", "3", "+", "1"];
 *
 * * @example
 * // Returns: 8.8
 * operations = ["6", "+", "3", "-", "1", ".", "2", "+", "1"];
 *
 * * @example
 * // Returns: 6.8
 * operations = ["6", "+", "3", "-", "1", ".", "2", "-", "1"];
 *
 * * @example
 * // Returns: 0
 * operations = ["-", ".", "+", "+", "+", ".", "-"];
 *
 * * * @example
 * // Returns: 2.8
 * operations = ["-", ".", "0", "2", "+", "3"];
 */
function processDetailsAddAmount() {
  // 1. Clean up incoming array
  let operationsClean = [];
  let i = 0;

  if (operations[0] === "+" || operations[0] === "-") {
    operations.unshift("0");
  }

  while (i < operations.length) {
    if (operations[i] === "+" || operations[i] === "-") {
      let k = i + 1;
      while (
        k < operations.length &&
        (operations[k] === "+" || operations[k] === "-")
      ) {
        k++;
      }
      operationsClean.push(operations[k - 1]);
      i = k - 1;
    } else if (operations[i] === ".") {
      let k = i + 1;
      while (k < operations.length && operations[k] === ".") {
        k++;
      }
      operationsClean.push(operations[k - 1]);
      i = k - 1;
    } else {
      operationsClean.push(operations[i]);
    }
    i++;
  }

  if (
    operationsClean[operationsClean.length - 1] === "+" ||
    operationsClean[operationsClean.length - 1] === "-"
  ) {
    operationsClean = operationsClean.slice(0, -1);
  }

  // 2. Check if operationsClean contains valid operations
  // [.], [] are not valid
  // ['.', '+', '.'] is valid (check numerical value after calculation)
  if (
    operationsClean === null ||
    operationsClean.length === 0 ||
    (operationsClean.length === 1 && operationsClean[0] === ".")
  ) {
    return -1; // return negative value
  }

  // 3. Process Numbers
  let m = 0;
  let numStack = [];
  while (m < operationsClean.length) {
    if (operationsClean[m] === "+" || operationsClean[m] === "-") {
      m++;
    } else {
      const numArr = [];
      let n = m;
      while (
        n < operationsClean.length &&
        operationsClean[n] !== "+" &&
        operationsClean[n] !== "-"
      ) {
        numArr.push(operationsClean[n]);
        n++;
      }
      m = n;
      const num = computeNumbers(numArr);
      numStack.push(num);
    }
  }

  // 4. Math operation
  let operatorStack = [];
  for (let i = 0; i < operationsClean.length; i++) {
    if (operationsClean[i] === "+" || operationsClean[i] === "-") {
      operatorStack.push(operationsClean[i]);
    }
  }

  operatorStack = operatorStack.reverse();
  numStack = numStack.reverse();

  while (numStack.length !== 0 && operatorStack.length !== 0) {
    const a = numStack.pop();
    const b = numStack.pop();
    const operator = operatorStack.pop();
    let tempRes = 0;
    if (operator === "+") {
      tempRes = a + b;
    } else if (operator === "-") {
      tempRes = a - b;
    }
    numStack.push(tempRes);
  }

  // 5. Clean up operations for future use
  operations.length = 0;
  const finalRes = numStack.pop();
  return finalRes;
}

const operations = [];
function processDetails(event) {
  let clickArea = event.target.tagName;
  if (clickArea === "BUTTON") {
    clickArea = event.target.closest("button");
    const operation = clickArea.textContent;

    if (operation === "ADD") {
      console.log("Operations recorded: ", operations);
      const value = processDetailsAddAmount(); // final amount cannot be <= 0
      console.log(value);
    } else {
      operations.push(operation);
    }
  }
}

function initializeRecord(event) {
  let clickArea = event.target.tagName;
  if (clickArea === "SPAN" || clickArea === "BUTTON") {
    clickArea = event.target.closest(".category-container__btn");
    const category = clickArea.nextElementSibling.textContent;
    ui.doms.calculatorContainer.classList.remove("hidden");
    ui.doms.overlay.classList.remove("hidden");
  }
}

ui.doms.expenditureDiv.addEventListener("click", initializeRecord);
ui.doms.incomeDiv.addEventListener("click", initializeRecord);

ui.doms.calculatorContainer.addEventListener("click", processDetails);

ui.doms.overlay.addEventListener("click", closeCalculator);


async function convertCurrency(){
    const amount = document.getElementById("convertAmount").value;
    const fromCurrency = document.getElementById("fromCurrency").value;
    const toCurrency = document.getElementById("toCurrency").value;
    const response = await fetch(`http://localhost:5000/convert?amount=${amount}&from_currency=${fromCurrency}&to_currency=${toCurrency}`);

    if (response.status === 401) {
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");

    document.querySelector(".auth-page").style.display = "flex";
    document.querySelector(".dashboard").style.display = "none";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    return;
    }

    const data = await response.json();
    const convertedAmount = data.converted_amount;
    const resultDiv =
    document.getElementById("exchangeResult");
    resultDiv.style.display = "flex";
    resultDiv.textContent =
    `${Number(amount).toLocaleString()} ${fromCurrency} = ${Number(convertedAmount).toLocaleString(
    undefined,
    {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
    )}
    ${toCurrency}`;
}
function capitalizeWords(text){
    return text
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");
}
async function createBudget(){
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/budgets",
    {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      country: document.getElementById("country").value,
      departure_date:
        document.getElementById("startDate").value,

    return_date:
        document.getElementById("endDate").value,

      budget_amount: Number(
        document.getElementById("amount").value
      ),
      budget_currency: document.getElementById("budgetCurrency").value,
      country_currency: document.getElementById("countryCurrency").value
    })        
    }
    );

    if (response.status === 401) {
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");

    document.querySelector(".auth-page").style.display = "flex";
    document.querySelector(".dashboard").style.display = "none";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    return;
    }

    const data = await response.json();

    if(!response.ok){
        alert(data.detail);
    return;
    }

    const departureDate = new Date(data.departure_date);
    const returnDate = new Date(data.return_date);

    const options = {
        day: "2-digit",
        month: "short",
        year: "numeric"
    };

    const formattedDeparture = departureDate.toLocaleDateString("en-GB", options);

    const formattedReturn = returnDate.toLocaleDateString("en-GB", options);

    const resultDiv = document.getElementById("budgetResult");
    resultDiv.innerHTML = `<strong>Budget Created Successfully!</strong><br><br>
    Country: ${capitalizeWords(data.country)}<br>
    Travel Dates: ${formattedDeparture} - ${formattedReturn}<br>
    Available Budget: ${Number(data.converted_budget).toLocaleString()} ${data.country_currency}`;
    resultDiv.style.display = "block";
    
    if(response.ok){
    await loadCountries();
    document.getElementById(
    "summaryCountry"
    ).value =
    data.country;
    document.getElementById("country").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("budgetCurrency").selectedIndex = 0;
    document.getElementById("countryCurrency").selectedIndex = 0;
    }
}
async function addExpense(){
    const token = localStorage.getItem("token");
    console.log("Country being sent:",
    document.getElementById("expenseCountry").value);
    const response = await fetch("http://localhost:5000/expenses",
       {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            country: document.getElementById("expenseCountry").value,
            city: document.getElementById("city").value,
            category: document.getElementById("category").value,
            expense_amount: Number(
                document.getElementById("expenseAmount").value
            ),
            expense_date: document.getElementById("expenseDate").value
        })
       } 
    );

    if (response.status === 401) {
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");

    document.querySelector(".auth-page").style.display = "flex";
    document.querySelector(".dashboard").style.display = "none";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    return;
    }

    const data = await response.json();
    const resultDiv = document.getElementById("expenseResult");
    if(!response.ok){
    alert(data.detail);      
    return;                  
    }

    const formattedDate = new Date(
    data.expense.expense_date
    ).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
    });

    resultDiv.innerHTML = `
    <strong>Expense Added Successfully!</strong><br><br>
    Country: ${capitalizeWords(data.expense.country)}<br>
    City: ${capitalizeWords(data.expense.city)}<br>
    Category: ${data.expense.category}<br>
    Date: ${formattedDate}<br> 
    Amount: ${Number(data.expense.amount).toLocaleString()} ${data.expense.country_currency}`;
    resultDiv.style.display = "block";

    document.getElementById("expenseCountry").value = "";
    document.getElementById("city").value = "";
    document.getElementById("category").selectedIndex = 0;
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDate").value = "";

}
async function getSummary(){
    const token = localStorage.getItem("token");
    const country = document.getElementById("summaryCountry").value;
    const response = await fetch(`http://localhost:5000/summary/${country}`,
    {
    headers: {
            "Authorization": `Bearer ${token}`
        }
    }
);

if (response.status === 401) {
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");

    document.querySelector(".auth-page").style.display = "flex";
    document.querySelector(".dashboard").style.display = "none";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    return;
}

    const data = await response.json();
    const resultDiv =
    document.getElementById("summaryResult");
    if(!response.ok){
        resultDiv.innerHTML = data.detail;
        resultDiv.style.display = "block";
        return;
    }
    resultDiv.innerHTML = `
    Total Budget: ${Number(data.converted_budget).toLocaleString()} ${data.country_currency}<br>
    Total Expenses: ${Number(data.total_spent).toLocaleString()} ${data.country_currency}<br>
    Remaining: ${Number(data.remaining_budget).toLocaleString()} ${data.country_currency}<br>
    Cities Visited: ${data.cities_visited.join(", ")}`;
    resultDiv.style.display = "block";
}
    const currencies = [
    { code: "AFN", name: "Afghan Afghani" },
    { code: "ALL", name: "Albanian Lek" },
    { code: "DZD", name: "Algerian Dinar" },
    { code: "AOA", name: "Angolan Kwanza" },
    { code: "ARS", name: "Argentine Peso" },
    { code: "AMD", name: "Armenian Dram" },
    { code: "AWG", name: "Aruban Florin" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "AZN", name: "Azerbaijani Manat" },
    { code: "BHD", name: "Bahraini Dinar" },
    { code: "BDT", name: "Bangladeshi Taka" },
    { code: "BBD", name: "Barbadian Dollar" },
    { code: "BYN", name: "Belarusian Ruble" },
    { code: "BZD", name: "Belize Dollar" },
    { code: "BTN", name: "Bhutanese Ngultrum" },
    { code: "BOB", name: "Bolivian Boliviano" },
    { code: "BAM", name: "Bosnia and Herzegovina Convertible Mark" },
    { code: "BWP", name: "Botswanan Pula" },
    { code: "BRL", name: "Brazilian Real" },
    { code: "BND", name: "Brunei Dollar" },
    { code: "BGN", name: "Bulgarian Lev" },
    { code: "KHR", name: "Cambodian Riel" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "XAF", name: "Central African CFA Franc" },
    { code: "CLP", name: "Chilean Peso" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "COP", name: "Colombian Peso" },
    { code: "CDF", name: "Congolese Franc" },
    { code: "CRC", name: "Costa Rican Colon" },
    { code: "HRK", name: "Croatian Kuna" },
    { code: "CZK", name: "Czech Koruna" },
    { code: "DKK", name: "Danish Krone" },
    { code: "DOP", name: "Dominican Peso" },
    { code: "XCD", name: "East Caribbean Dollar" },
    { code: "EGP", name: "Egyptian Pound" },
    { code: "ETB", name: "Ethiopian Birr" },
    { code: "EUR", name: "Euro" },
    { code: "GEL", name: "Georgian Lari" },
    { code: "GHS", name: "Ghanaian Cedi" },
    { code: "GTQ", name: "Guatemalan Quetzal" },
    { code: "HTG", name: "Haitian Gourde" },
    { code: "HKD", name: "Hong Kong Dollar" },
    { code: "HNL", name: "Honduran Lempira" },
    { code: "ISK", name: "Icelandic Krona" },
    { code: "INR", name: "Indian Rupee" },
    { code: "IDR", name: "Indonesian Rupiah" },
    { code: "IQD", name: "Iraqi Dinar" },
    { code: "ILS", name: "Israeli New Shekel" },
    { code: "JMD", name: "Jamaican Dollar" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "JOD", name: "Jordanian Dinar" },
    { code: "KZT", name: "Kazakhstani Tenge" },
    { code: "KPW", name: "North Korean Won" },
    { code: "KRW", name: "South Korean Won" },
    { code: "KWD", name: "Kuwaiti Dinar" },
    { code: "LAK", name: "Lao Kip" },
    { code: "LBP", name: "Lebanese Pound" },
    { code: "LSL", name: "Lesotho Loti" },
    { code: "LKR", name: "Sri Lankan Rupee" },
    { code: "MWK", name: "Malawian Kwacha" },
    { code: "MYR", name: "Malaysian Ringgit" },
    { code: "MVR", name: "Maldivian Rufiyaa" },
    { code: "MAD", name: "Moroccan Dirham" },
    { code: "MDL", name: "Moldovan Leu" },
    { code: "MNT", name: "Mongolian Tugrik" },
    { code: "MZN", name: "Mozambican Metical" },
    { code: "MMK", name: "Myanmar Kyat" },
    { code: "NAD", name: "Namibian Dollar" },
    { code: "NPR", name: "Nepalese Rupee" },
    { code: "NZD", name: "New Zealand Dollar" },
    { code: "NIO", name: "Nicaraguan Cordoba" },
    { code: "NGN", name: "Nigerian Naira" },
    { code: "MKD", name: "Macedonian Denar" },
    { code: "NOK", name: "Norwegian Krone" },
    { code: "OMR", name: "Omani Rial" },
    { code: "PKR", name: "Pakistani Rupee" },
    { code: "PAB", name: "Panamanian Balboa" },
    { code: "PGK", name: "Papua New Guinean Kina" },
    { code: "PYG", name: "Paraguayan Guarani" },
    { code: "PEN", name: "Peruvian Sol" },
    { code: "PHP", name: "Philippine Peso" },
    { code: "PLN", name: "Polish Zloty" },
    { code: "QAR", name: "Qatari Riyal" },
    { code: "RON", name: "Romanian Leu" },
    { code: "RUB", name: "Russian Ruble" },
    { code: "RWF", name: "Rwandan Franc" },
    { code: "WST", name: "Samoan Tala" },
    { code: "SVC", name: "Salvadoran Colon" },
    { code: "RSD", name: "Serbian Dinar" },
    { code: "SGD", name: "Singapore Dollar" },
    { code: "SBD", name: "Solomon Islands Dollar" },
    { code: "ZAR", name: "South African Rand" },
    { code: "SEK", name: "Swedish Krona" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "TWD", name: "New Taiwan Dollar" },
    { code: "TZS", name: "Tanzanian Shilling" },
    { code: "THB", name: "Thailand Baht" },
    { code: "TTD", name: "Trinidad and Tobago Dollar" },
    { code: "TRY", name: "Turkish Lira" },
    { code: "UGX", name: "Ugandan Shilling" },
    { code: "UAH", name: "Ukrainian Hryvnia" },
    { code: "AED", name: "UAE Dirham" },
    { code: "GBP", name: "British Pound" },
    { code: "USD", name: "US Dollar" },
    { code: "UZS", name: "Uzbekistani Som" },
    { code: "VUV", name: "Vanuatu Vatu" },
    { code: "VND", name: "Vietnamese Dong" },
    { code: "XOF", name: "West African CFA Franc" },
    { code: "YER", name: "Yemeni Rial" },
    { code: "ZMW", name: "Zambian Kwacha" }
    ];
    function populateDropdown(id) {

    const dropdown =
        document.getElementById(id);

    if (!dropdown) return;

    currencies.forEach(currency => {

        const option =
            document.createElement("option");

        option.value = currency.code;
        option.textContent =
            `${currency.code} - ${currency.name}`;

        dropdown.appendChild(option);
    });
}
populateDropdown("fromCurrency");
populateDropdown("toCurrency");
populateDropdown("budgetCurrency");
populateDropdown("countryCurrency");
 
const categories = [
    {code: "accommodation", name: "Accommodation"},
    {code: "food", name: "Food"},
    {code: "attractions", name: "Attractions"},
    {code: "shopping", name: "Shopping"},
    {code: "flights", name: "Flights"},
    {code: "transport", name: "Transport"},
    {code: "utilities", name: "Utilities"},
    {code: "healthcare", name: "HealthCare"},
    {code: "other", name: "Other"}
];
    function populateDropdown2(id){

    const dropdown2 =
        document.getElementById(id);

    if (!dropdown2) return;

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category.code;
        option.textContent = category.name;

        dropdown2.appendChild(option);
    });
}
    populateDropdown2("category");

async function loadCountries() {
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    const response =
        await fetch(
            "http://localhost:5000/budgets",
            {
            headers:{
                "Authorization":
                `Bearer ${token}`
            }
        }
    );

    if (response.status === 401) {
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");

    document.querySelector(".auth-page").style.display = "flex";
    document.querySelector(".dashboard").style.display = "none";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    return;
    }

    const data = await response.json();

    const dropdown3 =
        document.getElementById(
            "summaryCountry"
        );

    const budgets = data.active_budgets || [];
    
    dropdown3.innerHTML = `
    <option value="" disabled selected>
        Select Country
    </option>`;

    budgets.forEach(country => {
    dropdown3.innerHTML += `
        <option value="${country}">
            ${capitalizeWords(country)}
        </option>`;
    });
}
loadCountries();

function createExpenseChart(data){

    const start =
    new Date(data.departure_date);

    const end =
    new Date(data.return_date);

    const tripDays = Math.floor((end - start)/(1000*60*60*24)) + 1;

    const labels = [];

    for(let i = 1; i <= tripDays; i++){
        labels.push(`Day ${i}`);
    }

    const ctx = document.getElementById("expenseChart").getContext("2d");

    const spendingData = [];

    for(let i = 0; i < tripDays; i++){

    const currentDate = new Date(start);

    currentDate.setDate(
        start.getDate() + i
    );

    const dateKey =
        currentDate
        .toISOString()
        .split("T")[0];

    spendingData.push(
        data.daily_spending[dateKey] || 0
    );
}

    if(window.expenseChartInstance){
        window.expenseChartInstance.destroy();
    }

    window.expenseChartInstance =    
    new Chart(ctx,{
            type:"line",
            data:{
                labels: labels,
                datasets: [{
                    label: "Daily Spending",
                    data: spendingData
                }]
            }
       });
}

async function createCountryChart(){
    const token = localStorage.getItem("token");

    const country =
    document.getElementById("summaryCountry").value;

    const response = await fetch(
        `http://localhost:5000/summary/${country}`,
        {
            headers:{
                "Authorization":
                `Bearer ${token}`
            }
        }
    );

    if (response.status === 401) {
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");

    document.querySelector(".auth-page").style.display = "flex";
    document.querySelector(".dashboard").style.display = "none";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    return;
    }

    const data = await response.json();

    const ctx =
    document.getElementById("countryChart");

    if(window.countryChartInstance){
    window.countryChartInstance.destroy();
    }

    window.countryChartInstance =
    new Chart(ctx,{
        type:"bar",

        data:{
            labels:[capitalizeWords(data.country)],
            datasets:[{
                label:"Amount Spent",
                data:[data.total_spent]
            }]
        },

        options:{
            indexAxis:"y",
            plugins:{
                tooltip:{
                    callbacks:{
                        label:function(context){
                            return `${context.raw} ${data.country_currency}`;
                        }
                    }
                }
            }
        }
    });
}

async function createCategoryChart(){
    const token = localStorage.getItem("token");

    const country =
    document.getElementById("summaryCountry").value;

    const response = await fetch(
        `http://localhost:5000/summary/${country}`,
        {
            headers:{
            "Authorization":
            `Bearer ${token}`
            }
        }
    );

    if (response.status === 401) {
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");

    document.querySelector(".auth-page").style.display = "flex";
    document.querySelector(".dashboard").style.display = "none";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    return;
    }

    const data = await response.json();

    const categories = [
        "Accommodation",
        "Food",
        "Transport",
        "Flights",
        "Utilities",
        "Healthcare",
        "Shopping",
        "Attractions",
        "Other"
    ];

    const totals = [
        data.accommodation_spent,
        data.food_spent,
        data.transport_spent,
        data.flights_spent,
        data.utilities_spent,
        data.healthcare_spent,
        data.shopping_spent,
        data.attractions_spent,
        data.other_spent
    ];

    const ctx =
    document.getElementById("categoryChart");

    if(window.categoryChartInstance){
    window.categoryChartInstance.destroy();
    }

        window.categoryChartInstance =
        new Chart(ctx,{
        type: "bar",

        data: {
            labels: categories,

            datasets: [{
                label: "Amount Spent",
                data: totals,
                barThickness:26
            }]
        },

        options: {
            indexAxis: "y",
            plugins:{
                tooltip:{
                    callbacks:{
                        label:function(context){
                            return `${context.raw} ${data.country_currency}`;
                        }
                    }
                }
            }
        }
    });
}

async function updateBudgetProgress(){
    const token = localStorage.getItem("token");

    const country =
    document.getElementById("summaryCountry")
    .value
    .toLowerCase();

    const response = await fetch(
        `http://localhost:5000/summary/${country}`,
        {
            headers:{
            "Authorization":
            `Bearer ${token}`
            }
        }
    );

    if (response.status === 401) {
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");

    document.querySelector(".auth-page").style.display = "flex";
    document.querySelector(".dashboard").style.display = "none";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    return;
    }

    const data = await response.json();

    const rawPercent =
    (data.total_spent /
    data.converted_budget) * 100;

    const percentUsed = Math.min(
    (data.total_spent /
    data.converted_budget) * 100,
    100);

    document.getElementById(
        "budgetProgress"
    ).style.width =
    `${percentUsed}%`;

    document.getElementById(
    "budgetStatus"
    ).textContent =
    `${percentUsed.toFixed(1)}% used • Remaining: ${data.remaining_budget.toFixed(2)} ${data.country_currency}`;

    document.querySelector(".progressContainer").style.display = "block";
    document.getElementById("budgetStatus").style.display = "block";
}

async function loadTripIntelligence(){

    const token = localStorage.getItem("token");

    const country =
    document.getElementById("summaryCountry").value;

    if (!country){
    alert("Please select a country first.");
    return;
    }

    const response = await fetch(
        `http://localhost:5000/summary/${country}`,
        {
            headers:{
                "Authorization":
                `Bearer ${token}`
            }
        }
    );

    if (response.status === 401) {
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");

    document.querySelector(".auth-page").style.display = "flex";
    document.querySelector(".dashboard").style.display = "none";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    return;
    }

    const data = await response.json();

    createExpenseChart(data);

    await createCountryChart();

    await createCategoryChart();

    await updateBudgetProgress();
}

async function registerUser(){

    const username =
        document.getElementById("username").value;

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const response = await fetch(
        "http://localhost:5000/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        }
    );

    const data = await response.json();

    if (response.ok) {
    alert("Registration successful! Please log in.");

    document.getElementById("register").style.display = "none";
    document.getElementById("login").style.display = "flex";
    }
    else {
    alert(data.detail);
    }
}

async function loginUser(){
    
    const email =
        document.getElementById("loginEmail").value;

    const password =
        document.getElementById("loginPassword").value;

    const response = await fetch(
        "http://localhost:5000/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    const data = await response.json();

        if (response.ok) {
        localStorage.setItem(
            "token",
            data.access_token
        );
        console.log(window.location.href);
        window.location.href = "dashboard.html";
    }
    else {
        alert("Invalid credentials");
    }
}

function showLogin(){

    document.getElementById("register").style.display = "none";
    document.getElementById("login").style.display = "flex";
}

function showRegister(){
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "flex";
}

function togglePassword(id){

    const passwordInput =
        document.getElementById(id);

    if(passwordInput.type === "password"){
        passwordInput.type = "text";
    }
    else{
        passwordInput.type = "password";
    }
}

function logoutUser(){

    const logoutBtn =
        document.getElementById("logoutBtn");

    if(!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");

        window.location.href =
        "index.html";
    });
}
logoutUser();




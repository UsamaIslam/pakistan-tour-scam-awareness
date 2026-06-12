# Pakistan Tour Scam Awareness Portal

An independent, non-commercial consumer protection portal and community reporting database dedicated to travel safety, raising awareness about domestic tour operator scams (including **Tour Edge** / **touredge** and **Tours Avenue** / **toursavenue** / **Tours Avenue Pvt Ltd**), contract breaches, and extreme passenger safety hazards in Pakistan's northern areas.

This portal serves as a public ledger for travelers to verify tour operators, report fraud, and read first-hand verified case studies before booking tours to Hunza, Naran, Skardu, and Swat.

---

## 🚀 Key Features

* **Dynamic Community reporting:** Built on Node.js/Express and SQLite3, enabling travelers to submit and filter real-time reports of tour agency scams.
* **Modern Dual-Theme UI:** A sleek, fully responsive dashboard layout supporting Dark (default) and Light theme variations, styled with vanilla CSS.
* **Anti-Flicker Persistence:** Integrated client-side persistence (`localStorage`) with an head blocking script to prevent light/dark theme flash on page load.
* **Inlined CSS Compiler:** Custom `build.js` pipeline that minifies CSS and inlines it directly into all HTML templates to avoid critical request chains and maximize LCP, FCP, and CLS performance.
* **Built-in SEO & Accessibility:** Structurally optimized for search engines (JSON-LD structured schemas, preloaded fonts) and fully accessible (aria attributes, keyboard navigability, high contrast colors).

---

## 📖 The Case Study: Tour Edge (touredge) & Tours Avenue (toursavenue)

This portal documents the specific operational breaches, financial misappropriations, and passenger safety hazards committed by **Tour Edge (Lahore)** (also known as **touredge**) and its sub-contracted operational front **Tours Avenue Pvt Ltd** (also known as **toursavenue**). 

### 1. Unnotified Sub-Contracting
We booked a premium couple's deluxe package with Tour Edge (Lahore) for 1 Lac PKR. Without our knowledge or consent, Tour Edge outsourced the entire logistical execution to Tours Avenue. This is a common industry tactic where front agencies use a network of "sister companies" to dilute accountability and shift blame when issues occur.

### 2. Geolocational Gaslighting
On departure day, the coaster departed Lahore 2 hours late. Having confirmed a Thokar Niaz Baig pickup, the tour operators moved it to Sabzazar last minute. To cover their latency, the tour guide dropped a false location pin ("Officers Colony") to waste our time and claim we were the ones late.

### 3. Hotel Booking Theft (Jovial Gold Hotel Naran)
The operators delayed the trip by another 2 hours in Islamabad to pick up a single client. This delay caused us to miss the safety window to cross Babusar Top before nightfall. Instead of rearranging the itinerary, the operators skipped our pre-paid luxury stay at **Jovial Gold Hotel Naran** entirely. The operators kept our booking funds, offered no refund, no compensation, and no corporate apology.

### 4. Life-Threatening Passenger Safety Hazards
Because Naran was skipped, passengers were subjected to a continuous, non-stop 24-hour journey from Lahore to Chilas in a third-class coaster with rock-hard seats.Pushed beyond human capability, the sleep-deprived driver was literally falling asleep at the wheel on dangerous mountain cliffs. 

### 5. The Graveyard Hotel Downgrade
In Hunza, the operators attempted to force us into a poorly rated, isolated property called **Hunza Elite**, which sits directly next to a cemetery. When we insisted on our confirmed deluxe booking at Mulberry Hotel, the guide told us we had to pay for and arrange our own local transport to get there.

### 6. Extortion Attempt at Babusar Top
On the return leg, the operators skipped the scheduled night stay in Chilas, stranding the group at a freezing campsite near Babusar Top. They unilaterally demanded an extra 1,000 PKR from passengers to access the tents. We stood our ground and refused to pay.

---

## 🛠️ Technology Stack

* **Frontend:** HTML5, Vanilla JavaScript, Vanilla CSS (Custom properties, CSS Variables)
* **Backend:** Node.js, Express.js
* **Database:** SQLite3 (dynamic tables for comments and seeded operators)
* **Build System:** Custom CSS compiler (`build.js`)

---

## ⚙️ Installation & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* npm

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/UsamaIslam/pakistan-tour-scam-awareness-.git
   cd pakistan-tour-scam-awareness-
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   node server.js
   ```
   The local portal will be active on `http://localhost:5180`.

4. Build and minify for production:
   ```bash
   node build.js
   ```
   This script compiles the project, inlines minified CSS, and copies ready-to-deploy assets to the target server directory `/var/www/tour-scam-website`.

---

## ⚖️ License & Disclaimer

This project is built purely in the public interest as an independent consumer awareness campaign. It is not affiliated with any commercial tour operator. All reports, evidence links, and timelines are documented from verified customer experiences.

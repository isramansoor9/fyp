/**
 * Reorganizes content1/finetuned_easycontent8bCourse1.json to match the
 * Course 1 table of contents (Theory then Practical, per course1.pdf).
 * Preserves all existing content; adds placeholders for missing keys.
 */
const fs = require("fs");
const path = require("path");

const CONTENT_PATH = path.join(
  __dirname,
  "..",
  "content1",
  "finetuned_easycontent8bCourse1.json"
);

const PLACEHOLDER =
  "Content for this topic is being prepared. Check back soon for detailed learning material.";

// All subtopic titles from TOC (theory then practical), in order
const TOC_TITLES = [
  "Introduction to hand tools and their use",
  "Measuring Introductions",
  "Safety Precautions",
  "Basic electricity",
  "Filing",
  "Drilling",
  "Sawing",
  "Fitting",
  "Purpose of Battery(Theory)",
  "Principle of Battery(Theory)",
  "Function of Battery(Theory)",
  "Construction of Battery(Theory)",
  "Purpose of Starting System(Theory)",
  "Principle of Starting System(Theory)",
  "Function of Starting System(Theory)",
  "Construction of Starting System (Theory)",
  "Purpose of Charging System (Theory)",
  "Principle of Charging System (Theory)",
  "Function of Charging System (Theory)",
  "Construction of Charging System (Theory)",
  "Purpose of Ignition System (Theory)",
  "Principle of Ignition System (Theory)",
  "Function of Ignition System (Theory)",
  "Construction of Ignition System (Theory)",
  "Types of Ignition System (Theory)",
  "Function and Construction of Various Lights, switches, and fuses(Theory)",
  "Horn, Wiper(Theory)",
  "Instrument panel lights and gauges(Theory)",
  "Marking(Practical)",
  "Steel foot rule(Practical)",
  "Vernier caliper(Practical)",
  "Micrometer(Practical)",
  "Dial gauge(Practical)",
  "Feeler gauge(Practical)",
  "Introduction to Fasteners and materials(Practical)",
  "Demonstration with magnet Box(Practical)",
  "Insulation removal, connecting wires tapping, sleeving, connecting thimbles(Practical)",
  "Marking jumper wires and test lamp(Practical)",
  "Use of AVO meter, Use of Ampere and voltmeters in series and parallel circuit, checking voltage drop(Practical)",
  "Soldering Exercises: Fix Joint, eye Joint, and lap joint etc(Practical)",
  "Cautions for battery service (Practical)",
  "Preparation of Electrolyte(Battery) (Practical)",
  "Checking Specific gravity(Battery)(Practical)",
  "Battery charging(Practical)",
  "Battery testing (Practical)",
  "Analysis and troubleshooting of Battery (Practical)",
  "Battery removing and replacing(Practical)",
  "Care of Batteries in stock(Practical)",
  "Making terminals of battery(Practical)",
  "Dry batteries(Practical)",
  "Trouble shooting of Starting System (Practical)",
  "Specifications of Starting System (Practical)",
  "Starting system circuit on vehicle (Practical)",
  "Checking, removal and installation of Starting System (Practical)",
  "Disassembly of Starting System (Practical)",
  "Identification of parts of Starting System (Practical)",
  "Complete checking and inspection of all of Starting System (Practical)",
  "components according to workshop manual of Starting System (Practical)",
  "Assembling of starting motor (Practical)",
  "Performance tests of motor on test bench (Practical)",
  "Trouble shooting of Charging system (Practical)",
  "Specifications of Charging system (Practical)",
  "Charging system checking on vehicle (Practical)",
  "Fan belt adjusting of Charging system(Practical)",
  "Dismantling alternator (Practical)",
  "Parts identification of Charging system(Practical)",
  "Complete inspection of parts of Charging system according to workshop manual (Practical)",
  "Replacing carbon brush and bearing of Charging system (Practical)",
  "Diode testing of Charging system (Practical)",
  "Assembling Alternator of Charging system (Practical)",
  "Double unit voltage Regulator of Charging system (Practical)",
  "Identifying connections and making circuits of Charging system (Practical)",
  "Installing IC regulators (Practical)",
  "Trouble shooting of Ignition System (Practical)",
  "Spark test, inspection of high tension leads of Ignition System (Practical)",
  "Spark plug fouling study (Practical)",
  "Ignition coil checking (Practical)",
  "Ignition circuit checking (Practical)",
  "C.B Point replacing and gap adjusting (Practical)",
  "Setting Ignition timing of Ignition System (Practical)",
  "Checking air gap and pick up coil (Practical)",
  "Dismantling, checking and fitting distributor (Practical)",
  "Fitting C.B point and condenser and starting coil on motorcycle (Practical)",
  "Reading wiring diagrams(Practical)",
  "Legal requirements",
  "Making thimble connectors(Practical)",
  "Color codes of Wiring Circuits on Wiring Board",
  "Head lamp circuit with relay(Practical)",
  "Aiming headlights(Practical)",
  "Parking brake circuit(Practical)",
  "Hazard warning circuit(Practical)",
  "Indicator circuit(Practical)",
  "Brake light circuit(Practical)",
  "Reverse gear light circuits(Practical)",
  "Door and roof light circuit(Practical)",
  "Horn circuit and adjustment(Practical)",
  "Fuel gauge circuit(Practical)",
  "Oil pressure light circuit(Practical)",
  "Trunk and hood light(Practical)",
  "Temperature gauge circuit(Practical)",
  "Brake fluid level light circuit(Practical)",
  "Power window circuit(Practical)",
  "Wind shield and wiper motor circuit(Practical)",
  "Electric Fan circuit(Practical)",
  "Glow plug circuit(Practical)",
  "Electrical shut off valve circuit(Practical)",
  "Radio and speaker circuit(Practical)",
  "Car air conditioning and heating system wiring(Practical)",
  "Work ethics (Practical)",
];

function findContent(oldMap, title) {
  if (oldMap[title]) return oldMap[title];
  const trimmed = title.trim();
  if (oldMap[trimmed]) return oldMap[trimmed];
  for (const k of Object.keys(oldMap)) {
    if (k.trim() === trimmed) return oldMap[k];
  }
  // Merged key in original JSON
  const merged =
    "Construction of Battery(Theory) Purpose of Starting System(Theory) ";
  if (
    trimmed === "Construction of Battery(Theory)" ||
    trimmed === "Purpose of Starting System(Theory)"
  ) {
    if (oldMap[merged]) return oldMap[merged];
    for (const k of Object.keys(oldMap)) {
      if (k.includes("Construction of Battery") && k.includes("Purpose of Starting"))
        return oldMap[k];
    }
  }
  return null;
}

const oldContent = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf-8"));
const newContent = {};

for (const title of TOC_TITLES) {
  const content = findContent(oldContent, title);
  newContent[title] = content || PLACEHOLDER;
}

// Preserve old keys that differ by whitespace so content API lookup still works (e.g. " Measuring Introductions")
const newKeysSet = new Set(Object.keys(newContent).map((t) => t.trim()));
for (const k of Object.keys(oldContent)) {
  if (newContent[k]) continue;
  const trimmed = k.trim();
  if (!newKeysSet.has(trimmed)) {
    newContent[k] = oldContent[k];
    newKeysSet.add(trimmed);
  }
}

fs.writeFileSync(CONTENT_PATH, JSON.stringify(newContent), "utf-8");
console.log(
  "Reorganized content1 JSON. Total keys:",
  Object.keys(newContent).length
);

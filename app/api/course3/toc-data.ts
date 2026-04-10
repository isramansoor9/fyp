/**
 * Course 3 static TOC matching course3.pdf.
 * Semester 1: Workshop Practice (topic 1) with 10 subtopics, some with sub-subtopics; then Internal combustion engine, Basic Electricity/Electronics, etc.
 * Semester 2: Charging Circuit/Voltage Regulators, Wiring Circuits and Accessories, etc.
 * All content keys match content3/Course3-1 and Course3-2 JSON keys for lookup.
 */

export interface SubSubtopic {
  id: string;
  title: string;
  contentKey: string;
}

export interface Subtopic {
  id: string;
  title: string;
  contentKey: string;
  subSubtopics?: SubSubtopic[];
}

export interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

export interface Course3Toc {
  semester: string;
  topics: Topic[];
}

const S1 = " (Theory + Practical)";
const S1_ = "(Theory + Practical)";

/** Semester 1 – 1st Semester from course3.pdf */
export const COURSE3_SEMESTER1: Course3Toc = {
  semester: "1",
  topics: [
    {
      id: "1",
      title: "Workshop Practice",
      subtopics: [
        { id: "1.1", title: "Safety precautions", contentKey: "Safety precautions" + S1 },
        { id: "1.2", title: "Use of PPEs", contentKey: "Use of PPEs" + S1_ },
        { id: "1.3", title: "Causes of fire and types of fire", contentKey: "Causes of fire and types of fire" + S1_ },
        { id: "1.4", title: "Firefighting techniques", contentKey: "Firefighting techniques" + S1_ },
        { id: "1.5", title: "Occupational health and first aid", contentKey: "Occupational health and first aid" + S1_ },
        {
          id: "1.6",
          title: "Introduction of trade tools, Machinery & Equipment",
          contentKey: "Introduction of trade tools , Machinery & Equipment" + S1_,
          subSubtopics: [
            { id: "1.6.1", title: "Different type of pliers and cutters", contentKey: "Different type of pliers and cutters (Introduction of trade tools , Machinery & Equipment)" + S1 },
            { id: "1.6.2", title: "Different types of screw drivers and wrenches", contentKey: "Different types of screw drivers and wrenches (Introduction of trade tools , Machinery & Equipment)" + S1 },
            { id: "1.6.3", title: "Fasteners (Permanent and Temporary)", contentKey: "Fasteners (Permanent and Temporary) (Introduction of trade tools , Machinery & Equipment)" + S1 },
            { id: "1.6.4", title: "Purpose and working of Fitting tools", contentKey: "Purpose and working of Fitting tools (Introduction of trade tools , Machinery & Equipment)" + S1 },
            { id: "1.6.5", title: "Multimeter", contentKey: "Multimeter (Introduction of trade tools , Machinery & Equipment)" + S1 },
            { id: "1.6.6", title: "Hydro meter", contentKey: "Hydro meter (Introduction of trade tools , Machinery & Equipment)" + S1 },
            { id: "1.6.7", title: "Teco meter", contentKey: "Teco meter (Introduction of trade tools , Machinery & Equipment)" + S1 },
            { id: "1.6.8", title: "Oscilloscope", contentKey: "Oscilloscope (Introduction of trade tools , Machinery & Equipment)" + S1 },
            { id: "1.6.9", title: "Smoke tester", contentKey: "Smoke tester (Introduction of trade tools , Machinery & Equipment)" + S1 },
            { id: "1.6.10", title: "Feeler gauge", contentKey: "Feeler gauge (Introduction of trade tools , Machinery & Equipment)" + S1 },
            { id: "1.6.11", title: "Spark plug cleaner", contentKey: "Spark plug cleaner (Introduction of trade tools , Machinery & Equipment)" + S1 },
          ],
        },
        {
          id: "1.7",
          title: "Measuring and tools used in measuring",
          contentKey: "Measuring and tools used in measuring",
          subSubtopics: [
            { id: "1.7.1", title: "Measuring tape", contentKey: "Measuring tape (Measuring and tools used in measuring)" + S1 },
            { id: "1.7.2", title: "Vertical venire", contentKey: "Vertical venire (Measuring and tools used in measuring)" + S1 },
            { id: "1.7.3", title: "Head light Aim tester", contentKey: "Head light Aim tester (Measuring and tools used in measuring)" + S1 },
          ],
        },
        { id: "1.8", title: "Marking", contentKey: "Marking in Workshop Practice  " },
        {
          id: "1.9",
          title: "Cleaning tools",
          contentKey: "Cleaning tools in Workshop Practice  ",
          subSubtopics: [
            { id: "1.9.1", title: "Contact cleaner", contentKey: "Contact cleaner (Cleaning tools) in Workshop Practice  " },
            { id: "1.9.2", title: "Rust remover", contentKey: "Rust remover (Cleaning tools) in Workshop Practice  " },
            { id: "1.9.3", title: "Hot water treatment", contentKey: "Hot water treatment (Cleaning tools)" + S1 + " in Workshop Practice  " },
            { id: "1.9.4", title: "Carb cleaner", contentKey: "Carb cleaner (Cleaning tools)" + S1_ + " in Workshop Practice " },
            { id: "1.9.5", title: "Multipurpose lubricant", contentKey: "Multipurpose lubricant (Cleaning tools) in Workshop Practice  " + S1 },
          ],
        },
        { id: "1.10", title: "Fitting tools", contentKey: "Fitting tools in Workshop Practice" + S1_ },
      ],
    },
    {
      id: "2",
      title: "Internal combustion engine",
      subtopics: [
        { id: "2.1", title: "Introduction to Internal combustion", contentKey: "Introduction to Internal combustion" + S1_ },
        { id: "2.2", title: "Types of IC Engine", contentKey: "Types of IC Engine" + S1_ },
        { id: "2.3", title: "Major Parts and components of IC engine", contentKey: "Major Parts and components of IC engine" + S1_ },
        { id: "2.4", title: "Systems of engine", contentKey: "Systems of engine" + S1_ },
        { id: "2.5", title: "Difference between Spark ignition and Compression ignition engine", contentKey: "Difference between Spark ignition and Compression ignition engine" + S1_ },
      ],
    },
    {
      id: "3",
      title: "Basic Electricity / Electronics",
      subtopics: [
        {
          id: "3.1",
          title: "Application of electricity",
          contentKey: "Application of electricity" + S1_,
          subSubtopics: [
            { id: "3.1.1", title: "Atomic structure of matter and electricity", contentKey: "Atomic structure of matter and electricity (Application of electricity)" + S1 },
            { id: "3.1.2", title: "Conductor, insulator, semi conductor", contentKey: "Conductor, insulator, semi conductor (Application of electricity)" + S1 },
            { id: "3.1.3", title: "Diodes and transistors", contentKey: "Diodes and transistors (Application of electricity)" + S1 },
            { id: "3.1.4", title: "Current, voltage and resistance", contentKey: "Current, voltage and resistance (Application of electricity)" + S1 },
            { id: "3.1.5", title: "Ohm's law", contentKey: "Ohm\u2019s law (Application of electricity)" + S1 },
            { id: "3.1.6", title: "Magnet and magnetism", contentKey: "Magnet and magnetism (Application of electricity)" + S1 },
            { id: "3.1.7", title: "Left hand rule, electromagnet", contentKey: "Left hand rule, electromagnet (Application of electricity)" + S1 },
          ],
        },
        {
          id: "3.2",
          title: "Components of electrical circuits",
          contentKey: "Components of electrical circuits" + S1_ + "Resistances and their coding, Relays, solenoid, printed, circuits, circuit breaker, fuse, types of bulb and lamps, timers, terminals and switches. (Components of electrical circuits)" + S1,
          subSubtopics: [
            { id: "3.2.1", title: "Resistances and their coding, Relays, solenoid, printed circuits, circuit breaker, fuse, types of bulb and lamps, timers, terminals and switches", contentKey: "Components of electrical circuits" + S1_ + "Resistances and their coding, Relays, solenoid, printed, circuits, circuit breaker, fuse, types of bulb and lamps, timers, terminals and switches. (Components of electrical circuits)" + S1 },
            { id: "3.2.2", title: "Series and parallel circuits", contentKey: "Series and parallel circuits (Components of electrical circuits)" + S1 },
            { id: "3.2.3", title: "Combined series & Parallel circuits and their characteristics", contentKey: "Combined series & Parallel circuits and their characteristics (Components of electrical circuits)" + S1 },
            { id: "3.2.4", title: "Ampere meter and volt meter in circuits", contentKey: "Ampere meter and volt meter in circuits (Components of electrical circuits)" + S1 },
          ],
        },
        { id: "3.3", title: "Integrated circuits, Capacitors, diodes, transistors", contentKey: "Integrated circuits, Capacitors, diodes, transistors" + S1_ },
        { id: "3.4", title: "Interpretation of circuit diagram (EWD)", contentKey: "Interpretation of circuit diagram (EWD)" + S1 },
        { id: "3.5", title: "Instrument cluster gauges and meters", contentKey: "Instrument cluster gauges and meters" + S1_ },
      ],
    },
    {
      id: "4",
      title: "Storage Battery",
      subtopics: [
        { id: "4.1", title: "Purpose and types of battery", contentKey: "Purpose and types of battery" + S1_ },
        { id: "4.2", title: "Construction and identification of battery parts", contentKey: "Construction and identification of battery parts" + S1_ },
        { id: "4.3", title: "Electrolyte and its characteristics", contentKey: "Electrolyte and its characteristics" + S1_ },
        { id: "4.4", title: "Charging and discharging of battery", contentKey: "Charging and discharging of battery" + S1_ },
        { id: "4.5", title: "Battery rating", contentKey: "Battery rating" + S1_ },
        { id: "4.6", title: "Usage of Battery charger (fast and slow charging)", contentKey: "Usage of Battery charger (fast and slow charging)" + S1 },
        { id: "4.7", title: "Battery tester (reading magnet eye)", contentKey: "Battery tester (reading magnet eye)" + S1 },
        { id: "4.8", title: "Use of jumper cables", contentKey: "Use of jumper cables" + S1_ },
        {
          id: "4.9",
          title: "Types of storage batteries",
          contentKey: "Types of storage batteries" + S1_,
          subSubtopics: [
            { id: "4.9.1", title: "Lead acid", contentKey: "Lead acid (Types of storage batteries)" + S1 },
            { id: "4.9.2", title: "Lithium ion", contentKey: "Lithium ion (Types of storage batteries)" + S1 },
            { id: "4.9.3", title: "Nickel Cadmium", contentKey: "Nickel Cadmium (Types of storage batteries)" + S1 },
            { id: "4.9.4", title: "Nickel-Metal Hydride", contentKey: "Nickel-Metal Hydride (Types of storage batteries)" + S1 },
          ],
        },
      ],
    },
    {
      id: "5",
      title: "Self-Starter",
      subtopics: [
        {
          id: "5.1",
          title: "Self-starter & its components",
          contentKey: "Self-starter & its components" + S1_,
          subSubtopics: [
            { id: "5.1.1", title: "Purpose and Principle of self-starter", contentKey: "Purpose and Principle of self-starter (Self-starter & its components )" + S1 },
            { id: "5.1.2", title: "Construction and Function of self-starter", contentKey: "Construction and Function of self-starter (Self-starter & its components )" + S1 },
            { id: "5.1.3", title: "Neutral safety switch", contentKey: "Neutral safety switch (Self-starter & its components )" + S1 },
            { id: "5.1.4", title: "Remote switch", contentKey: "Remote switch (Self-starter & its components )" + S1 },
            { id: "5.1.5", title: "Applied brake start system", contentKey: "Applied brake start system (Self-starter & its components )" + S1 },
          ],
        },
      ],
    },
    {
      id: "6",
      title: "Ignition System",
      subtopics: [
        { id: "6.1", title: "Purpose", contentKey: "Purpose of Ignition System " + S1 },
        { id: "6.2", title: "Principal", contentKey: "Principal of Ignition System " + S1 },
        {
          id: "6.3",
          title: "Types of ignition systems",
          contentKey: "Types of ignition systems" + S1_,
          subSubtopics: [
            { id: "6.3.1", title: "Magneto ignition system", contentKey: "Magneto ignition system (Types of ignition systems)" + S1 },
            { id: "6.3.2", title: "Capacitor discharge ignition", contentKey: "Capacitor discharge ignition (Types of ignition systems)" + S1 },
            { id: "6.3.3", title: "Mechanically timed ignition", contentKey: "Mechanically timed ignition (Types of ignition systems)" + S1 },
            { id: "6.3.4", title: "Single coil and Multi coil ignition", contentKey: "Single coil and Multi coil ignition (Types of ignition systems)" + S1 },
            { id: "6.3.5", title: "Cross fire (Spark waste) ignition", contentKey: "Cross fire (Spark waste) ignition (Types of ignition systems)" + S1 },
            { id: "6.3.6", title: "Distributer type ignition system", contentKey: "Distributer type ignition system (Types of ignition systems)" + S1 },
            { id: "6.3.7", title: "Distributor less ignition", contentKey: "Distributor less ignition (Types of ignition systems)" + S1 },
            { id: "6.3.8", title: "Electronic Ignition and digital electronic ignition system", contentKey: "Electronic Ignition and digital electronic ignition system (Types of ignition systems)" + S1 },
            { id: "6.3.9", title: "High energy ignition", contentKey: "High energy ignition (Types of ignition systems)" + S1 },
            { id: "6.3.10", title: "Hall effect ignition", contentKey: "Hall effect ignition (Types of ignition systems)" + S1 },
            { id: "6.3.11", title: "Electronic Diesel fuel ignition (EDFI)", contentKey: "Electronic Diesel fuel ignition (EDFI) (Types of ignition systems)" + S1 },
          ],
        },
        { id: "6.4", title: "Construction and components of ignitions systems", contentKey: "Construction and components of ignitions systems" + S1_ },
        { id: "6.5", title: "Spark plug and its types", contentKey: "Spark plug and its types" + S1_ },
        { id: "6.6", title: "Glow plug and their function", contentKey: "Glow plug and their function" + S1_ },
      ],
    },
    {
      id: "7",
      title: "Technical Drawing - I",
      subtopics: [
        { id: "7.1", title: "Lines, lettering, dimensioning", contentKey: "Lines, lettering, dimensioning" + S1 },
        { id: "7.2", title: "Identification of Electrical symbols", contentKey: "Identification of Electrical symbols" + S1 },
        { id: "7.3", title: "Series and parallel and combined circuits", contentKey: "Series and parallel and combined circuits" + S1 },
        { id: "7.4", title: "Drawing of radiator fan circuit of car", contentKey: "Drawing of radiator fan circuit of car" + S1 },
        { id: "7.5", title: "Drawing of wind screen wiper circuit of car", contentKey: "Drawing of wind screen wiper circuit of car" + S1 },
        { id: "7.6", title: "Drawing of Magnet ignition (Circuit completion)", contentKey: "Drawing of Magnet ignition (Circuit completion)" + S1 },
        { id: "7.7", title: "Drawing of Battery coil ignition (Circuit completion)", contentKey: "Drawing of Battery coil ignition (Circuit completion)" + S1 },
        { id: "7.8", title: "Drawing of Horn circuit", contentKey: "Drawing of Horn circuit" + S1 },
        { id: "7.9", title: "Drawing of Head lamp and parking light circuit", contentKey: "Drawing of Head lamp and parking light circuit" + S1 },
        { id: "7.10", title: "Drawing of Indicator circuit", contentKey: "Drawing of Indicator circuit" + S1 },
        { id: "7.11", title: "Drawing of Wiper motor circuit", contentKey: "Drawing of Wiper motor circuit" + S1 },
        { id: "7.12", title: "Drawing of Door and roof light circuit", contentKey: "Drawing of Door and roof light circuit" + S1 },
        { id: "7.13", title: "Drawing of Charging circuit (with electronic regulator)", contentKey: "Drawing of Charging circuit (with electronic regulator)" + S1 },
        { id: "7.14", title: "Drawing of capacitor discharge ignition system of car", contentKey: "Drawing of capacitor discharge ignition system of car" + S1 },
        { id: "7.15", title: "Reading circuit diagrams of different cars from manual", contentKey: "Reading circuit diagrams of different cars from manual(Theory)" },
      ],
    },
    {
      id: "8",
      title: "Technical Mathematics - I",
      subtopics: [
        { id: "8.1", title: "Simple addition, subtraction", contentKey: "Simple addition, subtraction(Theory)" },
        { id: "8.2", title: "Multiplication and division", contentKey: "multiplication and division(Theory)" },
        { id: "8.3", title: "Conversion of fraction to decimals", contentKey: "Conversion of fraction to decimals(Theory)" },
        { id: "8.4", title: "Percentage", contentKey: "Percentage(Theory)" },
        { id: "8.5", title: "Square and under root", contentKey: "Square and under root(Theory)" },
      ],
    },
    {
      id: "9",
      title: "Industrial tour",
      subtopics: [{ id: "9.1", title: "Industrial tour", contentKey: "Industrial tour(Theory)" }],
    },
    {
      id: "10",
      title: "Functional English",
      subtopics: [{ id: "10.1", title: "Functional English", contentKey: "Functional English" }],
    },
    {
      id: "11",
      title: "Work Ethics",
      subtopics: [{ id: "11.1", title: "Work Ethics", contentKey: "Work Ethics" }],
    },
  ],
};

const S2 = " (Theory + Practical)";
const S2_ = "(Theory + Practical)";
const CON = " (Construction of circuits)";
const EFI = " (EFI Components and their working (microprocessor, sensors and actuators))";
const BRAKE = " (Braking system)";
const DRIVE = " (Drive assist systems)";
const AUTO = " (Automatic transmission controls)";
const SUSP = " (Suspension system)";
const HYBRID = " (Types of hybrid system (Hybrid vehicles))";
const ALT = " (Introduction to alternative fuel and emission less vehicles)";
const DIAG = " (Usage of Diagnostic scanner)";
const HEAT = " (Heating system)";

/** Semester 2 – 2nd Semester from course3.pdf */
export const COURSE3_SEMESTER2: Course3Toc = {
  semester: "2",
  topics: [
    {
      id: "1",
      title: "Charging Circuit / Voltage Regulators",
      subtopics: [
        {
          id: "1.1",
          title: "Charging Systems",
          contentKey: " Charging Systems" + S2_,
          subSubtopics: [
            { id: "1.1.1", title: "Purpose", contentKey: " Purpose (Charging Systems)" + S2 },
            { id: "1.1.2", title: "Construction and operation of double point voltage regulator", contentKey: "Construction and operation of double point voltage regulator (Charging Systems)" + S2 },
            { id: "1.1.3", title: "Type of voltage regulator", contentKey: "Type of voltage regulator (Charging Systems)" + S2 },
            { id: "1.1.4", title: "Electronic regulators", contentKey: "Electronic regulators (Charging Systems)" + S2 },
          ],
        },
        {
          id: "1.2",
          title: "Alternator",
          contentKey: "Alternator" + S2_,
          subSubtopics: [
            { id: "1.2.1", title: "Purpose and Principle of Alternator", contentKey: "Purpose and Principle of Alternator (Alternator)" + S2 },
            { id: "1.2.2", title: "Construction and Function of Alternator", contentKey: "Construction and Function of Alternator (Alternator)" + S2 },
          ],
        },
      ],
    },
    {
      id: "2",
      title: "Wiring Circuits and Accessories",
      subtopics: [
        {
          id: "2.1",
          title: "Construction of circuits",
          contentKey: "Construction of circuits" + S2_,
          subSubtopics: [
            { id: "2.1.1", title: "Horn circuit", contentKey: " Horn circuit" + CON + S2 },
            { id: "2.1.2", title: "Head lamps circuit, other lights", contentKey: "Head lamps circuit, other lights" + CON + S2 },
            { id: "2.1.3", title: "Directional signal circuit", contentKey: "Directional signal circuit" + CON + S2 },
            { id: "2.1.4", title: "Roof light circuit", contentKey: " Roof light circuit" + CON + S2 },
            { id: "2.1.5", title: "High low beam circuit", contentKey: "High low beam circuit" + CON + S2 },
            { id: "2.1.6", title: "Wind shield wipers/washers circuit", contentKey: "Wind shield wipers/washers circuit" + CON + S2 },
            { id: "2.1.7", title: "Power windows circuit", contentKey: "Power windows circuit" + CON + S2 },
            { id: "2.1.8", title: "Radiator fan circuit", contentKey: "Radiator fan circuit" + CON + S2 },
            { id: "2.1.9", title: "Cigrate lighter circuit", contentKey: "Cigrate lighter circuit" + CON + S2 },
            { id: "2.1.10", title: "Multimedia control circuits", contentKey: "multimedia control circuits" + CON + S2 },
            { id: "2.1.11", title: "Sun roof circuit", contentKey: "Sun roof circuit" + CON + S2 },
            { id: "2.1.12", title: "Panoramic roof circuit", contentKey: "Panoramic roof circuit" + CON + S2 },
            { id: "2.1.13", title: "Auto light control circuits", contentKey: "Auto light control circuits" + CON + S2 },
            { id: "2.1.14", title: "Indicator light circuit", contentKey: "Indicator light circuit" + CON + S2 },
            { id: "2.1.15", title: "Auto side view mirror close circuit", contentKey: "Auto side view mirror close circuit" + CON + S2 },
            { id: "2.1.16", title: "Fog light circuit", contentKey: "Fog light circuit" + CON + S2 },
            { id: "2.1.17", title: "Parking light circuit", contentKey: "Parking light circuit" + CON + S2 },
            { id: "2.1.18", title: "Electric power steering circuit", contentKey: "Electric power steering circuit" + CON + S2 },
            { id: "2.1.19", title: "Electronic power steering column control circuit (tilt and telescopic)", contentKey: "Electronic power steering column control circuit (tilt and telescopic)" + CON + S2 },
            { id: "2.1.20", title: "Electric seat adjustment circuit", contentKey: "Electric seat adjustment circuit" + CON + S2 },
            { id: "2.1.21", title: "Seat heating and ventilation circuit", contentKey: "Seat heating and ventilation circuit" + CON + S2 },
            { id: "2.1.22", title: "Seat massager circuit", contentKey: "Seat massager circuit" + CON + S2 },
            { id: "2.1.23", title: "Service interval reset system", contentKey: "Service interval reset system" + CON + S2 },
            { id: "2.1.24", title: "Sun wiser light circuit", contentKey: "Sun wiser light circuit" + CON + S2 },
            { id: "2.1.25", title: "Soft top convertible circuit", contentKey: "Soft top convertible circuit" + CON + S2 },
            { id: "2.1.26", title: "Hard top convertible circuit", contentKey: "Hard top convertible circuit" + CON + S2 },
            { id: "2.1.27", title: "Door soft closing circuit", contentKey: "Door soft closing circuit" + CON + S2 },
            { id: "2.1.28", title: "Electric trank lid open circuit", contentKey: "Electric trank lid open circuit" + CON + S2 },
            { id: "2.1.29", title: "Electric fuel tank filling cap opener circuit", contentKey: "Electric fuel tank filling cap opener circuit" + CON + S2 },
            { id: "2.1.30", title: "Heating and ventilating circuit", contentKey: "Heating and ventilating circuit" + CON + S2 },
            { id: "2.1.31", title: "Defogger circuit", contentKey: "Defogger circuit" + CON + S2 },
            { id: "2.1.32", title: "Side view mirror control circuit", contentKey: "Side view mirror control circuit" + CON + S2 },
            { id: "2.1.33", title: "Fuel system circuit", contentKey: "Fuel system circuit" + CON + S2 },
            { id: "2.1.34", title: "Engine fan circuit", contentKey: "Engine fan circuit" + CON + S2 },
          ],
        },
        { id: "2.2", title: "Interpretation of signs and symbols of instrument panel indicators", contentKey: "interpretation of signs and symbols of instrument panel indicators" + S2_ },
      ],
    },
    {
      id: "3",
      title: "Electronically Controlled vehicle systems and sensors",
      subtopics: [
        { id: "3.1", title: "Purpose, construction and working of microprocessors and integrated circuit", contentKey: "Purpose, construction and working of microprocessors and integrated circuit" + S2_ },
        {
          id: "3.2",
          title: "EFI Components and their working (microprocessor, sensors and actuators)",
          contentKey: "EFI Components and their working (microprocessor, sensors and actuators)" + S2_,
          subSubtopics: [
            { id: "3.2.1", title: "Oxygen sensor", contentKey: "Oxygen sensor" + EFI + S2 },
            { id: "3.2.2", title: "Knock Sensor, variable valve lift (VVI) cam sensor (VVTI) actuator", contentKey: "Knock Sensor variable valve lift (VVI) cam sensor (VVTI) actuator  " + EFI + S2 },
            { id: "3.2.3", title: "Manifold Absolute Pressure (MAP) Sensor", contentKey: "Manifold Absolute Pressure (MAP) Sensor" + EFI + S2 },
            { id: "3.2.4", title: "Mass Air Flow (MAF) sensor", contentKey: "Mass Air Flow (MAF) sensor" + EFI + S2 },
            { id: "3.2.5", title: "Throttle Position (TP) sensor", contentKey: "Throttle Position (TP) sensor" + EFI + S2 },
            { id: "3.2.6", title: "Accelerator paddle position sensor", contentKey: "Accelerator paddle position sensor" + EFI + S2 },
            { id: "3.2.7", title: "Body accelerator sensor", contentKey: "Body accelerator sensor" + EFI + S2 },
            { id: "3.2.8", title: "Lateral Acceleration sensor", contentKey: "Lateral Acceleration sensor" + EFI + S2 },
            { id: "3.2.9", title: "Deceleration sensor", contentKey: "Deceleration sensor" + EFI + S2 },
            { id: "3.2.10", title: "Cam position sensor", contentKey: "Cam position sensor" + EFI + S2 },
            { id: "3.2.11", title: "Crank Position sensor", contentKey: "Crank Position sensor" + EFI + S2 },
            { id: "3.2.12", title: "Oil pressure sensor", contentKey: "Oil pressure sensor" + EFI + S2 },
            { id: "3.2.13", title: "Fuel level sensor", contentKey: "Fuel level sensor" + EFI + S2 },
            { id: "3.2.14", title: "Fuel pump (primary & secondary) sensor", contentKey: "Fuel pump (primary & secondary) sensor" + EFI + S2 },
            { id: "3.2.15", title: "Fuel injectors (actuators)", contentKey: "Fuel injectors (actuators)" + EFI + S2 },
            { id: "3.2.16", title: "Electric Secondary air injection pump", contentKey: "Electric Secondary air injection pump" + EFI + S2 },
            { id: "3.2.17", title: "Coolant temperature sensor", contentKey: "Coolant temperature sensor" + EFI + S2 },
          ],
        },
        { id: "3.3", title: "Coolant level sensor", contentKey: "Coolant level sensor" + S2_ },
        { id: "3.4", title: "Electric coolant flow system", contentKey: "Electric coolant flow system" + S2_ },
        { id: "3.5", title: "Electric coolant flow valve control (Thermostat)", contentKey: "Electric coolant flow valve control (Thermostat)" + S2_ },
        { id: "3.6", title: "Electronic Engine suction fan", contentKey: "Electronic Engine suction fan" + S2_ },
        { id: "3.7", title: "Engine fan speed control module", contentKey: "Engine fan speed control module" + S2_ },
        {
          id: "3.8",
          title: "Braking system",
          contentKey: "Braking system" + S2_,
          subSubtopics: [
            { id: "3.8.1", title: "Brake fluid level sensor", contentKey: "Brake fluid level sensor" + BRAKE + S2 },
            { id: "3.8.2", title: "Brake fluid pressure sensor", contentKey: "Brake fluid pressure sensor" + BRAKE + S2 },
            { id: "3.8.3", title: "Brake paddle travel sensor", contentKey: "Brake paddle travel sensor" + BRAKE + S2 },
            { id: "3.8.4", title: "Brake booster vacuum sensor", contentKey: "Brake booster vacuum sensor" + BRAKE + S2 },
            { id: "3.8.5", title: "Electronic brake force distribution system", contentKey: "Electronic brake force distribution system" + BRAKE + S2 },
            { id: "3.8.6", title: "Anti-lock brake (skidding) system", contentKey: "Anti-lock brake(skidding) system" + BRAKE + S2 },
            { id: "3.8.7", title: "Senstronic brake control system", contentKey: "Senstronic brake control system" + BRAKE + S2 },
            { id: "3.8.8", title: "Electric wedge brake system (EWB)", contentKey: "Electric wedge brake system (EWB)" + BRAKE + S2 },
            { id: "3.8.9", title: "Electric Brake hold system", contentKey: "Electric Brake hold system" + BRAKE + S2 },
            { id: "3.8.10", title: "Electric brake force distribution (EBD) system", contentKey: "Electric brake force distribution (EBD) system" + BRAKE + S2 },
            { id: "3.8.11", title: "Brake assist (extra force apply) system", contentKey: "Brake assist( extra force apply ) system" + BRAKE + S2 },
            { id: "3.8.12", title: "Regenerative brake system", contentKey: "Regenerative brake system" + BRAKE + S2 },
            { id: "3.8.13", title: "Brake wear indication system", contentKey: "Brake wear indication system" + BRAKE + S2 },
          ],
        },
        { id: "3.9", title: "Catalytic convertor temperature sensor", contentKey: "Catalytic convertor temperature sensor" + S2_ },
        { id: "3.10", title: "Turbo boost pressure sensor", contentKey: "Turbo boost pressure sensor" + S2_ },
        { id: "3.11", title: "Intake Air Temperature (IAT) sensor", contentKey: "Intake Air Temperature (IAT) sensor" + S2_ },
        { id: "3.12", title: "Rain sensor", contentKey: "Rain sensor" + S2_ },
        { id: "3.13", title: "Curb height control sensor", contentKey: "Curb height control sensor" + S2_ },
        { id: "3.14", title: "Wheel Speed Sensor", contentKey: "Wheel Speed Sensor" + S2_ },
        { id: "3.15", title: "Fuel tank filling lock system", contentKey: "Fuel tank filling lock system" + S2_ },
        { id: "3.16", title: "Keyless entry system", contentKey: "Keyless entry system" + S2_ },
        { id: "3.17", title: "Keyless start (Push start) system", contentKey: "Keyless start (Push start) system" + S2_ },
        { id: "3.18", title: "Basic of key programing", contentKey: "Basic of key programing" + S2_ },
        { id: "3.19", title: "Auto wiper system", contentKey: "Auto wiper system" + S2_ },
        { id: "3.20", title: "Auto light system", contentKey: "Auto light system" + S2_ },
        { id: "3.21", title: "Rear window power sunshade", contentKey: "Rear window power sunshade" + S2_ },
        { id: "3.22", title: "Overhead control panel", contentKey: "Overhead control panel" + S2_ },
        { id: "3.23", title: "Active distronic system", contentKey: "Active distronic system" + S2_ },
        { id: "3.24", title: "Interior illumination system", contentKey: "Interior illumination system" + S2_ },
        { id: "3.25", title: "Night vision display system", contentKey: "Night vision display system" + S2_ },
        {
          id: "3.26",
          title: "Safety and security",
          contentKey: "Safety and security" + S2_,
          subSubtopics: [
            { id: "3.26.1", title: "SRS air bag", contentKey: "SRS air bag (Safety and security)" + S2 },
            { id: "3.26.2", title: "Electronic battery safety terminals", contentKey: "Electronic battery safety terminals (Safety and security)" + S2 },
            { id: "3.26.3", title: "Child lock system", contentKey: "Child lock system (Safety and security)" + S2 },
            { id: "3.26.4", title: "Center locking system (Electric center locking, vacuum center locking)", contentKey: "Center locking system (Electric center locking .vacuum center locking) (Safety and security)" + S2 },
            { id: "3.26.5", title: "Navigation system", contentKey: "Navigation system (Safety and security)" + S2 },
            { id: "3.26.6", title: "Electric lid (Bonnet & Trunk) and door operating system", contentKey: "Electric lid (Bonnet & Trunk) and door operating system (Safety and security)" + S2 },
            { id: "3.26.7", title: "Tyre pressure monitoring system", contentKey: "Tyre pressure monitoring system (Safety and security)" + S2 },
            { id: "3.26.8", title: "Radar system", contentKey: "Radar system (Safety and security)" + S2 },
            { id: "3.26.9", title: "Vehicle immobilizer system", contentKey: "Vehicle immobilizer system (Safety and security)" + S2 },
            { id: "3.26.10", title: "Vehicle tracking system", contentKey: "Vehicle tracking system (Safety and security)" + S2 },
          ],
        },
        {
          id: "3.27",
          title: "Drive assist systems",
          contentKey: "Drive assist systems" + S2_,
          subSubtopics: [
            { id: "3.27.1", title: "Auto start, stop system", contentKey: "Auto start , stop system" + DRIVE + S2 },
            { id: "3.27.2", title: "Lane keeping assist system", contentKey: "Lane keeping assist system" + DRIVE + S2 },
            { id: "3.27.3", title: "Electric stability control system", contentKey: "Electric stability control system" + DRIVE + S2 },
            { id: "3.27.4", title: "Electric stability program system", contentKey: "Electric stability program system" + DRIVE + S2 },
            { id: "3.27.5", title: "Remote parking, auto parking system", contentKey: "Remote parking , auto parking system" + DRIVE + S2 },
            { id: "3.27.6", title: "Eco Idle drive system", contentKey: "Eco Idle drive system" + DRIVE + S2 },
            { id: "3.27.7", title: "Sports drive system", contentKey: "Sports drive system" + DRIVE + S2 },
            { id: "3.27.8", title: "Active speed limit control system", contentKey: "Active speed limit control system" + DRIVE + S2 },
            { id: "3.27.9", title: "Drive mode control system", contentKey: "Drive mode control system" + DRIVE + S2 },
            { id: "3.27.10", title: "Speed command system", contentKey: "Speed command system" + DRIVE + S2 },
            { id: "3.27.11", title: "Auto pilot system", contentKey: "Auto pilot system" + DRIVE + S2 },
            { id: "3.27.12", title: "Triptronic system", contentKey: "Triptronic system" + DRIVE + S2 },
            { id: "3.27.13", title: "Active blind spot assist system", contentKey: "Active blind spot assist system" + DRIVE + S2 },
            { id: "3.27.14", title: "Active steering system in sleep mode", contentKey: "Active steering system in sleep mode" + DRIVE + S2 },
            { id: "3.27.15", title: "Active lane change system", contentKey: "Active lane change system" + DRIVE + S2 },
            { id: "3.27.16", title: "Active steering system in lane control", contentKey: "Active steering system in lane control" + DRIVE + S2 },
          ],
        },
        {
          id: "3.28",
          title: "Automatic transmission controls",
          contentKey: "Automatic transmission controls" + S2_,
          subSubtopics: [
            { id: "3.28.1", title: "Traction control system", contentKey: "Traction control system" + AUTO + S2 },
            { id: "3.28.2", title: "Dynamic drive control system", contentKey: "Dynamic drive control system" + AUTO + S2 },
            { id: "3.28.3", title: "Adaptive dynamic drive control system", contentKey: "Adaptive dynamic drive control system" + AUTO + S2 },
            { id: "3.28.4", title: "Cruise control system", contentKey: "Cruise control system" + AUTO + S2 },
            { id: "3.28.5", title: "Skid control system", contentKey: "Skid control system" + AUTO + S2 },
            { id: "3.28.6", title: "Parktronic system", contentKey: "Parktronic system" + AUTO + S2 },
            { id: "3.28.7", title: "Electronic control of Manual transmission", contentKey: "electronic control of Manual transmission" + AUTO + S2 },
            { id: "3.28.8", title: "Automatic transmission system", contentKey: "Automatic transmission system" + AUTO + S2 },
            { id: "3.28.9", title: "CVT system", contentKey: "CVT system" + AUTO + S2 },
            { id: "3.28.10", title: "Dual clutch transmission system, Hydromantic transmission system, Transfer case system", contentKey: "Dual clutch transmission system Hydromantic transmission system Transfer case system  " + AUTO + S2 },
            { id: "3.28.11", title: "4x4 drives, X Drive electric control system", contentKey: "4x4 drives. X Drive electric control system" + AUTO + S2 },
          ],
        },
        {
          id: "3.29",
          title: "Suspension system",
          contentKey: "Suspension system" + S2_,
          subSubtopics: [
            { id: "3.29.1", title: "Electronic drive mode (soft hard drive) controlled circuits in Suspension system", contentKey: "Electronic drive mode (soft hard drive)controlled circuits in Suspension system" + SUSP + S2 },
            { id: "3.29.2", title: "Pneumatic suspension system", contentKey: " Pneumatic suspension system" + SUSP + S2 },
            { id: "3.29.3", title: "Hydraulic suspension system", contentKey: "Hydraulic suspension system" + SUSP + S2 },
            { id: "3.29.4", title: "Dynamic stability control system", contentKey: "Dynamic stability control system" + SUSP + S2 },
          ],
        },
        {
          id: "3.30",
          title: "Hybrid vehicles",
          contentKey: "Hybrid vehicles",
          subSubtopics: [
            { id: "3.30.1", title: "Types of hybrid system", contentKey: "Types of hybrid system (Hybrid vehicles)" + S2 },
            { id: "3.30.2", title: "Mild parallel hybrid", contentKey: "Mild parallel hybrid" + HYBRID + S2_ },
            { id: "3.30.3", title: "Power-split or series-parallel hybrid", contentKey: "Power-split or series-parallel hybrid" + HYBRID + S2_ },
            { id: "3.30.4", title: "Series hybrid", contentKey: "Series hybrid" + HYBRID + S2_ },
            { id: "3.30.5", title: "Plug-in hybrid electric vehicle (PHEV)", contentKey: "Plug-in hybrid electric vehicle (PHEV)" + HYBRID + S2_ },
          ],
        },
        {
          id: "3.31",
          title: "Introduction to alternative fuel and emission less vehicles",
          contentKey: "Introduction to alternative fuel and emission less vehicles",
          subSubtopics: [
            { id: "3.31.1", title: "Compressed Natural Gas (CNG)", contentKey: "Compressed Natural Gas (CNG)" + ALT + S2 },
            { id: "3.31.2", title: "Liquefied Natural Gas (LNG)", contentKey: "Liquefied Natural Gas (LNG)" + ALT + S2 },
            { id: "3.31.3", title: "Hydrogen", contentKey: "Hydrogen" + ALT + S2 },
            { id: "3.31.4", title: "Ethanol Fuel", contentKey: " Ethanol Fuel" + ALT + S2 },
            { id: "3.31.5", title: "Electric vehicles & Solar energy cars", contentKey: "Electric vehicles & Solar energy cars" + ALT + S2 },
          ],
        },
        {
          id: "3.32",
          title: "Usage of Diagnostic scanner",
          contentKey: "Usage of Diagnostic scanner" + S2_,
          subSubtopics: [
            { id: "3.32.1", title: "Fault diagnosing and interpreting codes", contentKey: "Fault diagnosing and interpreting codes" + DIAG + S2 },
            { id: "3.32.2", title: "Electrical circuit checking and repairing", contentKey: "Electrical circuit checking and repairing" + DIAG + S2 },
            { id: "3.32.3", title: "Trouble shooting of vehicle electrical system", contentKey: "Trouble shooting of vehicle electrical system" + DIAG + S2 },
          ],
        },
      ],
    },
    {
      id: "4",
      title: "Heating, Ventilating and Air Conditioning system",
      subtopics: [
        {
          id: "4.1",
          title: "Cooling system",
          contentKey: "Cooling system" + S2_,
          subSubtopics: [
            { id: "4.1.1", title: "Basic Function of HVAC system", contentKey: "Basic Function of HVAC system" + S2_ },
            { id: "4.1.2", title: "Components of cooling system", contentKey: "Components of cooling system" + S2_ },
            { id: "4.1.3", title: "AC cooling fan", contentKey: "AC cooling fan" + S2_ },
            { id: "4.1.4", title: "AC blower control regulator", contentKey: "AC blower control regulator" + S2_ },
            { id: "4.1.5", title: "Flap control motor", contentKey: "Flap control motor" + S2_ },
            { id: "4.1.6", title: "Condenser", contentKey: " Condenser" + S2_ },
            { id: "4.1.7", title: "Expansion valve", contentKey: " Expansion valve" + S2_ },
            { id: "4.1.8", title: "Evaporator coil", contentKey: " Evaporator coil" + S2_ },
            { id: "4.1.9", title: "Thermostat", contentKey: "Thermostat" + S2_ },
            { id: "4.1.10", title: "AC and heater circuits", contentKey: "Ac and heater circuits" + S2_ },
            { id: "4.1.11", title: "Construction and types of compressor", contentKey: "Construction and types of compressor" + S2_ },
            { id: "4.1.12", title: "Types of refrigerants", contentKey: "Types of refrigerants" + S2_ },
            { id: "4.1.13", title: "Humidity sensor", contentKey: "Humidity sensor" + S2_ },
            { id: "4.1.14", title: "Internal temperature sensor", contentKey: "Internal temperature sensor" + S2_ },
            { id: "4.1.15", title: "Evaporator temperature sensor", contentKey: "Evaporator temperature sensor" + S2_ },
            { id: "4.1.16", title: "Refrigerant temperature sensor", contentKey: "Refrigerant temperature sensor" + S2_ },
            { id: "4.1.17", title: "Refrigerant pressure sensor", contentKey: "Refrigerant pressure sensor" + S2_ },
            { id: "4.1.18", title: "Air control flap motors", contentKey: "Air control flap motors" + S2_ },
          ],
        },
        {
          id: "4.2",
          title: "Heating system",
          contentKey: "Heating system" + S2_,
          subSubtopics: [
            { id: "4.2.1", title: "Components of heating system", contentKey: "Components of heating system" + HEAT + S2 },
            { id: "4.2.2", title: "Working of heating system", contentKey: "Working of heating system" + HEAT + S2 },
          ],
        },
        { id: "4.3", title: "Auto temperature control of vehicle", contentKey: "Auto temperature control of vehicle" + S2_ },
        { id: "4.4", title: "Seat heating and cooling system", contentKey: "Seat heating and cooling system" + S2_ },
        { id: "4.5", title: "Cool box (fridge) system", contentKey: "Cool box (fridge) system" + S2_ },
        { id: "4.6", title: "Automatic climate control system", contentKey: "Automatic climate control system" + S2_ },
        { id: "4.7", title: "Side view mirror heating system", contentKey: "Side view mirror heating system" + S2_ },
        { id: "4.8", title: "Wind screen and rear screen heating system", contentKey: "Wind screen and rear screen heating system" + S2_ },
        { id: "4.9", title: "Steering heating system", contentKey: "Steering heating system" + S2_ },
      ],
    },
    {
      id: "5",
      title: "Technical Drawing - II",
      subtopics: [
        { id: "5.1", title: "Drawing of auto start system of car", contentKey: "Drawing of auto start system of car" + S2 },
        { id: "5.2", title: "Drawing of engine control unit of car", contentKey: "Drawing of engine control unit of car" + S2 },
        { id: "5.3", title: "Drawing of security system of car", contentKey: "Drawing of security system of car" + S2 },
        { id: "5.4", title: "Completing car wiring diagram", contentKey: "Completing car wiring diagram" + S2 },
        { id: "5.5", title: "Drawing of key type & keyless entry system of car", contentKey: "Drawing of key type & keyless entry system of car" + S2 },
        { id: "5.6", title: "Drawing of auto door lock system of car", contentKey: "Drawing of auto door lock system of car" + S2 },
        { id: "5.7", title: "Drawing of Anti-lock braking circuit", contentKey: "Drawing of Anti-lock braking circuit" + S2 },
        { id: "5.8", title: "Drawing of Air conditioning circuit", contentKey: "Drawing of Air conditioning circuit" + S2 },
      ],
    },
    {
      id: "6",
      title: "Technical Mathematics - II",
      subtopics: [
        { id: "6.1", title: "Area and circumference of circle, triangle, square, rectangle, trapezium and compound shapes", contentKey: "Area and circumference of circle, triangle, square, rectangle, trapezium and compound shapes(Theory)" },
        { id: "6.2", title: "Ohm's Law, drop voltage in Series and parallel circuit", contentKey: "Calculation under Ohm\u2019s Law, drop voltage in Series and parallel circuit(Theory)" },
        { id: "6.3", title: "Electrical work, electrical power and battery capacity", contentKey: "Calculation of Electrical work, electrical power and battery capacity(Theory)" },
      ],
    },
    {
      id: "7",
      title: "Industrial tour",
      subtopics: [{ id: "7.1", title: "Industrial tour", contentKey: "Industrial tour(Theory)" }],
    },
    {
      id: "8",
      title: "Functional English",
      subtopics: [{ id: "8.1", title: "Functional English", contentKey: "Functional English(Theory)" }],
    },
    {
      id: "9",
      title: "Work Ethics",
      subtopics: [{ id: "9.1", title: "Work Ethics", contentKey: "Work Ethics(Theory)" }],
    },
  ],
};

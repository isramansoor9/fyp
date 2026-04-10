import { NextResponse } from "next/server";

/**
 * Course 1 TOC matches course1.pdf:
 * First: THEORY (7 topics), then: PRACTICAL (9 topics).
 * Subtopic titles are content keys used for /api/course1/content lookup.
 */
interface Subtopic {
  id: string;
  title: string;
}

interface TopicGroup {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

interface TocResponse {
  theoryTopics: TopicGroup[];
  practicalTopics: TopicGroup[];
}

const COURSE1_TOC: TocResponse = {
  theoryTopics: [
    {
      id: "T1",
      title: "Basic Knowledge",
      subtopics: [
        { id: "T1.1", title: "Introduction to hand tools and their use" },
        { id: "T1.2", title: "Measuring Introductions" },
        { id: "T1.3", title: "Safety Precautions" },
        { id: "T1.4", title: "Basic electricity" },
      ],
    },
    {
      id: "T2",
      title: "Bench work",
      subtopics: [
        { id: "T2.1", title: "Filing" },
        { id: "T2.2", title: "Drilling" },
        { id: "T2.3", title: "Sawing" },
        { id: "T2.4", title: "Fitting" },
      ],
    },
    {
      id: "T3",
      title: "Battery",
      subtopics: [
        { id: "T3.1", title: "Purpose of Battery(Theory)" },
        { id: "T3.2", title: "Principle of Battery(Theory)" },
        { id: "T3.3", title: "Function of Battery(Theory)" },
        { id: "T3.4", title: "Construction of Battery(Theory)" },
      ],
    },
    {
      id: "T4",
      title: "Starting System",
      subtopics: [
        { id: "T4.1", title: "Purpose of Starting System(Theory)" },
        { id: "T4.2", title: "Principle of Starting System(Theory)" },
        { id: "T4.3", title: "Function of Starting System(Theory)" },
        { id: "T4.4", title: "Construction of Starting System (Theory)" },
      ],
    },
    {
      id: "T5",
      title: "Charging System",
      subtopics: [
        { id: "T5.1", title: "Purpose of Charging System (Theory)" },
        { id: "T5.2", title: "Principle of Charging System (Theory)" },
        { id: "T5.3", title: "Function of Charging System (Theory)" },
        { id: "T5.4", title: "Construction of Charging System (Theory)" },
      ],
    },
    {
      id: "T6",
      title: "Ignition System",
      subtopics: [
        { id: "T6.1", title: "Purpose of Ignition System (Theory)" },
        { id: "T6.2", title: "Principle of Ignition System (Theory)" },
        { id: "T6.3", title: "Function of Ignition System (Theory)" },
        { id: "T6.4", title: "Construction of Ignition System (Theory)" },
        { id: "T6.5", title: "Types of Ignition System (Theory)" },
      ],
    },
    {
      id: "T7",
      title: "Electrical and Electronic Devices",
      subtopics: [
        {
          id: "T7.1",
          title:
            "Function and Construction of Various Lights, switches, and fuses(Theory)",
        },
        { id: "T7.2", title: "Horn, Wiper(Theory)" },
        {
          id: "T7.3",
          title: "Instrument panel lights and gauges(Theory)",
        },
      ],
    },
  ],
  practicalTopics: [
    {
      id: "P1",
      title: "Basic",
      subtopics: [
        { id: "P1.1", title: "Filing" },
        { id: "P1.2", title: "Marking(Practical)" },
        { id: "P1.3", title: "Sawing" },
        { id: "P1.4", title: "Drilling" },
        { id: "P1.5", title: "Threading(Practical)" },
      ],
    },
    {
      id: "P2",
      title: "Measuring",
      subtopics: [
        { id: "P2.1", title: "Steel foot rule(Practical)" },
        { id: "P2.2", title: "Vernier caliper(Practical)" },
        { id: "P2.3", title: "Micrometer(Practical)" },
        { id: "P2.4", title: "Dial gauge(Practical)" },
        { id: "P2.5", title: "Feeler gauge(Practical)" },
      ],
    },
    {
      id: "P3",
      title: "Basics of Electrician",
      subtopics: [
        {
          id: "P3.1",
          title: "Introduction to Fasteners and materials(Practical)",
        },
        { id: "P3.2", title: "Demonstration with magnet Box(Practical)" },
        {
          id: "P3.3",
          title:
            "Insulation removal, connecting wires tapping, sleeving, connecting thimbles(Practical)",
        },
        { id: "P3.4", title: "Marking jumper wires and test lamp(Practical)" },
        {
          id: "P3.5",
          title:
            "Use of AVO meter, Use of Ampere and voltmeters in series and parallel circuit, checking voltage drop(Practical)",
        },
        {
          id: "P3.6",
          title:
            "Soldering Exercises: Fix Joint, eye Joint, and lap joint etc(Practical)",
        },
      ],
    },
    {
      id: "P4",
      title: "Battery",
      subtopics: [
        { id: "P4.1", title: "Cautions for battery service (Practical)" },
        {
          id: "P4.2",
          title: "Preparation of Electrolyte(Battery) (Practical)",
        },
        { id: "P4.3", title: "Checking Specific gravity(Battery)(Practical)" },
        { id: "P4.4", title: "Battery charging(Practical)" },
        { id: "P4.5", title: "Battery testing (Practical)" },
        {
          id: "P4.6",
          title: "Analysis and troubleshooting of Battery (Practical)",
        },
        { id: "P4.7", title: "Battery removing and replacing(Practical)" },
        { id: "P4.8", title: "Care of Batteries in stock(Practical)" },
        { id: "P4.9", title: "Making terminals of battery(Practical)" },
        { id: "P4.10", title: "Dry batteries(Practical)" },
      ],
    },
    {
      id: "P5",
      title: "Starting System",
      subtopics: [
        {
          id: "P5.1",
          title: "Trouble shooting of Starting System (Practical)",
        },
        {
          id: "P5.2",
          title: "Specifications of Starting System (Practical)",
        },
        {
          id: "P5.3",
          title: "Starting system circuit on vehicle (Practical)",
        },
        {
          id: "P5.4",
          title:
            "Checking, removal and installation of Starting System (Practical)",
        },
        {
          id: "P5.5",
          title: "Disassembly of Starting System (Practical)",
        },
        {
          id: "P5.6",
          title: "Identification of parts of Starting System (Practical)",
        },
        {
          id: "P5.7",
          title:
            "Complete checking and inspection of all of Starting System (Practical)",
        },
        {
          id: "P5.8",
          title:
            "components according to workshop manual of Starting System (Practical)",
        },
        { id: "P5.9", title: "Assembling of starting motor (Practical)" },
        {
          id: "P5.10",
          title: "Performance tests of motor on test bench (Practical)",
        },
      ],
    },
    {
      id: "P6",
      title: "Charging system",
      subtopics: [
        {
          id: "P6.1",
          title: "Trouble shooting of Charging system (Practical)",
        },
        {
          id: "P6.2",
          title: "Specifications of Charging system (Practical)",
        },
        {
          id: "P6.3",
          title: "Charging system checking on vehicle (Practical)",
        },
        {
          id: "P6.4",
          title: "Fan belt adjusting of Charging system(Practical)",
        },
        { id: "P6.5", title: "Dismantling alternator (Practical)" },
        {
          id: "P6.6",
          title: "Parts identification of Charging system(Practical)",
        },
        {
          id: "P6.7",
          title:
            "Complete inspection of parts of Charging system according to workshop manual (Practical)",
        },
        {
          id: "P6.8",
          title:
            "Replacing carbon brush and bearing of Charging system (Practical)",
        },
        {
          id: "P6.9",
          title: "Diode testing of Charging system (Practical)",
        },
        {
          id: "P6.10",
          title: "Assembling Alternator of Charging system (Practical)",
        },
        {
          id: "P6.11",
          title:
            "Double unit voltage Regulator of Charging system (Practical)",
        },
        {
          id: "P6.12",
          title:
            "Identifying connections and making circuits of Charging system (Practical)",
        },
        {
          id: "P6.13",
          title: "Installing IC regulators (Practical)",
        },
      ],
    },
    {
      id: "P7",
      title: "Ignition System",
      subtopics: [
        {
          id: "P7.1",
          title: "Trouble shooting of Ignition System (Practical)",
        },
        {
          id: "P7.2",
          title:
            "Spark test, inspection of high tension leads of Ignition System (Practical)",
        },
        { id: "P7.3", title: "Spark plug fouling study (Practical)" },
        { id: "P7.4", title: "Ignition coil checking (Practical)" },
        { id: "P7.5", title: "Ignition circuit checking (Practical)" },
        {
          id: "P7.6",
          title: "C.B Point replacing and gap adjusting (Practical)",
        },
        {
          id: "P7.7",
          title: "Setting Ignition timing of Ignition System (Practical)",
        },
        {
          id: "P7.8",
          title: "Checking air gap and pick up coil (Practical)",
        },
        {
          id: "P7.9",
          title:
            "Dismantling, checking and fitting distributor (Practical)",
        },
        {
          id: "P7.10",
          title:
            "Fitting C.B point and condenser and starting coil on motorcycle (Practical)",
        },
      ],
    },
    {
      id: "P8",
      title: "Wiring Circuits on Wiring Board",
      subtopics: [
        { id: "P8.1", title: "Reading wiring diagrams(Practical)" },
        { id: "P8.2", title: "Making thimble connectors(Practical)" },
        {
          id: "P8.3",
          title: "Color codes of Wiring Circuits on Wiring Board(Practical)",
        },
        { id: "P8.4", title: "Head lamp circuit with relay(Practical)" },
        { id: "P8.5", title: "Aiming headlights(Practical)" },
        { id: "P8.6", title: "Parking brake circuit(Practical)" },
        { id: "P8.7", title: "Hazard warning circuit(Practical)" },
        { id: "P8.8", title: "Indicator circuit(Practical)" },
        { id: "P8.9", title: "Brake light circuit(Practical)" },
        { id: "P8.10", title: "Reverse gear light circuits(Practical)" },
        { id: "P8.11", title: "Door and roof light circuit(Practical)" },
        { id: "P8.12", title: "Horn circuit and adjustment(Practical)" },
        { id: "P8.13", title: "Fuel gauge circuit(Practical)" },
        { id: "P8.14", title: "Oil pressure light circuit(Practical)" },
        { id: "P8.15", title: "Trunk and hood light(Practical)" },
        { id: "P8.16", title: "Temperature gauge circuit(Practical)" },
        {
          id: "P8.17",
          title: "Brake fluid level light circuit(Practical)",
        },
        { id: "P8.18", title: "Power window circuit(Practical)" },
        {
          id: "P8.19",
          title: "Wind shield and wiper motor circuit(Practical)",
        },
        { id: "P8.20", title: "Electric Fan circuit(Practical)" },
        { id: "P8.21", title: "Glow plug circuit(Practical)" },
        {
          id: "P8.22",
          title: "Electrical shut off valve circuit(Practical)",
        },
        { id: "P8.23", title: "Radio and speaker circuit(Practical)" },
        {
          id: "P8.24",
          title: "Car air conditioning and heating system wiring(Practical)",
        },
      ],
    },
    {
      id: "P9",
      title: "Work ethics",
      subtopics: [{ id: "P9.1", title: "Work ethics (Practical)" }],
    },
  ],
};

export async function GET() {
  return NextResponse.json(COURSE1_TOC);
}

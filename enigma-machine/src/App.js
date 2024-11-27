import React, { useState, useEffect } from "react";
import './App.css'

let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let rotor1 = shuffle([...alphabet]); // Randomized mappings for rotor1
let rotor2 = shuffle([...alphabet]); // Randomized mappings for rotor2
let rotor3 = shuffle([...alphabet]); // Randomized mappings for rotor3
let rotation1 = 0;
let rotation2 = 0;

const COLORS = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F6", "#33FFF6", "#FFC133", "#B633FF", "#33FFB6", "#FF5733"];

// Shuffle function to randomize rotor mappings
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Create a reflector with reversible mappings
function createReflector() {
  const shuffled = shuffle([...alphabet]); // Shuffle a copy of the alphabet
  const reflector = {};
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      const char1 = shuffled[i];
      const char2 = shuffled[i + 1];
      reflector[char1] = char2;
      reflector[char2] = char1;
    }
  }
  return reflector;
}

// Rotate rotor mappings
function rotateRotor(rotor) {
  const shifted = rotor.slice(1).concat(rotor[0]); // Shift the rotor left
  return shifted;
}

// Main App Component
function App() {
  const [rotor1State, setRotor1State] = useState(rotor1);
  const [rotor2State, setRotor2State] = useState(rotor2);
  const [rotor3State, setRotor3State] = useState(rotor3);
  const [output, setOutput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [selectedPin, setSelectedPin] = useState(null);
  const [pinMappings, setPinMappings] = useState({});
  const [mappingColours, setMappingColours] = useState({});

  const reflector = createReflector(); // Initialize reflector

  const handlePinClick = (char) => {

    if(Object.keys(pinMappings).length / 2 >= 10 && !pinMappings[char])
    {
      alert("Only 10 combinations allowed!");
      return;
    }

    if (selectedPin === char) {
      // Deselect current pin
      setSelectedPin(null);
    } else if (selectedPin) {
      // Create or remove mapping
      const updatedMappings = { ...pinMappings };
      const updatedColours = { ...mappingColours};

      if (pinMappings[selectedPin] === char) {
        // Remove existing mapping
        delete updatedMappings[selectedPin];
        delete updatedMappings[char];
        delete updatedColours[selectedPin];
        delete updatedColours[char];
      } 
      else {
        // Create a new mapping

        const colour = COLORS[Object.keys(updatedColours).length / 2];

        updatedMappings[selectedPin] = char;
        updatedMappings[char] = selectedPin;
        updatedColours[selectedPin] = colour;
        updatedColours[char] = colour;
      }

      setPinMappings(updatedMappings);
      setMappingColours(updatedColours);
      setSelectedPin(null);
    } else {
      // Select a new pin
      setSelectedPin(char);
    }
  };

  const encryptCharacter = (key) => {
    // Check direct mapping
    const directMapped = pinMappings[key] || key;

    // Step through rotors
    const step1 = rotor1State[alphabet.indexOf(directMapped)];
    const step2 = rotor2State[alphabet.indexOf(step1)];
    const step3 = rotor3State[alphabet.indexOf(step2)];

    // Reflector step
    const reflected = reflector[step3] || step3;

    // Back through rotors
    const reverse3 = alphabet[rotor3State.indexOf(reflected)];
    const reverse2 = alphabet[rotor2State.indexOf(reverse3)];
    const reverse1 = alphabet[rotor1State.indexOf(reverse2)];

    return reverse1;
  };

  // Handle key press for input
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toUpperCase();
      if (alphabet.includes(key)) {
        
        const encrypted = encryptCharacter(key);

        setOutput(`Input: ${key} -> Output: ${encrypted}`);

        setTextOutput((prev) => prev + encrypted);

        // Rotate rotors
        setRotor1State((prev) => rotateRotor(prev));
        rotation1++;
        if (rotation1 % 26 === 0) {
          setRotor2State((prev) => rotateRotor(prev));
          rotation2++;
          if (rotation2 % 26 === 0) {
            setRotor3State((prev) => rotateRotor(prev));
          }
        }

        const outputKeyButton = document.querySelector(`.keybutton[data-key="${encrypted}"]`);
        if(outputKeyButton){
          outputKeyButton.classList.add("active");
          setTimeout(() => outputKeyButton.classList.remove("active"), 500);
        }
      }
    };

    // Attach the event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [rotor1State, rotor2State, rotor3State, reflector]);

  // Display rotor configuration
  function printRotor(rotor) {
    return rotor.slice(0, 3).map((char, index) => (
      <span key={index} style={{ marginRight: "5px" }}>
        {char}
      </span>
    ));
  }

  return (
    <div className="App" style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Enigma Machine</h1>
      <p>Type to create an encrypted message</p>
      <div className="rotor" style={{ margin: "20px 0" }}>
        <h3>Rotor 1</h3>
        {printRotor(rotor1State)}
      </div>
      <div className="rotor" style={{ margin: "20px 0" }}>
        <h3>Rotor 2</h3>
        {printRotor(rotor2State)}
      </div>
      <div className="rotor"style={{ margin: "20px 0" }}>
        <h3>Rotor 3</h3>
        {printRotor(rotor3State)}
      </div>
      <div style={{ marginTop: "30px", fontSize: "1.5rem", color: "blue" }}>
        {output}
      </div>

      <div>
        <h3>Encrypted message</h3>
        <div className="text-output" style={{ marginTop: "20px", fontSize: "1.2rem", color: "green" }}>
          <span>
            <p>{textOutput}</p>
          </span>
        </div>
      </div>
      

      <div className="keyboard">
        {alphabet.map((char) => (
          <div className="keybutton" 
          key={char} 
          data-key={char}
          style={{ margin: "5px", border: "1px solid black", padding: "10px" }}
          >
            {char}
          </div>
        ))}
      </div>

      <div>
        <h3>Click two pins to create direct mappings</h3>
        <h3>Click them each again to remove direct mappings</h3>
        <div className="direct-pins">
          {alphabet.map((char) => (
            <button 
            key={char}
            className={`pin ${selectedPin === char ? "active" : ""} ${
              pinMappings[char] ? "mapped" : ""
            }`}
            style={{backgroundColor: pinMappings[char] ? mappingColours[char] : "#f0f0f0"}}
            onClick={() => handlePinClick(char)}
            >
              {char}
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default App;
